"""
Clova OCR 서비스 모듈
영수증 이미지 처리 및 텍스트 추출 관련 비즈니스 로직
"""
import os
import requests
import time
import base64
import re
from PIL import Image
from io import BytesIO

# Clova OCR 설정
CLOVA_OCR_API_URL = os.environ.get('CLOVA_OCR_API_URL')
CLOVA_OCR_SECRET_KEY = os.environ.get('CLOVA_OCR_SECRET_KEY')

# utils 폴더의 함수를 상대 경로로 가져옴
from .utils.expiry_logic import _get_category_id_by_name, _get_category_expiry_days
import pickle
import os


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
        print(f"[CLOVA] 이미지 포맷 확인: jpg")
        print(f"[CLOVA] Base64 데이터 길이: {len(image_base64)}")
        print(f"[CLOVA] RequestId: scan_{int(time.time())}")
        
        print(f"[CLOVA] API URL: {CLOVA_OCR_API_URL}")
        print(f"[CLOVA] Headers: {{'X-OCR-SECRET': '***MASKED***', 'Content-Type': 'application/json'}}")
        print(f"[CLOVA] Timeout 설정: 60초")
        
        # 디버깅을 위해 요청 데이터 일부 출력
        print(f"[CLOVA] 요청 데이터 구조: {list(data.keys())}")
        if 'images' in data and data['images']:
            print(f"[CLOVA] 첫번째 이미지 키: {list(data['images'][0].keys())}")
        
        response = requests.post(CLOVA_OCR_API_URL, headers=headers, json=data, timeout=60)
        
        if response.status_code == 200:
            print(f"[CLOVA] 클로바 OCR API 호출 성공")
            return response.json()
        else:
            print(f"[CLOVA] 클로바 OCR API 오류: {response.status_code}")
            print(f"[CLOVA] 오류 응답: {response.text}")
            print(f"[CLOVA] 요청 헤더: {headers}")
            print(f"[CLOVA] 환경 변수 확인 - URL: {CLOVA_OCR_API_URL}")
            print(f"[CLOVA] 환경 변수 확인 - SECRET 설정 여부: {'YES' if CLOVA_OCR_SECRET_KEY else 'NO'}")
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
        
        # 영수증 항목 정교화된 수집 (ML 필터링 추가)
        print(f"[CLOVA-DEBUG] 총 {len(full_texts)}개 텍스트 항목 처리 시작")
        
        filtered_items = []
        rejected_count = 0
        ml_enhanced_count = 0
        
        for i, text in enumerate(full_texts):
            print(f"\n[CLOVA-DEBUG] 항목 {i+1}/{len(full_texts)}: '{text}'")
            product_data = _create_standardized_product_data(text)
            
            if product_data is not None:
                filtered_items.append(product_data)
                if product_data.get('confidence_ml', False):
                    ml_enhanced_count += 1
                print(f"[CLOVA-SUCCESS] ✅ 상품으로 인정: {product_data['category']}")
            else:
                rejected_count += 1
                print(f"[CLOVA-REJECT] ❌ 필터링됨")
        
        print(f"\n[CLOVA-SUMMARY] 최종 통계:")
        print(f"  - 총 항목 수: {len(full_texts)}")
        print(f"  - 검증된 상품: {len(filtered_items)}")
        print(f"  - 필터링 제외: {rejected_count}")
        print(f"  - ML 강화 분석: {ml_enhanced_count}")
        print(f"  - 최종 처리율: {len(filtered_items)/len(full_texts)*100:.1f}%")
        
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


def _ml_classify_product_item(text):
    """
    메모리 최적화 ML 모델을 사용하여 상품 항목을 분류하고 카테고리/유톨기한을 예측합니다.
    """
    print(f"[ML-DEBUG] 텍스트 분류 시작: '{text}'")
    
    try:
        # ML 모델 파일 경로 (안정 48% 모델 사용)
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'item_classifier_final.pkl')
        vectorizer_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'vectorizer_final.pkl')
        
        print(f"[ML-DEBUG] 모델 파일 확인: {model_path}")
        print(f"[ML-DEBUG] 벡터라이저 파일 확인: {vectorizer_path}")
        
        if not os.path.exists(model_path) or not os.path.exists(vectorizer_path):
            print(f"[ML-ERROR] 모델 파일 없음: {model_path}")
            return None
        
        print(f"[ML-DEBUG] 모델 파일 로드 시작")
        
        # 모델 및 벡터라이저 로드 (joblib 우선 시도)
        print(f"[ML-DEBUG] 모델 파일 로드 중...")
        
        # Try joblib first (more stable for scikit-learn objects)
        try:
            import joblib
            print(f"[ML-DEBUG] joblib으로 모델 로드 중...")
            model = joblib.load(model_path)
            print(f"[ML-DEBUG] 벡터라이저 로드 중...")
            vectorizer = joblib.load(vectorizer_path)
            print(f"[ML-DEBUG] 모델 로드 성공!")
        except Exception as e:
            print(f"[ML-ERROR] joblib 실패: {str(e)}")
            try:
                # Fallback to pickle with error handling
                print(f"[ML-DEBUG] pickle 로드 시도...")
                model = pickle.load(open(model_path, 'rb'))
                vectorizer = pickle.load(open(vectorizer_path, 'rb'))
                print(f"[ML-DEBUG] pickle 로드 성공!")
            except Exception as e2:
                print(f"[ML-ERROR] pickle도 실패: {str(e2)}")
                raise e2
        
        print(f"[ML-DEBUG] 모델 및 벡터라이저 로드 완료")
        
        # 텍스트 전처리 (ML 모델이 학습한 방식과 동일)
        print(f"[ML-DEBUG] 텍스트 전처리 시작")
        import re
        from konlpy.tag import Okt
        
        okt = Okt()
        
        # 1. 한글, 공백 제외 모든 문자 제거 (원본 방식)
        clean_text = re.sub(r'[^가-힣\s]', '', text)
        print(f"[ML-DEBUG] Okt 한글 정제: '{clean_text}'")
        
        # 명사 추출
        nouns = okt.nouns(clean_text)
        processed_text = " ".join(nouns)
        print(f"[ML-DEBUG] 명사 추출: {nouns}")
        print(f"[ML-DEBUG] 처리된 텍스트: '{processed_text}'")
        
        if not processed_text.strip():
            print(f"[ML-WARNING] 처리된 텍스트가 비어있음: '{text}'")
            return None
        
        # 벡터화 및 예측
        print(f"[ML-DEBUG] 텍스트 벡터화 시작...")
        text_vector = vectorizer.transform([processed_text])
        print(f"[ML-DEBUG] 벡터화 완료: 차원 {text_vector.shape}")
        
        print(f"[ML-DEBUG] 모델 예측 시작...")
        predicted_category_code = model.predict(text_vector)[0]
        print(f"[ML-DEBUG] 예측된 카테고리 코드: '{predicted_category_code}'")
        
        # 카테고리 코드를 한국어 카테고리명으로 매핑
        category_mapping = {
            'BAKERY_CREAM_SANDWICH': '빵과과자',
            'BERRIES': '과일',
            'BEVERAGE_REFRIGERATED': '음료',
            'BEVERAGE_SHELF_STABLE': '음료',
            'BREAD_GENERAL': '빵과과자',
            'CANNED_DRY_GOODS': '가공식품',
            'CITRUS': '과일',
            'DAIRY_FRESH': '유제품',
            'DAIRY_PROCESSED': '유제품',
            'DRIED_NOODLES': '가공식품',
            'DRY_SEAWEED': '해산물',
            'EGGS': '유제품',
            'ETC': '기타',
            'FISH_FRESH': '해산물',
            'FRESH_NOODLES': '가공식품',
            'FRESH_SEAWEED': '해산물',
            'FROZEN_FOOD': '냉동식품',
            'FRUIT_GENERAL': '과일',
            'FRUIT_VEGETABLES': '채소',
            'GRAINS_RICE': '가공식품',
            'HARD_CHEESE': '유제품',
            'LEAFY_VEGETABLES': '채소',
            'MEAT_FRESH': '정육',
            'MEAT_PROCESSED': '정육',
            'MOLLUSCS_CRUSTACEANS': '해산물',
            'MUSHROOMS': '채소',
            'PICKLED_VEGETABLES': '채소',
            'READY_MEALS_FROZEN': '냉동식품',
            'READY_MEALS_REFRIGERATED': '가공식품',
            'ROOT_VEGETABLES': '채소',
            'SAUCES_SEASONINGS': '조미료',
            'SHELLFISH': '해산물',
            'SNACKS': '빵과과자',
            'SOFT_CHEESE': '유제품',
            'SPROUTS': '채소',
            'STEM_VEGETABLES': '채소',
            'TROPICAL_FRUIT': '과일'
        }
        
        predicted_category = category_mapping.get(predicted_category_code, '기타')
        
        # 유통기한 예측 (기존 로직 활용)
        expiry_days = _get_category_expiry_days(predicted_category)
        
        print(f"[ML-SUCCESS] '{text}' → '{predicted_category}' (카테고리 코드: {predicted_category_code})")
        print(f"[ML-SUCCESS] 유통기한: {expiry_days}일")
        
        result = {
            'category': predicted_category,
            'category_code': predicted_category_code,
            'expiry_days': expiry_days,
            'confidence_ml': True
        }
        
        print(f"[ML-DEBUG] 최종 결과: {result}")
        
        return result
        
    except Exception as e:
        print(f"[ML-ERROR] 분류 실패: '{text}' - {str(e)}")
        print(f"[ML-ERROR] 예외 상세: {type(e).__name__}")
        return None


def _is_valid_product_item_enhanced(text):
    """
    2단계 필터링: 1) 정규식 기본 필터링 -> 2) ML 모델 검증 및 카테고리 분류
    """
    print(f"[FILTER-DEBUG] 2단계 필터링 시작: '{text}'")
    
    # 1단계: 기존 정규식 필터링
    print(f"[FILTER-DEBUG] 1단계: 정규식 필터링 적용")
    if not _is_valid_product_item(text):
        print(f"[FILTER-REJECT] 1단계 필터링에서 거부: '{text}'")
        return False, None
    
    print(f"[FILTER-PASS] 1단계 필터링 통과: '{text}'")
    
    # 2단계: ML 모델로 재검증 및 카테고리 분류
    print(f"[FILTER-DEBUG] 2단계: ML 모델 검증 시작")
    ml_result = _ml_classify_product_item(text)
    
    if ml_result is None:
        # ML 실패 시 기존 방식 사용
        print(f"[FILTER-FALLBACK] ML 실패, 기존 방식으로 폴백: '{text}'")
        category = _classify_product_category(text)
        fallback_result = {
            'category': category,
            'expiry_days': _get_category_expiry_days(category),
            'confidence_ml': False
        }
        print(f"[FILTER-FALLBACK] 폴백 결과: {fallback_result}")
        return True, fallback_result
    
    # ETC(기타) 카테고리는 진짜 상품이 아닐 가능성이 높으므로 필터링
    if ml_result['category'] == '기타':
        print(f"[FILTER-REJECT] '{text}' → 기타 카테고리로 필터링")
        return False, None
    
    # ML에서 상품으로 판정된 경우만 통과
    print(f"[FILTER-SUCCESS] ML에서 상품으로 인정: '{text}' → {ml_result['category']}")
    return True, ml_result


def _create_standardized_product_data(text):
    """
    메모리 최적화된 상품 데이터 생성.
    """
    print(f"[PRODUCT-DEBUG] 상품 데이터 생성 시작: '{text}'")
    
    # 상품명 정제
    item_name = text.strip()
    item_name = re.sub(r'\s+', ' ', item_name)  # 다중 공백 제거
    
    # 2단계 필터링 적용
    print(f"[PRODUCT-DEBUG] 2단계 필터링 적용")
    is_valid, ml_result = _is_valid_product_item_enhanced(text)
    
    if not is_valid:
        print(f"[PRODUCT-REJECT] 필터링으로 제외: '{text}'")
        return None  # 필터링되면 None 반환
    
    # 메모리 최적화 결과 또는 기존 방식으로 정보 확정
    category = ml_result['category']
    expiry_days = ml_result['expiry_days']
    
    print(f"[PRODUCT-SUCCESS] 최종 상품 정보: 카테고리='{category}', 유통기한={expiry_days}일")
    
    # 수량 정보 추출 (선택적)
    quantity_info = _extract_quantity_info(item_name)
    print(f"[PRODUCT-DEBUG] 수량 정보: {quantity_info}")
    
    # 확장성 고려한 반환 구조
    product_data = {
        'item_name': item_name,
        'category': category,
        'category_id': _get_category_id_by_name(category),
        'expiry_days': expiry_days,
        'quantity': quantity_info.get('amount'),  # 수량
        'unit': quantity_info.get('unit'),      # 단위 (g, 봉, 개 등)
        'source': 'clova_ocr_ml_enhanced',
        'confidence_high': ml_result.get('confidence_ml', True),
        'confidence_ml': ml_result.get('confidence_ml', False),
        'raw_text': text  # 원본 텍스트 보존 (디버깅용)
    }
    
    print(f"[PRODUCT-DEBUG] 생성된 상품 데이터: {product_data}")
    
    return product_data


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
        '조미료': ['설탕', '간장', '고추장', '후추', '물염', '설탕물', '장아찌', '양념장', '간장소스', '고춧가루', '식초', '올리브오일'],
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
