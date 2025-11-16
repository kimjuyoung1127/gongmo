"""
인벤토리 관련 라우트 블루프린트
재고 관리 및 기능 API
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta

inventory_bp = Blueprint('inventory_bp', __name__)


@inventory_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Flask 서버가 작동 중입니다', 'blueprint': 'inventory_bp'})


@inventory_bp.route('/inventory/batch_add', methods=['POST'])
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
        
        # Import supabase from parent app module
        from .. import supabase
        
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
