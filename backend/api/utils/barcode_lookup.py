import os
import csv
import requests
from requests.exceptions import RequestException
import openfoodfacts

# --- 1. 카테고리 매핑 헬퍼 함수 ---

def _load_category_map():
    """
    categories_master.csv 파일을 읽어 외부 카테고리명과 내부 카테고리 ID를 매핑하는 딕셔너리를 생성하고 캐싱합니다.
    이 함수는 첫 API 호출 시 한 번만 실행됩니다.
    """
    category_map = {}
    try:
        # 현재 파일의 위치를 기준으로 절대 경로 생성
        current_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(current_dir, '..', 'data', 'categories_master.csv')

        with open(csv_path, mode='r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            for idx, row in enumerate(reader):
                # 인덱스를 기반으로 ID 생성 (1부터 시작)
                category_id = idx + 1
                # category_name_kr을 키로 사용하고, id와 name을 값으로 저장
                category_map[row['category_name_kr']] = {
                    "id": category_id,
                    "name": row['category_name_kr'],
                    "code": row['category_code']
                }
        print(f"Info: {len(category_map)}개의 카테고리를 {csv_path}에서 성공적으로 로드했습니다.")
        return category_map
    except FileNotFoundError:
        print(f"Warning: {csv_path} 파일을 찾을 수 없습니다. 카테고리 매핑이 비활성화됩니다.")
        return {}
    except Exception as e:
        print(f"Error: 카테고리 파일 로드 중 오류 발생: {e}")
        return {}

_category_map_cache = None

def _map_external_category_to_internal(external_category_name: str):
    """
    외부 API에서 받은 카테고리명을 내부 카테고리 정보(id, name)로 변환합니다.
    규칙 기반 -> 정확히 일치 -> 키워드 포함 순서로 매핑을 시도합니다.
    """
    global _category_map_cache
    if _category_map_cache is None:
        _category_map_cache = _load_category_map()

    if not external_category_name:
        return None

    # 1. [개선] 특정 키워드에 대한 우선 매핑 규칙
    if '면' in external_category_name or '누들' in external_category_name.lower():
        # '건면'과 '생/냉장면' 중 '건면'을 기본으로 선택
        return _category_map_cache.get('건면')
    if '유' in external_category_name and ('가공' in external_category_name or '음료' in external_category_name):
        return _category_map_cache.get('유제품(신선)')
    if '과자' in external_category_name or '스낵' in external_category_name:
        return _category_map_cache.get('과자/스낵')

    # 2. 정확히 일치하는 이름 검색
    exact_match = _category_map_cache.get(external_category_name)
    if exact_match:
        return exact_match

    # 3. 키워드 포함 매핑
    for internal_name, category_info in _category_map_cache.items():
        main_keyword = internal_name.split('(')[0]
        if main_keyword in external_category_name:
            return category_info
            
    # 4. 모든 매핑 실패 시 None 반환
    return None


# --- 2. 외부 API 호출 함수들 ---

# Supabase 클라이언트 전역 변수 (app.py에서 설정)
_supabase_client = None

def set_supabase_client(client):
    """
    app.py에서 초기화된 Supabase 클라이언트를 설정합니다.
    """
    global _supabase_client
    _supabase_client = client

def get_product_info_from_db(barcode: str):
    """
    Supabase DB에서 바코드 정보를 먼저 조회합니다 (캐싱).
    """
    try:
        if not _supabase_client:
            print("[백엔드] 오류: Supabase 클라이언트가 초기화되지 않았습니다")
            return None

        result = _supabase_client.table('products').select('*').eq('barcode', barcode).single().execute()

        if result.data:
            # DB에 저장된 데이터가 유효한지 확인
            product_name = result.data.get('product_name')
            if product_name and product_name not in ['상품 정보 없음', 'NOT FOUND', '해당 없음', '']:
                print(f"[백엔드] ✅ DB HIT: {barcode}")
                return result.data
            else:
                print(f"[백엔드] ⚠️ DB HIT but no valid product info: {barcode}")
                return None

        return None
    except Exception as e:
        print(f"[백엔드] DB 조회 오류: {e}")
        return None

def save_product_to_db(barcode: str, product_info: dict):
    """
    외부 API에서 조회한 제품 정보를 Supabase DB에 저장합니다.
    """
    try:
        if not _supabase_client:
            print("[백엔드] 오류: Supabase 클라이언트가 초기화되지 않았습니다")
            return None
        
        # DB에 저장할 데이터 구성
        db_product = {
            "barcode": barcode,
            "product_name": product_info.get('name'),
            "category_id": product_info.get('category_id'),
            "manufacturer": product_info.get('manufacturer', '알 수 없음'),
            "source": product_info.get('source'),
            "verified": True  # 외부 API 데이터는 신뢰할 수 있으므로 검증됨으로 표시
        }
        
        result = _supabase_client.table('products').insert(db_product).execute()
        
        if result.data:
            print(f"[백엔드] ✅ DB 저장 성공: {barcode}")
            return result.data[0]
        
        return None
    except Exception as e:
        print(f"[백엔드] DB 저장 오류: {e}")
        return None

def get_product_info_from_food_safety_korea(barcode: str):
    """
    식품안전나라 API를 통해 바코드 정보를 조회합니다.
    """
    print(f"--- [백엔드] 1. 식품안전나라 API 호출됨. (바코드: {barcode}) ---")

    try:
        api_key = os.environ.get('FOOD_SAFETY_KOREA_API_KEY')

        if not api_key:
            print("[백엔드] 오류: .env 파일에서 FOOD_SAFETY_KOREA_API_KEY를 찾을 수 없습니다!")
            return None

        print(f"[백엔드] 2. API 키 확인됨 (일부): {api_key[:5]}...")

        service_id = "C005"
        data_type = "json"
        start_idx = "1"
        end_idx = "5"

        url = f"http://openapi.foodsafetykorea.go.kr/api/{api_key}/{service_id}/{data_type}/{start_idx}/{end_idx}/BAR_CD={barcode}"

        print(f"[백엔드] 3. 요청할 URL: {url}")

        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        data = response.json()

        print(f"[백엔드] 4. API 응답 (Raw): {data}")

        if 'C005' not in data or 'row' not in data['C005'] or data['C005']['total_count'] == '0':
            print("[백엔드] 5. API가 '결과 없음'을 반환함.")
            return None

        product_data = data['C005']['row'][0]
        product_name = product_data.get('PRDLST_NM')
        external_category = product_data.get('PRDLST_DCNM')

        if not product_name or not external_category:
            print("[백엔드] 5a. 제품명 또는 카테고리명이 응답에 없음.")
            return None

        category_info = _map_external_category_to_internal(external_category)
        if not category_info:
            print(f"[백엔드] 5b. 카테고리 매핑 실패: '{external_category}'를 내부 카테고리로 변환할 수 없음.")
            return None 

        print("[백엔드] 6. 성공: 제품 정보를 찾고 매핑했습니다.")

        return {
            "name": product_name,
            "category_id": category_info["id"],
            "category_name_kr": category_info["name"],
            "source": "food_safety_korea",
            "manufacturer": product_data.get('PRDT_CO_NM', '알 수 없음')  # 제조사 정보 추가
        }

    except RequestException as e:
        print(f"[백엔드] 심각한 오류: API 요청 실패! {e}")
        return {"error": "api_failed"}
    except Exception as e:
        print(f"[백엔드] 심각한 오류: 데이터 파싱 실패! {e}")
        return {"error": "internal_error"}


def get_product_info_from_open_food_facts(barcode: str):
    """
    Open Food Facts API를 통해 바코드 정보를 조회합니다.
    """
    try:
        api = openfoodfacts.API(user_agent="FoodManagementApp/1.0")
        product = api.product.get(barcode, fields=["product_name", "categories"])

        if not product or 'product_name' not in product:
            return None

        product_name = product.get('product_name')
        external_category = product.get('categories', '').split(',')[-1].strip()

        if not product_name or not external_category:
            return None

        category_info = _map_external_category_to_internal(external_category)
        if not category_info:
            return None

        return {
            "name": product_name,
            "category_id": category_info["id"],
            "category_name_kr": category_info["name"],
            "source": "open_food_facts",
            "manufacturer": product.get('brands', '알 수 없음')  # 제조사 정보 추가
        }
    except Exception as e:
        print(f"Open Food Facts API Error: {e}")
        return {"error": "api_failed"}

def get_product_info_from_food_qr(barcode: str):
    """
    FOOD_QR API를 통해 바코드 정보를 조회합니다.
    """
    try:
        api_key = os.environ.get('FOOD_QR_API_KEY')
        if not api_key:
            return {"error": "api_key_missing"}

        url = f"https://foodqr.kr/openapi/service/qr1003/F003?accessKey={api_key}&_type=json&brcdNo={barcode}"
        
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        data = response.json()

        if 'totalCount' not in data or data['totalCount'] == 0:
            return None

        product_data = data['items'][0]
        product_name = product_data.get('prdctNm')
        external_category = product_data.get('buesNm', '기타') 

        if not product_name:
            return None

        category_info = _map_external_category_to_internal(external_category)
        if not category_info:
            category_info = _map_external_category_to_internal('기타')
            if not category_info:
                 return None

        return {
            "name": product_name,
            "category_id": category_info["id"],
            "category_name_kr": category_info["name"],
            "source": "food_qr",
            "manufacturer": "알 수 없음"  # FOOD_QR API는 제조사 정보를 제공하지 않음
        }

    except RequestException as e:
        print(f"FOOD_QR API Error: {e}")
        return {"error": "api_failed"}
    except Exception as e:
        print(f"Barcode lookup logic error (FOOD_QR): {e}")
        return {"error": "internal_error"}