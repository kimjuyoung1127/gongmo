import os
import csv
import requests
from requests.exceptions import RequestException
import openfoodfacts

# --- 1. 카테고리 매핑 헬퍼 함수 ---

def _load_category_map():
    """
    categories.csv 파일을 읽어 외부 카테고리명과 내부 카테고리 ID를 매핑하는 딕셔너리를 생성하고 캐싱합니다.
    이 함수는 첫 API 호출 시 한 번만 실행됩니다.
    """
    # TODO: 실제 매핑 규칙을 정의해야 합니다. (예: '과자' -> '과자/스낵')
    # 이 예시에서는 간단한 매핑을 사용합니다.
    category_map = {}
    try:
        # data 폴더에 categories.csv가 있다고 가정
        with open('backend/data/categories.csv', mode='r', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            for row in reader:
                # 예시: category_name_kr을 키로 사용
                category_map[row['category_name_kr']] = {
                    "id": int(row['id']),
                    "name": row['category_name_kr']
                }
        return category_map
    except FileNotFoundError:
        print("Warning: backend/data/categories.csv 파일을 찾을 수 없습니다. 카테고리 매핑이 비활성화됩니다.")
        return {}

_category_map_cache = None

def _map_external_category_to_internal(external_category_name: str):
    """
    외부 API에서 받은 카테고리명을 내부 카테고리 정보(id, name)로 변환합니다.
    """
    global _category_map_cache
    if _category_map_cache is None:
        _category_map_cache = _load_category_map()

    # TODO: 더 정교한 매핑 로직 필요 (예: '유가공품' -> '유제품(신선)')
    # 지금은 이름이 정확히 일치하는 경우만 매핑
    return _category_map_cache.get(external_category_name)


# --- 2. 외부 API 호출 함수들 ---

def get_product_info_from_food_safety_korea(barcode: str):
    """
    식품안전나라 API를 통해 바코드 정보를 조회합니다.
    성공 시: {'name': ..., 'category_id': ..., 'category_name_kr': ...}
    실패 시: None (제품 없음) 또는 {'error': '...'} (API 오류)
    """
    try:
        api_key = os.environ.get('FOOD_SAFETY_KOREA_API_KEY')
        if not api_key:
            return {"error": "api_key_missing"}

        url = f"http://openapi.foodsafetykorea.go.kr/api/{api_key}/C005/json/1/5/BAR_CD={barcode}"
        
        response = requests.get(url, timeout=5)
        response.raise_for_status() # 4xx, 5xx 오류 시 예외 발생
        
        data = response.json()

        if 'C005' not in data or data['C005']['total_count'] == '0':
            return None # 제품 정보 없음

        product_data = data['C005']['row'][0]
        product_name = product_data.get('PRDT_NM')
        external_category = product_data.get('PRDLST_NM')

        if not product_name or not external_category:
            return None

        category_info = _map_external_category_to_internal(external_category)
        if not category_info:
            # TODO: 매핑 실패 시 기본 카테고리 할당 또는 다른 처리 필요
            return None 

        return {
            "name": product_name,
            "category_id": category_info["id"],
            "category_name_kr": category_info["name"],
            "source": "food_safety_korea"
        }

    except RequestException as e:
        print(f"Food Safety Korea API Error: {e}")
        return {"error": "api_failed"}
    except Exception as e:
        print(f"Barcode lookup logic error (Food Safety Korea): {e}")
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
        # Open Food Facts는 카테고리가 리스트일 수 있고, 계층 구조를 가짐
        # 예: "en:dairies, en:milks" -> 가장 구체적인 카테고리를 사용하거나, 키워드 매핑 필요
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
            "source": "open_food_facts"
        }
    except Exception as e:
        print(f"Open Food Facts API Error: {e}")
        return {"error": "api_failed"}
