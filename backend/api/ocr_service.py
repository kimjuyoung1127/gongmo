"""
Clova OCR 서비스 모듈
영수증 이미지 처리 및 텍스트 추출 관련 비즈니스 로직
"""
import os
import requests
import time
import base64
import re
import json
import hashlib
import google.generativeai as genai
from PIL import Image
from io import BytesIO
from supabase import create_client

# utils 폴더의 함수를 상대 경로로 가져옴
from .utils.expiry_logic import _get_category_id_by_name, _get_category_expiry_days
from .cache_manager import ocr_memory_cache

# supabase 클라이언트 생성
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_ANON_KEY')
supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# --- 환경 변수 및 API 설정 ---
CLOVA_OCR_API_URL = os.environ.get('CLOVA_OCR_API_URL')
CLOVA_OCR_SECRET_KEY = os.environ.get('CLOVA_OCR_SECRET_KEY')
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

# Gemini API 설정
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("[WARN] GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")


def call_clova_ocr(image_data):
    """
    클로바 OCR API를 호출하여 이미지에서 텍스트를 추출합니다.
    """
    try:
        print(f"[CLOVA] 클로바 OCR API 호출 시작")
        headers = {"X-OCR-SECRET": CLOVA_OCR_SECRET_KEY, "Content-Type": "application/json"}
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        data = {
            "images": [{"format": "jpg", "name": "receipt", "data": image_base64}],
            "requestId": "scan_" + str(int(time.time())),
            "version": "V2",
            "timestamp": int(time.time() * 1000)
        }
        
        response = requests.post(CLOVA_OCR_API_URL, headers=headers, json=data, timeout=60)
        
        if response.status_code == 200:
            print(f"[CLOVA] 클로바 OCR API 호출 성공")
            return response.json()
        else:
            print(f"[CLOVA] 클로바 OCR API 오류: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"[CLOVA] 클로바 OCR 호출 실패: {str(e)}")
        return None


def _reconstruct_lines_from_boxes(fields):
    """
    OCR 필드들을 좌표 기반으로 줄(Line) 단위로 재조립하여 하나의 텍스트 블록으로 만듭니다.
    """
    if not fields:
        return ""
        
    # Y좌표를 기준으로 필드 정렬 (위에서 아래로)
    fields.sort(key=lambda f: f['boundingPoly']['vertices'][0]['y'])
    
    lines = []
    current_line = []
    last_y = fields[0]['boundingPoly']['vertices'][0]['y']

    for field in fields:
        text = field['inferText']
        y_coord = field['boundingPoly']['vertices'][0]['y']

        # Y좌표가 크게 변하면 줄바꿈으로 간주 (줄 높이의 50% 이상 차이)
        if y_coord - last_y > 15: # 임계값 (조정 가능)
            lines.append(" ".join([item['text'] for item in sorted(current_line, key=lambda item: item['x'])]))
            current_line = []
        
        current_line.append({'text': text, 'x': field['boundingPoly']['vertices'][0]['x']})
        last_y = y_coord

    if current_line:
        # x좌표 기준으로 정렬하여 최종 라인 추가
        sorted_line = [item['text'] for item in sorted(current_line, key=lambda item: item['x'])]
        lines.append(" ".join(sorted_line))

    full_text = "\n".join(lines)
    print(f"[LAYOUT] 재구성된 전체 텍스트:\n---\n{full_text}\n---")
    return full_text


async def _extract_items_with_llm(full_text):
    """
    LLM(Gemini)을 사용하여 전체 텍스트에서 상품명과 카테고리를 추출합니다.
    """
    if not GEMINI_API_KEY:
        print("[LLM-ERROR] Gemini API 키가 설정되지 않아 상품 추출을 건너뜁니다.")
        return []

    try:
        print("[LLM] Gemini API 호출 시작...")
        model = genai.GenerativeModel('gemini-2.5-flash')

        # 카테고리 목록을 프롬프트에 포함
        categories_info = """
        1: 유제품(신선) - 🥛
        2: 유제품(가공/롱라이프) - 🧈
        3: 연질치즈 - 🧀
        4: 경성치즈 - 🧀
        5: 육류(신선) - 🥩
        6: 가공육 - 🥓
        7: 난류 - 🥚
        8: 잎채소 - 🥬
        9: 줄기채소 - 🥒
        10: 뿌리채소(저온) - 🍠
        11: 발아채소 - 🌱
        12: 열매채소 - 🍅
        13: 버섯류 - 🍄
        14: 과일(일반) - 🍎
        15: 베리류 - 🍓
        16: 감귤류 - 🍊
        17: 열대과일 - 🥭
        18: 어류(신선) - 🐟
        19: 패류 - 🦞
        20: 연체/갑각류 - 🦀
        21: 해조류(생) - 🥬
        22: 해조류(건조) - 🥬
        23: 냉동식품 - ❄️
        24: 건면 - 🍝
        25: 생/냉장면 - 🍜
        26: 빵(일반) - 🍞
        27: 베이커리(크림/샌드) - 🥮
        28: 음료(냉장) - 🥤
        29: 음료(멸균/캔) - 🥤
        30: 과자/스낵 - 🍪
        31: 곡류/쌀 - 🌾
        32: 소스/조미료 - 🧂
        33: 김치/절임류 - 🥗
        34: 통조림/건식품 - 🥫
        35: 반조리/냉장 HMR - 🍽️
        36: 반조리/냉동 HMR - 🍽️
        37: 기타 - 📦
        """

        prompt = f"""
        당신은 영수증을 분석하여 상품명과 카테고리를 정확하게 추출하는 전문가입니다.
        다음은 OCR로 스캔된 영수증 텍스트입니다.

        --- 영수증 텍스트 ---
        {full_text}
        --- 영수증 텍스트 끝 ---

        위 텍스트에서 다음 규칙을 엄격하게 지켜 '상품명'과 '카테고리 ID'를 함께 추출하고, 그 외 모든 텍스트는 완벽하게 무시하십시오.

        **카테고리 목록:**
        {categories_info}

        **규칙:**
        1. 상품명, 수량, 단가와 직접적으로 관련된 텍스트만 상품으로 간주합니다.
        2. 가게 이름, 주소, 전화번호, 사업자번호, 날짜, 시간, 합계, 부가세, 할인, 결제 정보, 카드 번호, 승인 번호 등은 절대 상품이 아닙니다.
        3. OCR 오류로 보이는 의미 없는 문자열(예: '그액', '듀호월호시액')은 상품이 아닙니다.
        4. 수량이나 가격만 나타내는 숫자(예: '1', '4,500')는 상품이 아닙니다.
        5. 카테고리는 위의 목록에서 가장 적절한 것을 선택하십시오. 정확한 매칭이 없으면 37(기타)를 사용하십시오.
        6. 수량 정보가 명시되어 있다면 함께 추출하되, 기본값은 1입니다.
        7. 추출된 정보를 JSON 형식으로만 반환해야 합니다. 설명이나 다른 텍스트 없이, 오직 JSON만 출력하십시오.

        **출력 형식 예시:**
        [
          {{"item_name": "계란", "category_id": 8, "quantity": 1}},
          {{"item_name": "소고기", "category_id": 6, "quantity": 1}},
          {{"item_name": "딸기", "category_id": 16, "quantity": 1}}
        ]
        """

        response = model.generate_content(prompt)

        # 응답에서 JSON 부분만 추출
        response_text = response.text
        print(f"[LLM-DEBUG] API 원본 응답: {response_text}")

        # 마크다운 코드 블록(` ```json ... ``` `)이 포함된 경우 제거
        match = re.search(r'```json\s*([\s\S]*?)\s*```', response_text)
        if match:
            json_text = match.group(1)
        else:
            json_text = response_text

        print(f"[LLM-DEBUG] 파싱할 JSON 텍스트: {json_text}")

        items_data = json.loads(json_text)

        if isinstance(items_data, list):
            print(f"[LLM-SUCCESS] 상품명과 카테고리 {len(items_data)}개 추출 성공: {[item['item_name'] for item in items_data]}")
            return items_data
        else:
            print(f"[LLM-ERROR] 응답이 JSON 배열 형식이 아닙니다: {items_data}")
            return []

    except Exception as e:
        print(f"[LLM-ERROR] Gemini API 호출 또는 파싱 중 오류 발생: {e}")
        return []


async def parse_clova_response_to_items(clova_response):
    """
    클로바 OCR 응답을 LLM을 사용하여 상품 항목으로 변환합니다.
    """
    try:
        if 'images' not in clova_response or not clova_response['images']:
            print("[PARSER] 응답에 이미지 데이터 없음")
            return []

        fields = clova_response['images'][0].get('fields', [])

        # 1. OCR 텍스트 재구성
        print(f"[PARSER] 1. 레이아웃 분석 및 전체 텍스트 재구성 시작...")
        full_text = _reconstruct_lines_from_boxes(fields)

        # 2. 캐시 해시 생성
        ocr_hash = _generate_ocr_hash(full_text)

        # 3. 메모리 캐시 먼저 확인 (0.1s)
        memory_result = ocr_memory_cache.get(ocr_hash)
        if memory_result:
            print(f"[MEMORY-HIT] 메모리 캐시 적중 (0.1s): {ocr_hash[:8]}...")
            return memory_result

        # 4. 캐시 확인 (0.5s)
        cached_result = await _get_cached_parse_result(ocr_hash)
        if cached_result:
            # 메모리 캐시에도 저장
            ocr_memory_cache.set(ocr_hash, cached_result)
            return cached_result

        # 5. 캐시 미스 시 LLM 호출 (3s)
        print(f"[LLM-CALL] 캐시 미스, Gemini API 호출: {ocr_hash[:8]}...")

        # 2. LLM을 사용하여 상품명과 카테고리 목록 추출
        print(f"[PARSER] 2. LLM 기반 상품명과 카테고리 추출 시작...")
        items_with_category = await _extract_items_with_llm(full_text)

        if not items_with_category:
            print("[PARSER] LLM이 상품을 추출하지 못했습니다.")
            return []

        # 3. 추출된 각 상품명에 대해 유통기한 정보 추가 (카테고리는 이미 LLM에서 제공됨)
        print(f"[PARSER] 3. 유통기한 정보 매핑 시작...")
        final_items = []
        for item in items_with_category:
            item_name = item.get('item_name', '')
            category_id = item.get('category_id', 37)  # 기본값: 기타(37)
            quantity = item.get('quantity', 1)

            # 카테고리 ID를 사용하여 카테고리 정보 가져오기
            from .utils.expiry_logic import get_category_info_by_id
            category_info = get_category_info_by_id(category_id)

            # 유효하지 않은 카테고리 ID인 경우 기본 카테고리(기타)로 대체
            if not category_info:
                print(f"[WARN] Invalid category_id '{category_id}' received from LLM. Falling back to '기타'.")
                category_id = 37  # '기타' 카테고리의 ID
                category_info = get_category_info_by_id(category_id)

            category_name = category_info.get('category_name_kr', '기타')
            expiry_days = category_info.get('default_expiry_days', 7)

            # 👆 category_id와 expiry_days까지 캐시에 저장하여 속도 최적화
            item_data = {
                'item_name': item_name,
                'category': category_name,
                'category_id': category_id,
                'expiry_days': expiry_days,
                'quantity': quantity,
                'unit': '개',   # 기본값
                'source': 'clova_ocr_llm',
                'confidence_high': True, # LLM 결과를 신뢰
                'raw_text': item_name
            }
            final_items.append(item_data)
            print(f"[PARSER-SUCCESS] ✅ 상품 처리 완료: {item_name} (ID: {category_id}, {category_name})")

        # 6. 캐시 저장 (완전 처리된 결과물)
        _save_parse_cache(ocr_hash, final_items)
        ocr_memory_cache.set(ocr_hash, final_items)

        print(f"\n[PARSER-SUMMARY] 최종 추출된 상품 수: {len(final_items)}")
        return final_items

    except Exception as e:
        print(f"[PARSER] 최종 파싱 중 오류: {str(e)}")
        return []


def _classify_product_category(item_name):
    """
    확장성 있는 카테고리 분류 (규칙 기반 + 키워드 매핑).
    """
    category_keywords = {
        '채소': ['상추', '김치', '배추', '양배추', '시금치', '깻잎', '아욱', '파프리카', '오이', '버섯', '미나리', '무', '미역'],
        '과일': ['사과', '배', '포도', '복숭아', '감귤', '수박', '참외', '오렌지', '레몬', '자두', '딸기', '키위', '체리', '블루베리'],
        '유제품': ['우유', '치즈', '계란', '요거트', '버터', '크림', '마요네즈'],
        '정육': ['고기', '소고기', '돼지고기', '닭고기', '오리고기', '치킨', '양', '갈비', '불고기', '족발', '삼겹살', '돈까스'],
        '해산물': ['고등어', '연어', '갈치', '새우', '조개', '굴비', '문어', '오징어', '낙지', '전복', '멸치', '가리비'],
        '빵과과자': ['빵', '과자', '쿠키', '초콜릿', '케이크', '파이'],
        '음료': ['주스', '생수', '커피', '차', '소주', '맥주', '콜라', '사이다', '아메리카노', '라떼', '에스프레소'],
        '가공식품': ['라면', '면', '파스타', '시리얼', '국수', '통조림', '즉석밥'],
        '조미료': ['설탕', '소금', '간장', '고추장', '후추', '식초', '기름'],
        '냉동식품': ['아이스크림', '냉동만두', '냉동피자']
    }
    
    item_name_lower = item_name.lower()
    
    for category, keywords in category_keywords.items():
        for keyword in keywords:
            if keyword in item_name_lower:
                return category
    
    return '기타'


def resize_image_for_clova(image_path, max_size=2000, quality=95):
    """
    클로바 OCR 전송을 위해 이미지를 리사이즈합니다.
    """
    try:
        with Image.open(image_path) as img:
            if max(img.size) <= max_size:
                with open(image_path, 'rb') as f:
                    return f.read()

            ratio = max_size / max(img.size)
            new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
            img_resized = img.resize(new_size, Image.Resampling.LANCZOS)

            output_buffer = BytesIO()
            img_resized.convert('RGB').save(output_buffer, format='JPEG', quality=quality, optimize=True)
            return output_buffer.getvalue()

    except Exception as e:
        print(f"[CLOVA] 이미지 리사이즈 실패: {str(e)}")
        with open(image_path, 'rb') as f:
            return f.read()


def _normalize_ocr_text(ocr_text: str) -> str:
    """OCR 텍스트 정규화 - 실제 영수증 로그 기반 최적화"""
    normalized = ocr_text.strip()

    # 1. 연속 공백 → 단일 공백
    normalized = re.sub(r'\s+', ' ', normalized)

    # 2. 괄호 및 특수문자 제거
    normalized = re.sub(r'[()\-_\*\+\=\[\]{}<>|\\/]', ' ', normalized)

    # 3. 영문 소문자 통일
    normalized = normalized.lower()

    # 4. 최종 정리
    return ' '.join(normalized.split())


def _generate_ocr_hash(ocr_text: str) -> str:
    """정규화된 OCR 텍스트로 SHA256 해시 생성"""
    normalized_text = _normalize_ocr_text(ocr_text)
    return hashlib.sha256(normalized_text.encode('utf-8')).hexdigest()


async def _get_cached_parse_result(ocr_hash: str) -> dict:
    """Supabase에서 캐시된 파싱 결과 조회"""
    try:
        response = supabase.table('llm_parse_cache')\
            .select('final_items')\
            .eq('ocr_hash', ocr_hash)\
            .execute()

        if response.data and len(response.data) > 0:
            print(f"[CACHE-HIT] LLM 캐시 적중 (0.5s): {ocr_hash[:8]}...")
            return response.data[0]['final_items']
    except Exception as e:
        print(f"[CACHE-ERROR] 캐시 조회 실패: {e}")

    return None


def _save_parse_cache(ocr_hash: str, final_items: list):
    """최종 처리된 상품 목록을 캐시에 저장"""
    try:
        cache_data = {
            'ocr_hash': ocr_hash,
            'final_items': final_items
        }

        supabase.table('llm_parse_cache').upsert(cache_data).execute()
        print(f"[CACHE-SAVE] LLM 결과 캐시 저장: {ocr_hash[:8]}...")
    except Exception as e:
        print(f"[CACHE-ERROR] 캐시 저장 실패: {e}")
