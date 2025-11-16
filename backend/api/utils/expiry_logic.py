import requests
import json
import csv
import os
from datetime import datetime, timedelta

# --- 카테고리 매핑 헬퍼 함수 (DB 기반) ---
_category_map_by_code_cache = None
_supabase_client = None

def set_supabase_client_for_categories(supabase_client):
    """카테고리 조회를 위한 Supabase 클라이언트 설정"""
    global _supabase_client
    _supabase_client = supabase_client

def _load_category_map_from_db():
    """
    Supabase DB에서 카테고리 정보를 로드하여 캐싱합니다.
    """
    if not _supabase_client:
        print("Warning: Supabase 클라이언트가 설정되지 않았습니다. 기본 카테고리 매핑을 사용합니다.")
        return {'기타': {'id': 37, 'code': 'ETC', 'expiry_days': 7}}  # ETC ID 기본값
    
    try:
        # categories 테이블에서 모든 카테고리 조회
        response = _supabase_client.table('categories').select('*').execute()
        
        if response.data:
            category_map = {}
            for row in response.data:
                category_map[row['category_name_kr']] = {
                    "id": row['id'],
                    "code": row['category_code'],
                    "expiry_days": row['default_expiry_days']
                }
            print(f"Info: DB에서 {len(category_map)}개의 카테고리를 성공적으로 로드했습니다.")
            return category_map
        else:
            print("Warning: DB에서 카테고리를 찾을 수 없습니다. 기본 매핑을 사용합니다.")
            return {'기타': {'id': 37, 'code': 'ETC', 'expiry_days': 7}}
            
    except Exception as e:
        print(f"Error: DB 카테고리 로드 중 오류 발생: {e}")
        return {'기타': {'id': 37, 'code': 'ETC', 'expiry_days': 7}}

def _get_category_info_by_name(category_name: str):
    """
    카테고리 이름을 기반으로 ID, 코드, 유통기한을 조회합니다.
    """
    global _category_map_by_code_cache
    if _category_map_by_code_cache is None:
        _category_map_by_code_cache = _load_category_map_from_db()
    
    category_info = _category_map_by_code_cache.get(category_name)
    if category_info:
        return category_info
    else:
        # 기본값으로 '기타' 카테고리 반환
        return {'id': 37, 'code': 'ETC', 'expiry_days': 7}

def _get_category_id_by_name(category_name: str):
    """기존 호환성을 위한 wrapper 함수"""
    category_info = _get_category_info_by_name(category_name)
    return category_info['id']

def _get_category_expiry_days(category_name: str):
    """카테고리 유통기한 조회"""
    category_info = _get_category_info_by_name(category_name)
    return category_info['expiry_days']

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
    print(f"[DEBUG] OCR 텍스트 추출 완료, 텍스트 수: {len(ocr_texts)}")
    receipt_items = parse_receipt_items(ocr_texts)
    print(f"[DEBUG] 영수증 품목 파싱 완료, 품목 수: {len(receipt_items)}")
    
    processed_items = []
    for item in receipt_items:
        print(f"[DEBUG] 품목 예측 시작: {item}")
        try:
            prediction = predict_item_category_and_expiry(model_path, item)
            if not prediction:
                print(f"[DEBUG] 품목 예측 실패, 임시 결과 사용: {item}")
                prediction = {
                    'category': '기타',
                    'expiry_days': 7,
                    'item_name': item
                }
            print(f"[DEBUG] 품목 예측 성공: {prediction}")
        except Exception as e:
            print(f"[ERROR] 품목 예측 중 오류 발생: {item}, 오류: {str(e)}")
            # 임시 예측 결과 반환
            prediction = {
                'category': '기타',
                'expiry_days': 7,
                'item_name': item
            }
            print(f"[DEBUG] 임시 예측 결과 사용: {prediction}")
            
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