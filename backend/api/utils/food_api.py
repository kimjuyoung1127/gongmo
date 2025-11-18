import os
import requests
from typing import Dict, Any, List, Optional

def get_recipes_from_food_safety_korea(menu_name: str) -> Optional[Dict[str, Any]]:
    """
    식품안전나라 API를 통해 레시피 정보를 조회합니다.
    """
    print(f"--- [레시피] 1. 식품안전나라 API 호출됨. (요리명: {menu_name}) ---")

    try:
        api_key = os.environ.get('FOOD_SAFETY_KOREA_API_KEY')

        if not api_key:
            print("[레시피] 오류: .env 파일에서 FOOD_SAFETY_KOREA_API_KEY를 찾을 수 없습니다!")
            return None

        print(f"[레시피] 2. API 키 확인됨 (일부): {api_key[:5]}...")

        service_id = "C006"  # 레시피 정보 서비스 ID
        data_type = "json"
        start_idx = "1"
        end_idx = "5"

        # 식품안전나라 레시피 API 호출 (실제 레시피 검색 파라미터 사용)
        url = f"http://openapi.foodsafetykorea.go.kr/api/{api_key}/{service_id}/{data_type}/{start_idx}/{end_idx}/RECIPE_NM_KO={menu_name}"

        print(f"[레시피] 3. 요청할 URL: {url}")

        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()

        print(f"[레시피] 4. API 응답 (Raw): {data}")

        if 'C006' not in data or 'row' not in data['C006'] or data['C006']['total_count'] == '0':
            print("[레시피] 5. API가 '결과 없음'을 반환함.")
            return None

        recipe_data = data['C006']['row'][0]
        
        # 필요한 레시피 정보 추출
        result = {
            "menu_name": recipe_data.get('RECIPE_NM_KO', menu_name),
            "cooking_time": recipe_data.get('COOKING_TIME'),
            "difficulty": recipe_data.get('LEVEL_NM'),
            "ingredients": extract_ingredients_from_recipe_data(recipe_data),
            "instructions": extract_instructions_from_recipe_data(recipe_data),
            "nutrition_info": extract_nutrition_from_recipe_data(recipe_data),
            "image_url": recipe_data.get('ATT_FILE_NO_MAIN'),
        }

        print("[레시피] 6. 성공: 레시피 정보를 찾고 추출했습니다.")

        return result

    except requests.RequestException as e:
        print(f"[레시피] 심각한 오류: API 요청 실패! {e}")
        return {"error": "api_failed", "message": str(e)}
    except Exception as e:
        print(f"[레시피] 심각한 오류: 데이터 파싱 실패! {e}")
        return {"error": "internal_error", "message": str(e)}


def extract_ingredients_from_recipe_data(recipe_data: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    식품안전나라 레시피 데이터에서 재료 정보 추출
    """
    ingredients = []
    
    # 주재료 추출
    main_ingredients = recipe_data.get('IRE_NM', '')
    if main_ingredients:
        for ingredient in main_ingredients.split(','):
            ingredient = ingredient.strip()
            if ingredient:
                ingredients.append({
                    "name": ingredient,
                    "amount": "",
                    "category": "main"
                })
    
    # 부재료 추출
    sub_ingredients = recipe_data.get('SUB_REF_NM', '')
    if sub_ingredients:
        for ingredient in sub_ingredients.split(','):
            ingredient = ingredient.strip()
            if ingredient:
                ingredients.append({
                    "name": ingredient,
                    "amount": "",
                    "category": "sub"
                })
    
    return ingredients


def extract_instructions_from_recipe_data(recipe_data: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    식품안전나라 레시피 데이터에서 조리 순서 추출
    """
    instructions = []
    
    # 조리 순서는 RCP_SEQ_X 형태로 여러 개 있을 수 있음
    for i in range(1, 21):  # 최대 20단계 가정
        step_desc = recipe_data.get(f'COOKING_DC{i:02d}', '')
        if step_desc:
            instructions.append({
                "step": i,
                "description": step_desc
            })
        else:
            # 더 이상 단계가 없으면 종료
            break
    
    return instructions


def extract_nutrition_from_recipe_data(recipe_data: Dict[str, Any]) -> Dict[str, str]:
    """
    식품안전나라 레시피 데이터에서 영양 정보 추출
    """
    return {
        "calories": recipe_data.get('NUTRT_TOTAMT', ""),
        "protein": recipe_data.get('PROCNT', ""),
        "carbs": recipe_data.get('CARBO', ""),
        "fat": recipe_data.get('FATCN', "")
    }


def get_recipes_from_themealdb(menu_name: str) -> Optional[Dict[str, Any]]:
    """
    TheMealDB API를 통해 레시피 정보를 조회합니다.
    """
    try:
        print(f"--- [레시피] 1. TheMealDB API 호출됨. (요리명: {menu_name}) ---")
        
        # TheMealDB API는 한글 이름 검색이 제한적일 수 있으므로 영문 이름도 시도
        api_url = f"https://www.themealdb.com/api/json/v1/1/search.php?s={menu_name}"
        
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()

        data = response.json()
        
        print(f"[레시피] 3. TheMealDB 응답 확인: {data}")
        
        if not data or 'meals' not in data or data['meals'] is None:
            print("[레시피] 5. TheMealDB가 '결과 없음'을 반환함.")
            return None

        meal = data['meals'][0]  # 첫 번째 결과 사용
        
        # 재료 목록 추출
        ingredients = []
        for i in range(1, 21):  # TheMealDB는 최대 20개의 재료를 제공
            ingredient = meal.get(f'strIngredient{i}')
            measure = meal.get(f'strMeasure{i}')
            
            if ingredient and ingredient.strip() != "":
                ingredients.append({
                    "name": ingredient,
                    "amount": measure or "",
                    "category": "main"
                })
            else:
                break  # 더 이상 재료가 없으면 종료
        
        # 조리 순서 추출 (TheMealDB는 하나의 큰 텍스트로 제공)
        instructions = []
        instruction_text = meal.get('strInstructions', '')
        
        if instruction_text:
            # 간단한 분할을 위해 줄바꿈 기준으로 순서 생성 (실제로는 더 정교한 분할 필요)
            steps = instruction_text.split('\n')
            for i, step in enumerate(steps, 1):
                if step.strip():
                    instructions.append({
                        "step": i,
                        "description": step.strip()
                    })
        
        # 영양 정보는 TheMealDB가 제공하지 않음
        nutrition_info = {}
        
        result = {
            "menu_name": meal.get('strMeal', menu_name),
            "cooking_time": "",  # TheMealDB는 조리 시간을 별도로 제공하지 않음
            "difficulty": "",    # 난이도 정보 없음
            "ingredients": ingredients,
            "instructions": instructions,
            "nutrition_info": nutrition_info,
            "image_url": meal.get('strMealThumb'),
            "category": meal.get('strCategory'),
            "area": meal.get('strArea'),  # 국가/지역 정보
        }
        
        print("[레시피] 6. TheMealDB에서 레시피 정보 추출 성공")
        return result
        
    except requests.RequestException as e:
        print(f"[레시피] TheMealDB API 요청 실패: {e}")
        return {"error": "api_failed", "message": str(e)}
    except Exception as e:
        print(f"[레시피] TheMealDB 데이터 처리 오류: {e}")
        return {"error": "internal_error", "message": str(e)}