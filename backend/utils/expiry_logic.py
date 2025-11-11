import cv2
import numpy as np
# requests는 외부 API 호출에 필요할 수 있으므로 유지
import requests
import json
from datetime import datetime, timedelta
from ml.train import predict_item_category_and_expiry
# PaddleOCR 임포트
# from paddleocr import PaddleOCR # app.py에서 ocr 인스턴스를 전달받으므로 이 파일에서 직접 임포트 및 초기화하지 않음

# 기존 extract_text_from_image 함수를 PaddleOCR을 사용하도록 변경
def extract_text_from_image(image_path, ocr_instance): # ocr_instance 인자 추가
    """
    Extract text from image using PaddleOCR instance
    """
    # PaddleOCR은 이미지 경로를 직접 받음
    result = ocr_instance.ocr(image_path, cls=True)

    # 텍스트 추출 (log.md 예시 참고)
    extracted_texts = [line[1][0] for res in result for line in res]

    return extracted_texts

def parse_receipt_items(ocr_texts):
    """
    Parse the OCR text to identify individual items on the receipt
    """
    items = []
    
    # PaddleOCR에서 추출된 텍스트는 이미 리스트 형태이므로,
    # 각 텍스트가 항목으로 유효한지 확인하고 추가
    for text in ocr_texts:
        # 항목을 나타내는 패턴을 찾습니다 (문자와 숫자 포함)
        # 이 로직은 PaddleOCR이 이미 라인 단위로 추출했으므로,
        # 각 라인이 실제 항목인지 판단하는 로직으로 변경될 수 있습니다.
        # 일단은 비어있지 않은 모든 라인을 항목으로 간주
        item_name = text.strip()
        if item_name:
            items.append(item_name)
    
    return items

def calculate_expiry_date(predicted_expiry_days):
    """
    예측된 유통기한 일수를 기반으로 유통기한을 계산합니다
    유통기한을 datetime 객체로 반환합니다
    """
    today = datetime.now()
    expiry_date = today + timedelta(days=predicted_expiry_days)
    
    return expiry_date

# process_receipt_image 함수 수정
def process_receipt_image(image_path, model_path, ocr_instance): # ocr_instance 인자 추가
    """
    영수증 이미지를 처리하는 주요 함수:
    1. OCR을 사용하여 텍스트 추출 (PaddleOCR 사용)
    2. 개별 항목 파싱
    3. AI 모델을 사용하여 각 항목 분류
    4. 유통기한 계산
    5. 데이터베이스 삽입을 위한 포맷
    """
    # 1단계: OCR을 사용하여 이미지에서 텍스트 추출 (PaddleOCR 사용)
    ocr_texts = extract_text_from_image(image_path, ocr_instance) # ocr_instance 전달
    
    # 2단계: OCR 텍스트에서 개별 항목 파싱
    receipt_items = parse_receipt_items(ocr_texts)
    
    # 3단계: 각 항목을 분류하고 AI 모델을 사용하여 유통기한 예측
    processed_items = []
    for item in receipt_items:
        prediction = predict_item_category_and_expiry(model_path, item)
        
        # 4단계: 유통기한 계산
        expiry_date = calculate_expiry_date(prediction['expiry_days'])
        
        # 5단계: 데이터베이스 삽입을 위한 포맷
        db_item = {
            'item_name': prediction['item_name'],
            'category': prediction['category'],
            'predicted_expiry_days': prediction['expiry_days'],
            'expiry_date': expiry_date.strftime('%Y-%m-%d'),
            'purchase_date': datetime.now().strftime('%Y-%m-%d'),
            'status': 'active'  # 유통기한까지 처음에는 활성 상태
        }
        
        processed_items.append(db_item)
    
    return processed_items
