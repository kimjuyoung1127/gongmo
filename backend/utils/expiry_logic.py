import cv2
import numpy as np
import requests
import json
import csv
from datetime import datetime, timedelta
from ml.train import predict_item_category_and_expiry

# --- 카테고리 매핑 헬퍼 함수 ---
_category_map_by_name_cache = None

def _load_category_map_by_name():
    """
    categories_proper.csv 파일을 읽어 카테고리 이름과 ID를 매핑하는 딕셔너리를 생성하고 캐싱합니다.
    """
    category_map = {}
    try:
        # 절대 경로를 사용하여 파일 찾기
        current_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(current_dir, '..', 'data', 'categories_proper.csv')
        
        with open(csv_path, mode='r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            for idx, row in enumerate(reader):
                # 인덱스를 기반으로 ID 생성 (1부터 시작)
                category_id = idx + 1
                category_map[row['category_name_kr']] = {
                    "id": category_id,
                    "code": row['category_code']
                }
        print(f"Info: {len(category_map)}개의 카테고리를 {csv_path}에서 성공적으로 로드했습니다.")
        return category_map
    except FileNotFoundError:
        print(f"Warning: {csv_path} 파일을 찾을 수 없습니다. 카테고리 ID 매핑이 비활성화됩니다.")
        return {}
    except Exception as e:
        print(f"Error: 카테고리 파일 로드 중 오류 발생: {e}")
        return {}

def _get_category_id_by_name(category_name: str):
    """
    카테고리 이름을 기반으로 ID를 조회합니다.
    """
    global _category_map_by_name_cache
    if _category_map_by_name_cache is None:
        _category_map_by_name_cache = _load_category_map_by_name()
    
    category_info = _category_map_by_name_cache.get(category_name)
    return category_info['id'] if category_info else None

# --- OCR 및 파싱 함수 ---

def extract_text_from_image(image_path, ocr_instance):
    """
    Extract text from image using PaddleOCR instance
    """
    result = ocr_instance.ocr(image_path, cls=True)
    if not result or not result[0]:
        return []
    extracted_texts = [line[1][0] for line in result[0]]
    return extracted_texts

def parse_receipt_items(ocr_texts):
    """
    Parse the OCR text to identify individual items on the receipt
    """
    items = []
    for text in ocr_texts:
        item_name = text.strip()
        if item_name:
            items.append(item_name)
    return items

def calculate_expiry_date(predicted_expiry_days):
    """
    예측된 유통기한 일수를 기반으로 유통기한을 계산합니다
    """
    today = datetime.now()
    expiry_date = today + timedelta(days=predicted_expiry_days)
    return expiry_date

# --- 메인 처리 함수 ---

def process_receipt_image(image_path, model_path, ocr_instance):
    """
    영수증 이미지를 처리하는 주요 함수:
    1. OCR을 사용하여 텍스트 추출 (PaddleOCR 사용)
    2. 개별 항목 파싱
    3. AI 모델을 사용하여 각 항목 분류 및 category_id 매핑
    4. 유통기한 계산
    5. 데이터베이스 삽입을 위한 포맷
    """
    ocr_texts = extract_text_from_image(image_path, ocr_instance)
    receipt_items = parse_receipt_items(ocr_texts)
    
    processed_items = []
    for item in receipt_items:
        prediction = predict_item_category_and_expiry(model_path, item)
        if not prediction:
            continue
            
        expiry_date = calculate_expiry_date(prediction['expiry_days'])
        
        # 카테고리 이름을 사용하여 ID 조회
        category_id = _get_category_id_by_name(prediction['category'])
        
        db_item = {
            'item_name': prediction['item_name'],
            'category': prediction['category'],
            'category_id': category_id, # category_id 추가
            'predicted_expiry_days': prediction['expiry_days'],
            'expiry_date': expiry_date.strftime('%Y-%m-%d'),
            'purchase_date': datetime.now().strftime('%Y-%m-%d'),
            'status': 'active'
        }
        
        processed_items.append(db_item)
    
    return processed_items