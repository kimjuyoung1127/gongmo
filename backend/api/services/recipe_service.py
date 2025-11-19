from supabase import Client
import json
from typing import List, Dict, Any, Optional
from ..utils.food_api import get_recipes_from_food_safety_korea, get_recipes_from_themealdb
import google.generativeai as genai
import os

def get_recipe_detail(menu_name: str, supabase: Client) -> Optional[Dict[str, Any]]:
    """
    레시피 상세 정보 가져오기
    1. DB 캐시 확인
    2. 외부 API 호출
    3. Gemini로 데이터 변환
    4. DB 저장
    5. 반환
    """
    try:
        # 1. DB 캐시에서 레시피 정보 조회
        try:
            response = supabase.table('recipes').select('*').eq('menu_name', menu_name).single().execute()
        except Exception:
            response = None  # 레시피가 없을 경우 예외 처리

        if response and response.data:
            print(f"[레시피] ✅ DB 캐시 HIT: {menu_name}")
            return response.data

        print(f"[레시피] ❌ DB 캐시 MISS: {menu_name}, 외부 API 호출 시도")

        # 2. 외부 API에서 레시피 정보 조회
        recipe_data = get_recipes_from_food_safety_korea(menu_name) or get_recipes_from_themealdb(menu_name)

        if not recipe_data or 'error' in recipe_data:
            print(f"[레시피] ❌ 외부 API에서도 레시피를 찾을 수 없음: {menu_name}")
            return {
                "menu_name": menu_name,
                "message": "해당 레시피를 찾을 수 없습니다. 다른 레시피를 검색해 보세요.",
                "status": "not_found"
            }

        # 3. Gemini를 사용하여 데이터 변환
        gemini_api_key = os.environ.get('GEMINI_API_KEY')
        if gemini_api_key:
            genai.configure(api_key=gemini_api_key)
            model = genai.GenerativeModel('gemini-pro')

            # 식약처 데이터를 JSON 형식으로 변환 요청
            prompt = f"""
            다음 레시피 정보를 구조화된 JSON 형식으로 변환해주세요.

            레시피: {recipe_data}

            변환 형식 예시:
            {{
                "menu_name": "레시피 이름",
                "cooking_time": "조리 시간 (분)",
                "difficulty": "난이도 (초급/중급/고급)",
                "ingredients": [
                    {{"name": "재료명", "amount": "용량", "category": "카테고리"}}
                ],
                "instructions": [
                    {{"step": 1, "description": "조리 순서 설명"}}
                ],
                "nutrition_info": {{"calories": "칼로리", "protein": "단백질", "carbs": "탄수화물", "fat": "지방"}},
                "tips": "요리 꿀팁",
                "image_url": "이미지 URL"
            }}
            """

            try:
                response_gemini = model.generate_content(prompt)

                # Gemini 응답에서 JSON 추출
                try:
                    # 응답에서 JSON 부분 추출
                    response_text = response_gemini.text.strip()

                    # 코드 블록 마크다운 제거
                    if response_text.startswith('```json'):
                        response_text = response_text[7:]  # ```json 제거
                    if response_text.endswith('```'):
                        response_text = response_text[:-3]  # ``` 제거

                    recipe_json = json.loads(response_text)

                    # 4. 변환된 데이터를 DB에 저장
                    recipe_entry = {
                        "menu_name": menu_name,
                        "recipe_data": recipe_json,
                        "search_keywords": [menu_name]  # 검색 키워드 초기화
                    }

                    insert_response = supabase.table('recipes').insert(recipe_entry).execute()

                    if insert_response.data:
                        print(f"[레시피] ✅ DB 저장 성공: {menu_name}")
                        return insert_response.data[0]

                except json.JSONDecodeError as e:
                    print(f"[레시피] Gemini JSON 파싱 오류: {e}")
                    # 원본 데이터라도 저장
                    recipe_entry = {
                        "menu_name": menu_name,
                        "recipe_data": recipe_data,
                        "search_keywords": [menu_name]
                    }

                    insert_response = supabase.table('recipes').insert(recipe_entry).execute()
                    if insert_response.data:
                        return insert_response.data[0]

            except Exception as gemini_error:
                print(f"[레시피] Gemini 처리 오류: {gemini_error}")
                # Gemini 처리 실패 시에도 원본 데이터 저장
                recipe_entry = {
                    "menu_name": menu_name,
                    "recipe_data": recipe_data,
                    "search_keywords": [menu_name]
                }

                insert_response = supabase.table('recipes').insert(recipe_entry).execute()
                if insert_response.data:
                    return insert_response.data[0]

        else:
            print("[레시피] ⚠️ GEMINI_API_KEY가 설정되지 않음, 원본 데이터 저장")
            # Gemini API 키가 없는 경우 원본 데이터 저장
            recipe_entry = {
                "menu_name": menu_name,
                "recipe_data": recipe_data,
                "search_keywords": [menu_name]
            }

            insert_response = supabase.table('recipes').insert(recipe_entry).execute()
            if insert_response.data:
                return insert_response.data[0]

        return recipe_data

    except Exception as e:
        print(f"[레시피 상세 정보 오류] {str(e)}")
        return {
            "menu_name": menu_name,
            "message": "레시피 정보를 불러오는 중 오류가 발생했습니다.",
            "status": "error"
        }


def search_recipes_by_ingredients(ingredients: List[str], supabase: Client) -> List[Dict[str, Any]]:
    """
    재료 기반 레시피 검색
    1. DB에 저장된 레시피 중 재료 매칭
    2. 매칭률 계산
    3. 정렬 후 반환
    """
    try:
        # DB에서 모든 레시피 가져오기 (나중에 검색 최적화 가능)
        response = supabase.table('recipes').select('*').execute()

        recipes = response.data if response.data else []

        # 재료 매칭 알고리즘 적용
        matched_recipes = []

        for recipe in recipes:
            recipe_data = recipe.get('recipe_data', {})
            recipe_ingredients = recipe_data.get('ingredients', [])

            # 레시피에 필요한 재료 목록 추출
            required_ingredients = []
            for ing in recipe_ingredients:
                if isinstance(ing, dict) and 'name' in ing:
                    required_ingredients.append(ing['name'])
                elif isinstance(ing, str):
                    required_ingredients.append(ing)

            # 매칭률 계산
            matched_count = 0
            for user_ing in ingredients:
                for req_ing in required_ingredients:
                    if user_ing in req_ing or req_ing in user_ing:
                        matched_count += 1
                        break

            match_percentage = (matched_count / len(required_ingredients)) * 100 if required_ingredients else 0

            # 부족한 재료 계산
            missing_ingredients = [ing for ing in required_ingredients if not any(user_ing in ing or ing in user_ing for user_ing in ingredients)]

            # 매칭된 레시피에 매칭률과 부족 재료 추가
            matched_recipe = recipe.copy()
            matched_recipe['match_percentage'] = round(match_percentage, 2)
            matched_recipe['missing_ingredients'] = missing_ingredients
            matched_recipe['available_ingredients_count'] = matched_count
            matched_recipe['total_ingredients_count'] = len(required_ingredients)

            # 매칭률이 일정 이상인 경우만 추가
            if match_percentage > 0:
                matched_recipes.append(matched_recipe)

        # 매칭률 기준으로 정렬 (높은 순)
        matched_recipes.sort(key=lambda x: x['match_percentage'], reverse=True)

        # 결과가 없을 경우 사용자에게 안내 메시지와 함께 빈 배열 반환
        if not matched_recipes:
            print(f"[레시피 검색] 제공된 재료로 가능한 레시피를 찾지 못했습니다: {', '.join(ingredients)}")

        return matched_recipes[:10]  # 상위 10개만 반환

    except Exception as e:
        print(f"[레시피 검색 오류] {str(e)}")
        return []

def generate_recipe_with_gemini(ingredients: List[str]) -> Optional[Dict[str, Any]]:
    """
    Gemini API를 사용하여 재료 기반으로 레시피를 생성합니다.
    """
    gemini_api_key = os.environ.get('GEMINI_API_KEY')
    if not gemini_api_key:
        print("[레시피 생성] ⚠️ GEMINI_API_KEY가 설정되지 않았습니다.")
        return None

    try:
        genai.configure(api_key=gemini_api_key)
        model = genai.GenerativeModel('gemini-pro')

        ingredients_str = ", ".join(ingredients)
        prompt = f"""
        다음 재료를 사용하여 만들 수 있는 창의적인 레시피를 한 개만 추천해줘: {ingredients_str}.
        결과는 반드시 아래의 JSON 형식에 맞춰서 반환해줘. 다른 설명은 절대 추가하지 마.

        {{
            "menu_name": "레시피 이름",
            "description": "요리에 대한 간단하고 흥미로운 설명",
            "cooking_time": "조리 시간 (예: 30분)",
            "difficulty": "난이도 (예: 초급, 중급, 고급)",
            "ingredients": [
                {{"name": "재료명", "amount": "용량"}}
            ],
            "instructions": [
                {{"step": 1, "description": "조리 순서 1번 설명"}}
            ],
            "tips": "요리 꿀팁 (선택 사항)"
        }}
        """

        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # 코드 블록 마크다운 제거
        if response_text.startswith('```json'):
            response_text = response_text[7:-3].strip()

        recipe_json = json.loads(response_text)
        
        # API 응답 형식에 맞게 recipe_data 필드 추가
        return {
            "menu_name": recipe_json.get("menu_name", "AI 추천 레시피"),
            "recipe_data": recipe_json,
            "is_generated": True, # AI 생성 플래그
            "match_percentage": 100, # AI 추천이므로 100% 매칭으로 간주
            "missing_ingredients": []
        }

    except Exception as e:
        print(f"[레시피 생성] Gemini API 처리 오류: {e}")
        return None
