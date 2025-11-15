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
    강화된 상품 항목 검증 (실제 상품명만 추출).
    """
    text_clean = text.strip()
    
    # ===================
    # 1. 명확한 제외 패턴들
    # ===================
    exclude_patterns = [
        # 가게 정보
        r'.*식자재.*', r'.*마트.*', r'.*시장.*', r'.*STORE.*',
        r'.*supermarket.*', r'.*market.*',
        
        # 사업자 정보
        r'사업자:', r'대표자:', r'주소:', r'전화:', r'팩스:',
        r'.*\d{3}-\d{2}-\d{5}.*',  # 사업자번호
        
        # 위치 정보
        r'.*시.*', r'.*구.*', r'.*동.*', r'.*로.*', r'.*길.*\d+.*',
        
        # 날짜/시간
        r'^\d{4}[-/]?\d{2}[-/]?\d{2}$',  # 2023-06-05
        r'^\d{1,2}월.*', r'.*\d{1,2}일.*',
        r'^\d{1,2}:\d{2}$',  # 시간
        
        # 가격/금액 관련
        r'^[\d,]+원?$',  # 2,900, 17,970원
        r'^\d+$',  # 숫자만
        r'^\d{3}[-\s]?\d{2}[-\s]?\d{4}$',  # 전화번호
        r'^\d{4,}$',  # 4자리 이상 숫자 (바코드 등)
        r'^\d+[,.]?\d*$',  # 소수점 포함 숫자
        
        # 테이블 헤더
        r'^수량$', r'^단가$', r'^금액$', r'^상품명$', r'^합계$',
        r'^부가세$', r'^현금$', r'^카드$', r'^신용$', r'^결제$',
        
        # 영수증 용어
        r'매출수량:', r'면세상품입니다', r'부가세', r'계:',
        r'면세물품금액:', r'할인금액', r'거스름돈', r'받은금액',
        r'승인금액', r'승인번호', r'전표NO',
        r'.*일시불.*', r'.*카드신용승인.*', r'.*기매전에.*',
        
        # 기타 정보
        r'^\(.+\)$',  # 괄호로 둘러싸인 텍스트
        r'^.*\(\*\).*$',  # 별표 표시
        r'^HE$', r'^HCH$',  # 의미 없는 텍스트
        r'^NO\d*$', r'^\d+\)$',  # 번호
        r'^\d{1,2}개$',  # 수량만 있는 경우
        
        # 기호만
        r'^[.,\-+()*=☐✔⚠]+$',  # 기호만
        r'^$',  # 빈 문자열
    ]
    
    for pattern in exclude_patterns:
        if re.match(pattern, text_clean, re.IGNORECASE):
            return False
    
    # ===================
    # 2. 상품명 특징 기반 포함 패턴
    # ===================
    
    # 상품명 특징: *표시 + 한글/영문 + 수량/단위
    product_patterns = [
        r'^\*.+[가-힣A-Za-z].+\d+[a-zA-Z가-힣]*$',  # *깐마늘슬라이스130g
        r'^\*.+[가-힣A-Za-z].+\d+[gml개봉병통]$',  # *돼지벌집살겹살
        r'^\*.+[가-힣A-Za-z]+$',  # *파채
    ]
    
    for pattern in product_patterns:
        if re.match(pattern, text_clean):
            return True
    
    # ===================
    # 3. 상품명 기본 조건
    # ===================
    
    # 길이 체크: 2-50자 (대한민국 상품명 평균)
    if not (2 <= len(text_clean) <= 50):
        return False
    
    # 한글/영문/숫자가 포함된 의미 있는 단어
    has_meaningful_chars = bool(re.search(r'[가-힣A-Za-z0-9]', text_clean))
    if not has_meaningful_chars:
        return False
    
    # 최소 1개 이상의 한글 또는 영문 단어 포함
    has_korean = bool(re.search(r'[가-힣]', text_clean))
    has_english = bool(re.search(r'[A-Za-z]', text_clean))
    
    if not (has_korean or has_english):
        return False
    
    # 4. 상품명으로 추정되는 경우
    # 흔한 상품명 단어 포함 여부
    product_keywords = [
        '고기', '돼지', '소', '닭', '생선', '어', '김치', '시금치', '상추', '배추',
        '양파', '마늘', '파', '생강', '고추', '버섯', '오이', '가지', '당근', '무',
        '사과', '배', '포도', '바나나', '딸기', '오렌지', '레몬',
        '우유', '계란', '치즈', '요거트', '빵', '과자', '면', '라면', '파스타',
        '시리얼', '음료', '주스', '생수', '커피', '차', '술', '소주', '맥주',
        '설탕', '소금', '간장', '식초', '고추장', '케찹', '마요네즈',
        '비누', '치약', '샴푸', '린스', '화장지', '티슈',
        '슬라이스', '살겹살', '목살', '안심', '갈비', '다리', '날개', '가슴살',
        '통조림', '캔', '병', '봉', '박스', '팩', '케이스', '개입', '세트',
        'g$', 'ml$', 'L$', 'kg$', '개$', '봉$', '팩$', '박스$', '세트$'
    ]
    
    has_product_keyword = any(keyword in text_clean for keyword in product_keywords)
    return has_product_keyword

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
    DB 기반 유통기한 예측 (확장성 있도록).
    """
    # 카테고리 분류 수행
    category_name = _classify_product_category(item_name)
    
    # DB에서 해당 카테고리의 유통기한 조회
    from utils.expiry_logic import _get_category_expiry_days
    return _get_category_expiry_days(category_name)

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
    # expiry_logic.py에도 Supabase 클라이언트 전달
    from utils.expiry_logic import set_supabase_client_for_categories
    set_supabase_client_for_categories(supabase)

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

        # user_id 확인
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id가 제공되지 않았습니다'}), 400
        
        print(f"[USER] 수신된 user_id: {user_id}")

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

            # inventory 테이블에 직접 저장 (단일 테이블 구조)
            from datetime import datetime, timedelta
            inventory_items = []
            
            for item in processed_items:
                expiry_date = datetime.now().date() + timedelta(days=item.get('predicted_expiry_days', 7))
                inventory_items.append({
                    "name": item.get('item_name'),
                    "category_id": item.get('category_id'),
                    "quantity": item.get('quantity', 1),
                    "expiry_date": expiry_date.isoformat(),
                    "source_type": 'receipt',
                    "store_name": 'Unknown Store',
                    "raw_text": item.get('item_name'),
                    "purchase_date": datetime.now().date().isoformat(),
                    "user_id": user_id  # ✅ 실제 사용자 ID 적용
                })
            
            stored_inventory_items = []
            if inventory_items and supabase:
                print(f"[DEBUG] inventory 테이블 직접 저장 시작, 항목 수: {len(inventory_items)}")
                try:
                    response = supabase.table('inventory').insert(inventory_items).execute()
                    if response.data:
                        stored_inventory_items = response.data
                        print(f"[DEBUG] inventory 저장 성공, 저장된 항목 수: {len(stored_inventory_items)}")
                    else:
                        print("[DEBUG] inventory 저장 실패")
                except Exception as db_error:
                    print(f"[DEBUG] inventory 저장 실패: {str(db_error)}")
            else:
                print("[DEBUG] inventory 저장 생략 (데이터 없음)")

            # 단일 테이블 구조: 더 이상 receipt_items 불필요
            print("[DEBUG] 단일 inventory 테이블 구조로 처리 완료")

            # 단일 테이블 구조: 직접 저장된 inventory 데이터 사용
            response_items = []
            for idx, item in enumerate(stored_inventory_items):
                response_items.append({
                    "id": item['id'],  # 실제 DB ID
                    "raw_text": item['raw_text'],
                    "clean_text": item['name'],  # inventory.name 필드
                    "pred": {
                        "category_id": item['category_id'],
                        "category_code": f"cat_{item['category_id']}",
                        "confidence": 0.85  # 임시 신뢰도
                    },
                    "expiry_days": (datetime.strptime(item['expiry_date'], '%Y-%m-%d').date() - datetime.now().date()).days,
                    "quantity_hint": item['quantity']
                })

            return jsonify({
                'success': True,
                'processed_count': len(stored_inventory_items),
                'message': f'{len(stored_inventory_items)}개 품목이 재고에 저장되었습니다.'
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

# Inventory 일괄 저장 API
@app.route('/inventory/batch_add', methods=['POST'])
def batch_add_inventory():
    """
    선택된 영수증 항목들을 inventory 테이블에 일괄 저장합니다.
    """
    try:
        data = request.get_json()
        items = data.get('items', [])
        
        if not items:
            return jsonify({'error': '저장할 항목이 없습니다'}), 400
        
        print(f"[DEBUG] inventory 일괄 저장 시작, 항목 수: {len(items)}")
        
        # 각 항목을 inventory 테이블 형식으로 변환
        inventory_items = []
        from datetime import datetime, timedelta
        
        for item in items:
            receipt_item_id = item.get('receipt_item_id')
            name = item.get('name')
            category_id = item.get('category_id')
            quantity = item.get('quantity', 1)
            expiry_days = item.get('expiry_days', 7)
            
            # 유통기한 계산
            purchase_date = datetime.now().date()
            expiry_date = purchase_date + timedelta(days=expiry_days)
            
            inventory_items.append({
                'receipt_item_id': receipt_item_id,
                'category_id': category_id,
                'name': name,
                'quantity': quantity,
                'purchase_date': purchase_date.isoformat(),
                'expiry_date': expiry_date.isoformat(),
                'status': 'active'
            })
        
        # inventory 테이블에 일괄 저장
        if supabase and inventory_items:
            response = supabase.table('inventory').insert(inventory_items).execute()
            
            if response.data:
                print(f"[DEBUG] inventory 일괄 저장 성공, 저장된 항목 수: {len(response.data)}")
                return jsonify({
                    'success': True,
                    'message': f'{len(response.data)}개 항목을 재고에 추가했습니다.',
                    'items': response.data
                }), 200
            else:
                raise Exception("inventory 저장 실패")
        else:
            raise Exception("Supabase 연결 또는 데이터 문제")
            
    except Exception as e:
        print(f"[ERROR] inventory 일괄 저장 실패: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
