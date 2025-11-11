import cv2
import numpy as np
import requests
import json
from datetime import datetime, timedelta
from ml.train import predict_item_category_and_expiry

def extract_text_from_image(image_path, clova_api_url, clova_secret_key):
    """
    Extract text from image using Naver Clova OCR API
    """
    with open(image_path, 'rb') as f:
        img_data = f.read()
    
    headers = {
        'Ocp-Apim-Subscription-Key': clova_secret_key,
        'Content-Type': 'application/octet-stream'
    }
    
    response = requests.post(clova_api_url, headers=headers, data=img_data)
    response_json = response.json()
    
    # OCR 응답에서 텍스트 추출
    extracted_texts = []
    for field in response_json.get('images', [{}])[0].get('fields', []):
        text_value = field.get('inferText', '')
        if text_value:
            extracted_texts.append(text_value)
    
    return extracted_texts

def parse_receipt_items(ocr_texts):
    """
    Parse the OCR text to identify individual items on the receipt
    """
    items = []
    
    # 간단한 접근: 항목처럼 보이는 줄을 식별합니다 (숫자와 텍스트 포함)
    for i, text in enumerate(ocr_texts):
        # 항목을 나타내는 패턴을 찾습니다 (문자와 숫자 포함)
        if any(c.isalpha() for c in text) and any(c.isdigit() for c in text):
            # 항목 이름 추출 (가격 및 수량 지표 제거)
            # 단순화된 접근 방식 - 실제 구현은 더 복잡할 수 있습니다
            item_name = text.strip()
            
            # 비어있지 않으면 항목 목록에 추가
            if item_name:
                items.append(item_name)
    
    # 실제 제품과 헤더/푸터를 식별하기 위해 추가 처리가 필요할 수 있습니다
    # 이는 데이터셋의 영수증 형식에 따라 달라집니다
    return items

def calculate_expiry_date(predicted_expiry_days):
    """
    예측된 유통기한 일수를 기반으로 유통기한을 계산합니다
    유통기한을 datetime 객체로 반환합니다
    """
    today = datetime.now()
    expiry_date = today + timedelta(days=predicted_expiry_days)
    
    return expiry_date

def process_receipt_image(image_path, model_path, clova_api_url, clova_secret_key):
    """
    영수증 이미지를 처리하는 주요 함수:
    1. OCR을 사용하여 텍스트 추출
    2. 개별 항목 파싱
    3. AI 모델을 사용하여 각 항목 분류
    4. 유통기한 계산
    5. 데이터베이스 삽입을 위한 포맷
    """
    # 1단계: OCR을 사용하여 이미지에서 텍스트 추출
    ocr_texts = extract_text_from_image(image_path, clova_api_url, clova_secret_key)
    
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

def get_clova_api_details():
    """
    환경 변수에서 네이버 Clova OCR API 세부 정보를 가져옵니다
    """
    import os
    api_url = os.getenv('CLOVA_API_URL')
    secret_key = os.getenv('CLOVA_SECRET_KEY')
    
    if not api_url or not secret_key:
        raise ValueError("CLOVA_API_URL 및 CLOVA_SECRET_KEY 환경 변수를 설정해야 합니다")
    
    return api_url, secret_key

# 예제 사용법
if __name__ == "__main__":
    # 로직 사용 방법 예시
    # Flask API 엔드포인트에 통합됩니다
    print("유통기한 로직 모듈 로드됨")