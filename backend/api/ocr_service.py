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
import google.generativeai as genai
from PIL import Image
from io import BytesIO

# utils 폴더의 함수를 상대 경로로 가져옴
from .utils.expiry_logic import _get_category_id_by_name, _get_category_expiry_days

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
    LLM(Gemini)을 사용하여 전체 텍스트에서 상품명 목록을 추출합니다.
    """
    if not GEMINI_API_KEY:
        print("[LLM-ERROR] Gemini API 키가 설정되지 않아 상품 추출을 건너뜁니다.")
        return []

    try:
        print("[LLM] Gemini API 호출 시작...")
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""
        당신은 영수증을 분석하여 상품 목록만 정확하게 추출하는 전문가입니다.
        다음은 OCR로 스캔된 영수증 텍스트입니다.

        --- 영수증 텍스트 ---
        {full_text}
        --- 영수증 텍스트 끝 ---

        위 텍스트에서 다음 규칙을 엄격하게 지켜 '상품명'만 추출하고, 그 외 모든 텍스트는 완벽하게 무시하십시오.

        **규칙:**
        1. 상품명, 수량, 단가와 직접적으로 관련된 텍스트만 상품으로 간주합니다.
        2. 가게 이름, 주소, 전화번호, 사업자번호, 날짜, 시간, 합계, 부가세, 할인, 결제 정보, 카드 번호, 승인 번호 등은 절대 상품이 아닙니다.
        3. OCR 오류로 보이는 의미 없는 문자열(예: '그액', '듀호월호시액')은 상품이 아닙니다.
        4. 수량이나 가격만 나타내는 숫자(예: '1', '4,500')는 상품이 아닙니다.
        5. 추출된 상품명 목록을 JSON 배열 형식으로만 반환해야 합니다. 설명이나 다른 텍스트 없이, 오직 JSON 배열만 출력하십시오.

        **출력 형식 예시:**
        ["아메리카노", "바닐라 라떼", "초코 케이크"]
        """

        response = await model.generate_content_async(prompt)
        
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
        
        item_names = json.loads(json_text)
        
        if isinstance(item_names, list):
            print(f"[LLM-SUCCESS] 상품명 {len(item_names)}개 추출 성공: {item_names}")
            return item_names
        else:
            print(f"[LLM-ERROR] 응답이 JSON 배열 형식이 아닙니다: {item_names}")
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
        
        # 1. OCR 결과에서 전체 텍스트 블록 재구성
        print(f"[PARSER] 1. 레이아웃 분석 및 전체 텍스트 재구성 시작...")
        full_text = _reconstruct_lines_from_boxes(fields)
        
        # 2. LLM을 사용하여 상품명 목록 추출
        print(f"[PARSER] 2. LLM 기반 상품명 추출 시작...")
        item_names = await _extract_items_with_llm(full_text)
        
        if not item_names:
            print("[PARSER] LLM이 상품을 추출하지 못했습니다.")
            return []
            
        # 3. 추출된 각 상품명에 대해 카테고리 및 유통기한 정보 추가
        print(f"[PARSER] 3. 카테고리 및 유통기한 정보 매핑 시작...")
        final_items = []
        for name in item_names:
            category = _classify_product_category(name)
            expiry_days = _get_category_expiry_days(category)
            category_id = _get_category_id_by_name(category)
            
            product_data = {
                'item_name': name,
                'category': category,
                'category_id': category_id,
                'expiry_days': expiry_days,
                'quantity': 1,  # 기본값, 향후 LLM으로 추출 가능
                'unit': '개',   # 기본값
                'source': 'clova_ocr_llm',
                'confidence_high': True, # LLM 결과를 신뢰
                'raw_text': name
            }
            final_items.append(product_data)
            print(f"[PARSER-SUCCESS] ✅ 상품 처리 완료: {name} ({category})")

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
