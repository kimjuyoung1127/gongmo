from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import tempfile
# 클로바 OCR 임포트 (PaddleOCR 제거)
import requests
import time
import base64
import re
from PIL import Image
from io import BytesIO
from utils.expiry_logic import process_receipt_image, _get_category_id_by_name
from supabase import create_client, Client
# 바코드 조회 유틸리티 함수 임포트
from utils.barcode_lookup import (
    set_supabase_client,
    get_product_info_from_db, 
    save_product_to_db,
    get_product_info_from_food_safety_korea, 
    get_product_info_from_open_food_facts, 
    get_product_info_from_food_qr
)

# .env 파일에서 환경 변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app)  # 모든 라우트에 대해 CORS 활성화

# 클로바 OCR 설정
CLOVA_OCR_API_URL = os.environ.get('CLOVA_OCR_API_URL')
CLOVA_OCR_SECRET_KEY = os.environ.get('CLOVA_OCR_SECRET_KEY')

# 클로바 OCR API 호출 함수
def call_clova_ocr(image_data):
    """
    클로바 OCR API를 호출하여 이미지에서 텍스트를 추출합니다.
    
    Args:
        image_data: 이미지 바이너리 데이터
        
    Returns:
        dict: OCR 결과 JSON 또는 None (실패 시)
    """
    try:
        print(f"[CLOVA] 클로바 OCR API 호출 시작")
        
        headers = {
            "X-OCR-SECRET": CLOVA_OCR_SECRET_KEY,
            "Content-Type": "application/json"
        }
        
        # 이미지를 Base64로 인코딩
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        data = {
            "images": [
                {
                    "format": "jpg",
                    "name": "receipt",
                    "data": image_base64
                }
            ],
            "requestId": "scan_" + str(int(time.time())),
            "version": "V2",
            "timestamp": int(time.time() * 1000)
        }
        
        print(f"[CLOVA] API 요청 준비 완료, 이미지 크기: {len(image_data)} bytes")
        
        print(f"[CLOVA] API URL: {CLOVA_OCR_API_URL}")
        print(f"[CLOVA] Headers: {headers}")
        print(f"[CLOVA] Timeout 설정: 60초")
        
        response = requests.post(CLOVA_OCR_API_URL, headers=headers, json=data, timeout=60)
        
        if response.status_code == 200:
            print(f"[CLOVA] 클로바 OCR API 호출 성공")
            return response.json()
        else:
            print(f"[CLOVA] 클로바 OCR API 오류: {response.status_code}, 응답: {response.text}")
            return None
            
    except Exception as e:
        print(f"[CLOVA] 클로바 OCR 호출 실패: {str(e)}")
        return None

def parse_clova_response_to_items(clova_response):
    """
    클로바 OCR API 응답에서 영수증 항목을 추출합니다.
    
    Args:
        clova_response: 클로바 OCR API 응답 JSON
        
    Returns:
        list: 처리된 항목 목록
    """
    try:
        items = []
        
        # 클로바 OCR 응답 구조 확인
        print(f"[CLOVA] 전체 응답 구조: {list(clova_response.keys())}")
        if 'images' not in clova_response or not clova_response['images']:
            print("[CLOVA] 응답에 이미지 데이터 없음")
            print(f"[CLOVA] 응답 전체: {clova_response}")
            return items
        
        image_data = clova_response['images'][0]
        print(f"[CLOVA] 이미지 데이터 구조: {list(image_data.keys())}")
        
        if 'fields' not in image_data:
            print("[CLOVA] 응답에 필드 데이터 없음")
            print(f"[CLOVA] 이미지 데이터 전체: {image_data}")
            return items
        
        # 전체 텍스트 추출
        full_texts = []
        for field in image_data['fields']:
            if 'inferText' in field:
                text = field['inferText'].strip()
                if text and len(text) > 1:  # 1글자 이상만 추가
                    full_texts.append(text)
        
        print(f"[CLOVA] 추출된 텍스트 목록: {full_texts}")
        
        # 영수증 항목 정교화된 수집 (확장성 고려)
        filtered_items = []
        for text in full_texts:
            if _is_valid_product_item(text):
                product_data = _create_standardized_product_data(text)
                filtered_items.append(product_data)
        
        print(f"[CLOVA] 필터링된 항목 수: {len(filtered_items)}")
        return filtered_items
        
    except Exception as e:
        print(f"[CLOVA] 응답 파싱 중 오류: {str(e)}")
        return []

def _is_valid_product_item(text):
    """
    확장성 있는 상품 항목 검증 (재고 관리 적합성 체크).
    """
    # 제외 패턴들 (재고 관리 불필요 데이터)
    exclude_patterns = [
        r'^\d+$',  # 숫자만
        r'^[.,\-+]+$',  # 기호만
        r'^[\d,\.•\*\-+\s]*$',  # 숫자, 기호만
        r'^총합계$',  # 합계
        r'^현금$',
        r'^카드$',
        r'^신용$',
        r'^수량$',
        r'^단가$',
        r'^금액$',
        r'^부가세$',
        r'^받은금액$',
        r'^거스름돈$',
        r'^점포명$',
        r'^할인금액$',
        r'^전표NO',
        r'^승인금액$',
        r'^승인번호$',
        r'^.*카드신용승인.*$',
        r'^.*기매전에.*$',
        r'^.*일시불.*$',  # 일시불 카드
        r'^.*\(\*\)$',  # 할인 표시
        r'^(NO\.|NO|No\.)?\s*\d+$',  # 번호
        r'^\d{4}[-/]?\d{2}[-/]?\d{2}$',  # 날짜
        r'^\d{1,2}:\d{2}$',  # 시간
        r'^\(\*\)$',  # 별표 표시
        r'^$',  # 빈 문자열
    ]
    
    for pattern in exclude_patterns:
        if re.match(pattern, text):
            return False
    
    # 의미 있는 텍스트: 2-20자 길이, 한글/영문/숫자 포함
    return 2 <= len(text) <= 20

def _estimate_expiry_days(item_name):
    """
    품목명을 기반으로 유통기한을 추정합니다 (간단한 규칙 기반).
    """
    # 기본 유통기한 기반 분류 (간단한 규칙)
    if any(keyword in item_name for keyword in ['우유', '요거트', '치즈', '계란']):
        return 7
    elif any(keyword in item_name for keyword in ['빵', '과자', '케이크']):
        return 14
    elif any(keyword in item_name for keyword in ['과일', '야채', '채소', '상추', '김치']):
        return 3
    elif any(keyword in item_name for keyword in ['고기', '닭', '생선', '돼지']):
        return 5
    elif any(keyword in item_name for keyword in ['라면', '면', '파스타']):
        return 180  # 가공식품
    else:
        return 10  # 기본값

def _create_standardized_product_data(text):
    """
    확장성 있는 표준화된 상품 데이터 생성.
    """
    # 상품명 정제
    item_name = text.strip()
    item_name = re.sub(r'\s+', ' ', item_name)  # 다중 공백 제거
    
    # 수량 정보 추출 (선택적)
    quantity_info = _extract_quantity_info(item_name)
    
    # 카테고리 분류 (확장성 있도록)
    category = _classify_product_category(item_name)
    
    # 유통기한 예측
    expiry_days = _estimate_expiry_days_enhanced(item_name)
    
    # 확장성 고려한 반환 구조
    return {
        'item_name': item_name,
        'category': category,
        'category_id': _get_category_id_by_name(category),
        'expiry_days': expiry_days,
        'quantity': quantity_info.get('amount'),  # 수량
        'unit': quantity_info.get('unit'),      # 단위 (g, 봉, 개 등)
        'source': 'clova_ocr',
        'confidence_high': True,  # 클로바 OCR은 높은 신뢰도
        'raw_text': text  # 원본 텍스트 보존 (디버깅용)
    }

def _extract_quantity_info(text):
    """
    상품명에서 수량 정보 추출 (확장성 있도록).
    """
    # 수량 패턴: 숫자 + 단위
    quantity_patterns = [
        r'(\d+)\s*(g|kg|ml|L|봉|개|개입|병|속|통|묶음|박스|판|세트|망|족)',
        r'(\d+)\s*(g|kg|ml|L|봉|개|개입|병|속|통|묶음|박스|판|세트|망|족)\b',
    ]
    
    for pattern in quantity_patterns:
        match = re.search(pattern, text)
        if match:
            return {
                'amount': int(match.group(1)),
                'unit': match.group(2)
            }
    
    return {'amount': 1, 'unit': '개'}  # 기본값

def _classify_product_category(item_name):
    """
    확장성 있는 카테고리 분류 (규칙 기반 + 키워드 매핑).
    """
    # 카테고리 키워드 맵 (확장 가능)
    category_keywords = {
        '채소': ['상추', '김치', '배추', '양배추', '시금치', '추부깻잎', '아욱', '적채', '돌나물', 
                '파프리카', '오이', '버섯', '파슬리', '미나리', '무', '미역', '아스파라거스'],
        '과일': ['사과', '배', '포도', '복숭아', '감귤', '수박', '배', '천도', '참외', '오렌지', '레몬', '자두', '딸기',
                '키위', '체리', '블루베리', '라임', '구스', '무화과'],
        '유제품': ['우유', '치즈', '계란', '요거트', '버터', '우유로', '크림', '생크림', '단백질', '락우', '마요네즈'],
        '정육': ['고기', '소고', '돼지고기', '닭고기', '오리고기', '치킨', '오리', '양', '돼지', '소갈비', '닭다리', '닭날개', '담가슴살', '갈비', '불고기', 
                '족발', '삼겹살', '소떡', '돈까스', '허파'],
        '해산물': ['참순대', '고등어', '연어', '갈치', '새우', '조개', '굴비', '성게', '문어', '오징어', '낙지', '전복', '아구', '미역',
                '홍합', '멸치', '가리비', '대하', '바닷가지'],
        '가공식품': ['라면', '면', '파스타', '빵', '과자', '쿠키', '초콜릿', '시리얼', '국수', '통밀', '차', '음료수', '주스', '캔디',
                '소주', '과즙', '탄산', '에너지음료', '음주'],
        '조미료': ['설탕', '간장', '고추장', '후추', '물염', '설탕물', '장아찌', '양녕장', '간장소스', '고춧가루', '식초', '올리브오일'],
        '냉동식품': ['아이스크림', '아이스']
    }
    
    item_name_lower = item_name.lower()
    
    for category, keywords in category_keywords.items():
        for keyword in keywords:
            if keyword in item_name_lower:
                return category
    
    return '기타'  # 기본 카테고리

def _estimate_expiry_days_enhanced(item_name):
    """
    개선된 유통기한 예측 (확장성 있도록).
    """
    # 상세 카테고리별 유통기한
    product_expiry_map = {
        # 채소류 (가장 짧음)
        '채소': {'기본': 3, '상추': 5, '김치': 7, '수박치': 4, '양배추': 3, '추부깻잎': 5},
        
        # 과일류
        '과일': {'기본': 5, '베리류': 7, '열대과': 14, '과일': 7, '사과': 30, '바나나': 10},
        
        # 유제품
        '유제품': {'기본': 7, '우유': 14, '계란': 30, '요거트': 21, '치즈': 30, '버터': 45},
        
        # 정육류
        '정육': {'기본': 5, '소고': 7, '돼지고기': 7, '닭고기': 5, '어류': 3, '지방고기': 14},
        
        # 해산물 (가장 짧음)
        '해산물': {'기본': 3, '어류': 3, '참순대': 3, '갈치': 3, '고등어': 3},
        
        # 가공식품 (가장 김)
        '가공식품': {'기본': 180, '라면': 365, '과자': 120, '빵': 90, '통조림': 540},
        
        # 조미료
        '조미료': {'기본': 365, '설탕': 1095, '간장': 730, '고추장': 540},
    }
    
    # 상품명 기반 예측
    item_name_lower = item_name.lower()
    
    for category, expiry_map in product_expiry_map.items():
        for keyword, days in expiry_map.items():
            if keyword in item_name_lower:
                return days
    
    return 14  # 기본 유통기한

def resize_image_for_clova(image_path, max_size=2000, quality=75):
    """
    클로바 OCR 전송을 위해 이미지를 리사이즈합니다.
    
    Args:
        image_path: 이미지 파일 경로
        max_size: 최대 크기 (픽셀)
        quality: JPEG 품질 (1-100)
        
    Returns:
        bytes: 리사이즈된 이미지 데이터
    """
    try:
        print(f"[CLOVA] 원본 이미지 로드: {image_path}")
        
        with Image.open(image_path) as img:
            # 현재 크기 확인
            original_size = img.size
            print(f"[CLOVA] 원본 크기: {original_size}")
            
            # 리사이즈 필요 여부 확인
            if max(original_size) <= max_size:
                print(f"[CLOVA] 이미 리사이즈 필요 없음")
                with open(image_path, 'rb') as f:
                    return f.read()
            
            # 비율 유지하며 리사이즈
            ratio = max_size / max(original_size)
            new_size = (int(original_size[0] * ratio), int(original_size[1] * ratio))
            
            img_resized = img.resize(new_size, Image.Resampling.LANCZOS)
            print(f"[CLOVA] 리사이즈 완료: {new_size}")
            
            # JPEG로 변환 및 압축
            output_buffer = BytesIO()
            img_resized.convert('RGB').save(output_buffer, format='JPEG', quality=quality, optimize=True)
            
            image_data = output_buffer.getvalue()
            output_buffer.close()
            
            print(f"[CLOVA] 압축 완료: {len(image_data)} bytes ({len(image_data)/1024/1024:.2f} MB)")
            
            return image_data
            
    except Exception as e:
        print(f"[CLOVA] 이미지 리사이즈 실패: {str(e)}")
        # 실패 시 원본 이미지 반환
        with open(image_path, 'rb') as f:
            return f.read()

# Supabase 클라이언트 초기화
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_ANON_KEY')  # 일단 ANON 키로 테스트
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# barcode_lookup.py에 Supabase 클라이언트 전달
if supabase:
    set_supabase_client(supabase)

# 기본 상태 확인 엔드포인트
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Flask 서버가 작동 중입니다'})

# 영수증 업로드 엔드포인트
@app.route('/upload_receipt_image', methods=['POST'])
def upload_receipt():
    """
    영수증 이미지를 수신하고, PaddleOCR 및 AI 모델을 통해 처리한 후,
    추출된 정보를 데이터베이스에 저장하는 API 엔드포인트입니다.
    """
    try:
        # Check if image file is present in the request
        if 'image' not in request.files:
            return jsonify({'status': 'error', 'message': '이미지 파일이 제공되지 않았습니다'}), 400

        image_file = request.files['image']

        # Create a temporary file to save the uploaded image
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            image_file.save(temp_file.name)
            temp_image_path = temp_file.name

        try:
            # 영수증 이미지 처리 (PaddleOCR 인스턴스 전달)
            model_path = os.environ.get('MODEL_PATH', 'models/item_classifier.pkl')
            
            # 이미지 리사이즈 후 읽기
            print("[CLOVA] 이미지 리사이즈 시작")
            resized_image_data = resize_image_for_clova(temp_image_path)
            
            print("[CLOVA] 클로바 OCR 호출 시작")
            clova_response = call_clova_ocr(resized_image_data)
            
            if not clova_response:
                raise Exception("클로바 OCR 호출 실패")
            
            print("[DEBUG] 클로바 OCR 결과 파싱 시작")
            processed_items = parse_clova_response_to_items(clova_response)
            print(f"[DEBUG] 클로바 OCR 처리 완료, 처리된 항목 수: {len(processed_items)}")

            # --- 데이터베이스 삽입 로직 수정 ---
            if supabase:
                # 1. receipts 테이블에 삽입
                # TODO: 실제 user_id는 JWT 토큰 등에서 추출해야 함. Supabase RLS 정책이 auth.uid()를 사용하므로, 클라이언트에서 인증된 사용자로 요청해야 함.
                # TODO: image_url은 Supabase Storage에 업로드 후 URL을 받아와야 함.
                # TODO: ocr_text는 PaddleOCR의 전체 텍스트를 저장할 수 있음.
                receipt_record = {
                    "store_name": "Unknown Store", # TODO: 영수증에서 가게 이름 파싱 필요
                    "image_url": None # 임시
                }
                insert_receipt_response = supabase.table('receipts').insert(receipt_record).execute()
                
                if not insert_receipt_response.data:
                    raise Exception("영수증 레코드 생성에 실패했습니다.")
                
                receipt_id = insert_receipt_response.data[0]['id']

                # 2. receipt_items 테이블에 삽입할 데이터 준비
                items_to_insert = []
                for item in processed_items:
                    items_to_insert.append({
                        "receipt_id": receipt_id,
                        "raw_text": item.get('item_name'), 
                        "clean_text": item.get('item_name'),
                        "category_id": item.get('category_id'),  # 카테고리 ID 추가
                        "expiry_days": item.get('predicted_expiry_days'),
                        "status": 'parsed'
                    })
                
                if items_to_insert:
                    supabase.table('receipt_items').insert(items_to_insert).execute()

            # 처리된 항목 반환
            return jsonify({
                'status': 'success',
                'message': f'{len(processed_items)}개 항목이 처리되고 영수증에 연결되었습니다',
                'data': processed_items
            })
        finally:
            # 임시 파일 정리
            os.unlink(temp_image_path)

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# 영수증 업로드 엔드포인트 (/upload_receipt 이름 추가)
@app.route('/upload_receipt', methods=['POST'])
def upload_receipt_v2():
    """
    영수증 이미지를 처리하고 AI 분석 결과를 반환합니다.
    프론트엔드와 표준화된 응답 형식을 사용합니다.
    """
    print("[DEBUG] upload_receipt_v2 시작")
    
    try:
        # 이미지 파일 확인
        if 'image' not in request.files:
            return jsonify({'error': '이미지 파일이 제공되지 않았습니다'}), 400

        image_file = request.files['image']

        # 임시 파일 생성
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            image_file.save(temp_file.name)
            temp_image_path = temp_file.name

        try:
            # 이미지 리사이즈 후 읽기
            print("[CLOVA] 이미지 리사이즈 시작")
            resized_image_data = resize_image_for_clova(temp_image_path)
            
            print("[CLOVA] 클로바 OCR v2 호출 시작")
            clova_response = call_clova_ocr(resized_image_data)
            
            if not clova_response:
                raise Exception("클로바 OCR v2 호출 실패")
            
            print("[DEBUG] 클로바 OCR v2 결과 파싱 시작")
            processed_items = parse_clova_response_to_items(clova_response)
            print(f"[DEBUG] 클로바 OCR v2 처리 완료, 처리된 항목 수: {len(processed_items)}")

            # receipts 테이블에 저장 (임시 비활성화)
            """
            receipt_record = {
                "store_name": "Unknown Store",
                "image_url": None  # TODO: Supabase Storage 연동 필요
            }
            
            if supabase:
                receipt_response = supabase.table('receipts').insert(receipt_record).execute()
                if not receipt_response.data:
                    raise Exception("영수증 레코드 생성 실패")
            """
            print("[DEBUG] receipts 저장 블록 건너뜀 (임시)")
            
            # 임시 receipt_id 설정
            receipt_id = 1

            # receipt_items 테이블에 저장
            items_to_insert = []
            for item in processed_items:
                    items_to_insert.append({
                        "receipt_id": receipt_id,
                        "raw_text": item.get('item_name'),
                        "clean_text": item.get('item_name'),
                        "category_id": item.get('category_id'),
                        "expiry_days": item.get('predicted_expiry_days'),
                        "status": 'parsed'
                    })
            
            if items_to_insert:
                supabase.table('receipt_items').insert(items_to_insert).execute()

            # 프론트엔드 표준 응답 형식
            response_items = []
            for idx, item in enumerate(processed_items):
                response_items.append({
                    "id": idx + 1000,  # 임시 ID
                    "raw_text": item.get('item_name'),
                    "clean_text": item.get('item_name'),
                    "pred": {
                        "category_id": item.get('category_id'),
                        "category_code": f"cat_{item.get('category_id')}",
                        "confidence": 0.85  # 임시 신뢰도
                    },
                    "expiry_days": item.get('predicted_expiry_days'),
                    "quantity_hint": item.get('quantity', 1)
                })

            return jsonify({
                'receipt_id': receipt_id,
                'image_url': None,
                'items': response_items,
                'stats': {
                    'latency_ms': 2000,
                    'engine': 'paddleocr+rules+clf_v2'
                }
            })

        finally:
            os.unlink(temp_image_path)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 바코드 조회 엔드포인트 (DB 캐싱 추가)
@app.route('/lookup_barcode', methods=['POST'])
def lookup_barcode():
    """
    바코드 번호를 받아 먼저 DB를 조회한 후, 없으면 외부 API를 통해 상품 정보를 조회합니다.
    1. DB 캐시 조회 -> 2. 외부 API 호출 -> 3. DB 저장
    """
    try:
        data = request.get_json()
        barcode = data.get('barcode')

        if not barcode:
            return jsonify({'status': 'error', 'message': '바코드 번호가 제공되지 않았습니다'}), 400

        print(f"\n--- [LOOKUP] 바코드 조회 시작: {barcode} ---")
        
        # 1. DB 캐시 먼저 조회
        product_info = get_product_info_from_db(barcode)
        if product_info:
            print(f"[LOOKUP] ✅ DB HIT: {barcode}")
            return jsonify({
                'status': 'success', 
                'message': 'DB에서 상품 정보를 성공적으로 조회했습니다', 
                'data': product_info
            }), 200
        
        print(f"[LOOKUP] ⚠️ DB MISS: {barcode} - 외부 API 호출 필요")

        # 2. DB에 없을 경우 외부 API 호출
        # 2-1. Open Food Facts API 먼저 조회 (무제한)
        product_info = get_product_info_from_open_food_facts(barcode)
        if product_info and 'error' not in product_info:
            print(f"[LOOKUP] ✅ Open Food Facts HIT: {barcode}")
            # DB에 저장하고 반환
            saved_product = save_product_to_db(barcode, product_info)
            if saved_product:
                return jsonify({
                    'status': 'success', 
                    'message': 'Open Food Facts API에서 상품 정보를 성공적으로 조회했습니다', 
                    'data': saved_product
                }), 200
        
        # 2-2. FOOD_QR API 조회
        product_info = get_product_info_from_food_qr(barcode)
        if product_info and 'error' not in product_info:
            print(f"[LOOKUP] ✅ FOOD_QR HIT: {barcode}")
            # DB에 저장하고 반환
            saved_product = save_product_to_db(barcode, product_info)
            if saved_product:
                return jsonify({
                    'status': 'success', 
                    'message': 'FOOD_QR API에서 상품 정보를 성공적으로 조회했습니다', 
                    'data': saved_product
                }), 200
        
        # 2-3. 식품안전나라 API 조회 (일일 500회 제한)
        product_info = get_product_info_from_food_safety_korea(barcode)
        if product_info and 'error' not in product_info:
            print(f"[LOOKUP] ✅ 식품안전나라 HIT: {barcode}")
            # DB에 저장하고 반환
            saved_product = save_product_to_db(barcode, product_info)
            if saved_product:
                return jsonify({
                    'status': 'success', 
                    'message': '식품안전나라 API에서 상품 정보를 성공적으로 조회했습니다', 
                    'data': saved_product
                }), 200

        # 모든 API에서 제품을 찾지 못했을 경우
        print(f"[LOOKUP] ❌ 모든 API에서 NOT FOUND: {barcode}")
        return jsonify({
            'status': 'not_found', 
            'message': '모든 API에서 해당 바코드의 상품 정보를 찾을 수 없습니다.'
        }), 404

    except Exception as e:
        print(f"[LOOKUP] Error in /lookup_barcode: {e}")
        return jsonify({
            'status': 'error',
            'message': '서버 내부 오류가 발생했습니다.'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
