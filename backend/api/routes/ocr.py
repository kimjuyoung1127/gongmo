"""
OCR 관련 라우트 블루프린트
영수증 이미지 업로드 및 처리 API
"""
from flask import Blueprint, request, jsonify
import tempfile
import os
from datetime import datetime, timedelta
from ..ocr_service import resize_image_for_clova, call_clova_ocr, parse_clova_response_to_items

ocr_bp = Blueprint('ocr_bp', __name__)


@ocr_bp.route('/upload_receipt_image', methods=['POST'])
def upload_receipt():
    """
    영수증 이미지를 수신하고, PaddleOCR 및 AI 모델을 통해 처리한 후,
    추출된 정보를 데이터베이스에 저장하는 API 엔드포인트입니다.
    """
    try:
        # Check if image file is present in the request
        if 'image' not in request.files:
            return jsonify({'status': 'error', 'message': '이미지 파일이 제공되지 않았습니다'}), 400

        image_file = request.files['image']

        # Create a temporary file to save the uploaded image
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            image_file.save(temp_file.name)
            temp_image_path = temp_file.name

        try:
            # 영수증 이미지 처리 (PaddleOCR 인스턴스 전달)
            model_path = os.environ.get('MODEL_PATH', 'models/item_classifier.pkl')
            
            # 이미지 리사이즈 후 읽기
            print("[CLOVA] 이미지 리사이즈 시작")
            resized_image_data = resize_image_for_clova(temp_image_path)
            
            print("[CLOVA] 클로바 OCR 호출 시작")
            clova_response = call_clova_ocr(resized_image_data)
            
            if not clova_response:
                raise Exception("클로바 OCR 호출 실패")
            
            print("[DEBUG] 클로바 OCR 결과 파싱 시작")
            processed_items = parse_clova_response_to_items(clova_response)
            print(f"[DEBUG] 클로바 OCR 처리 완료, 처리된 항목 수: {len(processed_items)}")

            # Import supabase from parent app module
            from .. import supabase

            # --- 데이터베이스 삽입 로직 수정 ---
            if supabase:
                # 1. receipts 테이블에 삽입
                # TODO: 실제 user_id는 JWT 토큰 등에서 추출해야 함. Supabase RLS 정책이 auth.uid()를 사용하므로, 클라이언트에서 인증된 사용자로 요청해야 함.
                # TODO: image_url은 Supabase Storage에 업로드 후 URL을 받아와야 함.
                # TODO: ocr_text는 PaddleOCR의 전체 텍스트를 저장할 수 있음.
                receipt_record = {
                    "store_name": "Unknown Store", # TODO: 영수증에서 가게 이름 파싱 필요
                    "image_url": None # 임시
                }
                insert_receipt_response = supabase.table('receipts').insert(receipt_record).execute()
                
                if not insert_receipt_response.data:
                    raise Exception("영수증 레코드 생성에 실패했습니다.")
                
                receipt_id = insert_receipt_response.data[0]['id']

                # 2. receipt_items 테이블에 삽입할 데이터 준비
                items_to_insert = []
                for item in processed_items:
                    items_to_insert.append({
                        "receipt_id": receipt_id,
                        "raw_text": item.get('item_name'), 
                        "clean_text": item.get('item_name'),
                        "category_id": item.get('category_id'),  # 카테고리 ID 추가
                        "expiry_days": item.get('predicted_expiry_days'),
                        "status": 'parsed'
                    })
                
                if items_to_insert:
                    supabase.table('receipt_items').insert(items_to_insert).execute()

            # 처리된 항목 반환
            return jsonify({
                'status': 'success',
                'message': f'{len(processed_items)}개 항목이 처리되고 영수증에 연결되었습니다',
                'data': processed_items
            })
        finally:
            # 임시 파일 정리
            os.unlink(temp_image_path)

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@ocr_bp.route('/upload_receipt', methods=['POST'])
def upload_receipt_v2():
    """
    영수증 이미지를 처리하고 AI 분석 결과를 반환합니다.
    프론트엔드와 표준화된 응답 형식을 사용합니다.
    """
    print("[DEBUG] upload_receipt_v2 시작")
    
    try:
        # 이미지 파일 확인
        if 'image' not in request.files:
            return jsonify({'error': '이미지 파일이 제공되지 않았습니다'}), 400

        # user_id 확인
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id가 제공되지 않았습니다'}), 400
        
        print(f"[USER] 수신된 user_id: {user_id}")

        image_file = request.files['image']

        # 임시 파일 생성
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
            image_file.save(temp_file.name)
            temp_image_path = temp_file.name

        try:
            # 이미지 리사이즈 후 읽기
            print("[CLOVA] 이미지 리사이즈 시작")
            resized_image_data = resize_image_for_clova(temp_image_path)
            
            print("[CLOVA] 클로바 OCR v2 호출 시작")
            clova_response = call_clova_ocr(resized_image_data)
            
            if not clova_response:
                raise Exception("클로바 OCR v2 호출 실패")
            
            print("[DEBUG] 클로바 OCR v2 결과 파싱 시작")
            processed_items = parse_clova_response_to_items(clova_response)
            print(f"[DEBUG] 클로바 OCR v2 처리 완료, 처리된 항목 수: {len(processed_items)}")

            # inventory 테이블에 직접 저장 (단일 테이블 구조)
            inventory_items = []
            
            for item in processed_items:
                expiry_date = datetime.now().date() + timedelta(days=item.get('predicted_expiry_days', 7))
                inventory_items.append({
                    "name": item.get('item_name'),
                    "category_id": item.get('category_id'),
                    "quantity": item.get('quantity', 1),
                    "expiry_date": expiry_date.isoformat(),
                    "source_type": 'receipt',
                    "store_name": 'Unknown Store',
                    "raw_text": item.get('item_name'),
                    "purchase_date": datetime.now().date().isoformat(),
                    "user_id": user_id  # ✅ 실제 사용자 ID 적용
                })
            
            stored_inventory_items = []
            # Import supabase from parent app module
            from .. import supabase
            
            if inventory_items and supabase:
                print(f"[DEBUG] inventory 테이블 직접 저장 시작, 항목 수: {len(inventory_items)}")
                try:
                    response = supabase.table('inventory').insert(inventory_items).execute()
                    if response.data:
                        stored_inventory_items = response.data
                        print(f"[DEBUG] inventory 저장 성공, 저장된 항목 수: {len(stored_inventory_items)}")
                    else:
                        print("[DEBUG] inventory 저장 실패")
                except Exception as db_error:
                    print(f"[DEBUG] inventory 저장 실패: {str(db_error)}")
            else:
                print("[DEBUG] inventory 저장 생략 (데이터 없음)")

            # 단일 테이블 구조: 더 이상 receipt_items 불필요
            print("[DEBUG] 단일 inventory 테이블 구조로 처리 완료")

            # 단일 테이블 구조: 직접 저장된 inventory 데이터 사용
            response_items = []
            for idx, item in enumerate(stored_inventory_items):
                response_items.append({
                    "id": item['id'],  # 실제 DB ID
                    "raw_text": item['raw_text'],
                    "clean_text": item['name'],  # inventory.name 필드
                    "pred": {
                        "category_id": item['category_id'],
                        "category_code": f"cat_{item['category_id']}",
                        "confidence": 0.85  # 임시 신뢰도
                    },
                    "expiry_days": (datetime.strptime(item['expiry_date'], '%Y-%m-%d').date() - datetime.now().date()).days,
                    "quantity_hint": item['quantity']
                })

            return jsonify({
                'success': True,
                'processed_count': len(stored_inventory_items),
                'message': f'{len(stored_inventory_items)}개 품목이 재고에 저장되었습니다.'
            })

        finally:
            os.unlink(temp_image_path)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
