from flask import Blueprint, request, jsonify
from supabase import Client
import os
from typing import List, Dict, Any
import requests
from ..services.recipe_service import get_recipe_detail, search_recipes_by_ingredients, generate_recipe_with_gemini
from ..utils.food_api import get_recipes_from_food_safety_korea, get_recipes_from_themealdb
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# 레시피 블루프린트 생성
recipe_bp = Blueprint('recipe_bp', __name__)

# 전역 Supabase 클라이언트 (app.py에서 설정)
supabase_client: Client = None

def set_supabase_client(client: Client):
    """
    app.py에서 초기화된 Supabase 클라이언트를 설정합니다.
    """
    global supabase_client
    supabase_client = client

@recipe_bp.route('/search', methods=['GET'])
def search_recipes():
    """
    사용자의 재료 기반 레시피 검색
    쿼리 파라미터: ingredients (콤마로 구분된 재료 목록)
    """
    try:
        # 쿼리 파라미터에서 재료 목록 가져오기
        ingredients_param = request.args.get('ingredients', '')
        if not ingredients_param:
            return jsonify({'error': '재료 목록이 필요합니다. 예: ?ingredients=계란,우유,빵'}), 400

        ingredients = [ing.strip() for ing in ingredients_param.split(',')]

        # Supabase 클라이언트 확인
        if not supabase_client:
            print("[레시피] 오류: Supabase 클라이언트가 초기화되지 않았습니다")
            return jsonify({'error': '데이터베이스 연결이 필요합니다.'}), 500

        # 재료 기반 레시피 검색
        recipes = search_recipes_by_ingredients(ingredients, supabase_client)

        # Convert datetime objects to strings for JSON serialization
        for recipe in recipes:
            if 'created_at' in recipe and hasattr(recipe['created_at'], 'isoformat'):
                recipe['created_at'] = recipe['created_at'].isoformat()
            if 'updated_at' in recipe and hasattr(recipe['updated_at'], 'isoformat'):
                recipe['updated_at'] = recipe['updated_at'].isoformat()

        # 사용자에게 전달할 응답 개선
        response_data = {
            'recipes': recipes,
            'count': len(recipes),
            'ingredients_used': ingredients
        }

        # 레시피가 없을 경우 사용자 친화적인 메시지 추가
        if len(recipes) == 0:
            response_data['message'] = '제공된 재료로 가능한 레시피를 찾지 못했어요. 다른 재료로 검색해 보세요.'

        return jsonify(response_data), 200

    except Exception as e:
        print(f"[레시피 검색 오류] {str(e)}")
        return jsonify({
            'error': '레시피 검색 중 오류가 발생했습니다.',
            'message': '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        }), 500


@recipe_bp.route('/generate', methods=['GET'])
def generate_recipe():
    """
    Gemini API를 사용하여 재료 기반으로 레시피를 생성합니다.
    """
    print("[AI 레시피] 생성 요청 시작")
    try:
        ingredients_param = request.args.get('ingredients', '')
        if not ingredients_param:
            print("[AI 레시피] 오류: 재료 파라미터가 없습니다.")
            return jsonify({'error': '재료 목록이 필요합니다.'}), 400

        ingredients = [ing.strip() for ing in ingredients_param.split(',')]
        print(f"[AI 레시피] 입력된 재료: {ingredients}")
        
        print("[AI 레시피] Gemini API 호출 시작")
        recipe = generate_recipe_with_gemini(ingredients)
        print("[AI 레시피] Gemini API 호출 완료")

        if recipe:
            print(f"[AI 레시피] 생성 성공: {recipe.get('RCP_NM', '이름 없음')}")
            return jsonify({'recipes': [recipe], 'count': 1, 'is_generated': True}), 200
        else:
            print("[AI 레시피] 오류: 생성된 레시피가 없습니다.")
            return jsonify({'error': 'AI 레시피 생성에 실패했습니다.'}), 500

    except Exception as e:
        print(f"[AI 레시피 생성 오류] {str(e)}")
        return jsonify({'error': 'AI 레시피 생성 중 오류가 발생했습니다.'}), 500


@recipe_bp.route('/detail/<menu_name>', methods=['GET'])
def get_recipe_detail_route(menu_name):
    """
    레시피 상세 정보 조회
    """
    try:
        if not menu_name:
            return jsonify({'error': '레시피 이름이 필요합니다.'}), 400

        # Supabase 클라이언트 확인
        if not supabase_client:
            print("[레시피] 오류: Supabase 클라이언트가 초기화되지 않았습니다")
            return jsonify({'error': '데이터베이스 연결이 필요합니다.'}), 500

        recipe_detail = get_recipe_detail(menu_name, supabase_client)

        if not recipe_detail:
            return jsonify({
                'error': '해당 레시피를 찾을 수 없습니다.',
                'message': '죄송합니다. 요청하신 레시피를 현재 찾을 수 없습니다. 다른 레시피를 검색해 보세요.'
            }), 404

        # status가 not_found인 경우 사용자 친화적인 메시지 반환
        if recipe_detail.get('status') == 'not_found':
            return jsonify({
                'error': '해당 레시피를 찾을 수 없습니다.',
                'message': recipe_detail.get('message', '죄송합니다. 요청하신 레시피를 현재 찾을 수 없습니다. 다른 레시피를 검색해 보세요.')
            }), 404

        # status가 error인 경우 내부 오류 메시지 반환
        if recipe_detail.get('status') == 'error':
            return jsonify({
                'error': '레시피 정보를 불러오는 중 오류가 발생했습니다.',
                'message': recipe_detail.get('message', '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
            }), 500

        return jsonify(recipe_detail), 200

    except Exception as e:
        print(f"[레시피 상세 조회 오류] {str(e)}")
        return jsonify({
            'error': '레시피 상세 정보 조회 중 오류가 발생했습니다.',
            'message': '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
        }), 500


@recipe_bp.route('/complete', methods=['POST'])
def complete_recipe():
    """
    요리 완료 처리 - 재고 차감
    요청 바디: {
        'recipe_id': '레시피 ID',
        'user_id': '사용자 ID',
        'ingredients_used': [
            {
                'name': '재료 이름',
                'quantity_used': '사용한 수량'
            }
        ]
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': '요청 데이터가 필요합니다.'}), 400

        recipe_id = data.get('recipe_id')
        user_id = data.get('user_id')
        ingredients_used = data.get('ingredients_used', [])
        
        # AI 생성 레시피의 경우 ID가 없을 수 있음
        # 이 경우 menu_name과 recipe_data를 받아와서 먼저 저장 후 ID 생성
        if not recipe_id:
            menu_name = data.get('menu_name')
            recipe_data = data.get('recipe_data')
            
            if menu_name and recipe_data:
                print(f"[레시피 완료] ID 없음, 새 레시피 저장 시도: {menu_name}")
                from ..services.recipe_service import save_generated_recipe
                saved_recipe = save_generated_recipe(menu_name, recipe_data, supabase_client)
                
                if saved_recipe:
                    recipe_id = saved_recipe.get('id')
                    print(f"[레시피 완료] 새 레시피 저장 완료, ID: {recipe_id}")
                else:
                    return jsonify({'error': '레시피 저장에 실패했습니다.'}), 500
            else:
                return jsonify({'error': '레시피 ID 또는 레시피 데이터가 필요합니다.'}), 400

        if not recipe_id or not user_id:
            return jsonify({'error': '레시피 ID와 사용자 ID가 필요합니다.'}), 400

        # Supabase 클라이언트 확인
        if not supabase_client:
            print("[레시피] 오류: Supabase 클라이언트가 초기화되지 않았습니다")
            return jsonify({'error': '데이터베이스 연결이 필요합니다.'}), 500

        # 사용자 재고에서 해당 재료 차감 로직 구현
        # 이 부분은 추후 구체화
        # 실제로 재고 테이블에서 해당 재료들 상태를 consumed로 변경하거나 수량 차감

        # 재고 상태 업데이트 로직 (임시)
        for ingredient in ingredients_used:
            ingredient_name = ingredient.get('name')
            quantity_used = ingredient.get('quantity_used', 1)

            # 재고에서 해당 아이템 찾기
            inventory_response = supabase_client.table('inventory').select('*').eq('name', ingredient_name).eq('user_id', user_id).eq('status', 'active').execute()

            if inventory_response.data:
                inventory_item = inventory_response.data[0]

                # 수량이 1 이상인 경우 수량 차감, 아니면 상태 변경
                if inventory_item.get('quantity', 1) > quantity_used:
                    # 수량 차감
                    updated_quantity = inventory_item['quantity'] - quantity_used
                    supabase_client.table('inventory').update({'quantity': updated_quantity}).eq('id', inventory_item['id']).execute()
                else:
                    # 상태를 consumed로 변경
                    supabase_client.table('inventory').update({'status': 'consumed'}).eq('id', inventory_item['id']).execute()

        return jsonify({
            'message': '요리 완료 처리가 성공적으로 완료되었습니다.',
            'recipe_id': recipe_id,
            'ingredients_used': ingredients_used
        }), 200

    except Exception as e:
        print(f"[레시피 완료 처리 오류] {str(e)}")
        return jsonify({'error': '요리 완료 처리 중 오류가 발생했습니다.'}), 500