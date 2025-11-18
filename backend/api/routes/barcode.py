"""
바코드 조회 관련 라우트 블루프린트
상품 정보 조회 및 캐싱 API
"""
from flask import Blueprint, request, jsonify
# utils의 함수들을 상대 경로로 가져옴
from ..utils.barcode_lookup import (
    get_product_info_from_db, 
    save_product_to_db,
    get_product_info_from_food_safety_korea, 
    get_product_info_from_open_food_facts, 
    get_product_info_from_food_qr
)

barcode_bp = Blueprint('barcode_bp', __name__)


@barcode_bp.route('/lookup_barcode', methods=['POST'])
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
            'message': '해당 바코드의 상품 정보를 찾을 수 없습니다. 직접 입력해주세요.',
            'data': {
                'barcode': barcode,
                'product_name': '상품 정보 없음',
                'category_id': None,
                'manufacturer': '알 수 없음',
                'source': 'not_found'
            }
        }), 200  # Use 200 instead of 404 to avoid error in app

    except Exception as e:
        print(f"[LOOKUP] Error in /lookup_barcode: {e}")
        return jsonify({
            'status': 'error',
            'message': '서버 내부 오류가 발생했습니다.'
        }), 500
