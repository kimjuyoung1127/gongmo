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


@ocr_bp.route('/upload_receipt', methods=['POST'])
async def upload_receipt():
    """
    영수증 이미지를 처리하고 AI 분석 결과를 반환합니다. (LLM 기반)
    프론트엔드와 표준화된 응답 형식을 사용합니다.
    """
    print("[DEBUG] /upload_receipt 시작 (LLM 기반)")
    
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
            
            print("[CLOVA] 클로바 OCR 호출 시작")
            clova_response = call_clova_ocr(resized_image_data)
            
            if not clova_response:
                raise Exception("클로바 OCR 호출 실패")
            
            print("[DEBUG] LLM 기반 파싱 시작")
            # 비동기 함수 호출
            processed_items = await parse_clova_response_to_items(clova_response)
            print(f"[DEBUG] LLM 처리 완료, 처리된 항목 수: {len(processed_items)}")

            # 디버깅: 처리된 아이템 구조 확인
            print(f"[DEBUG] 처리된 아이템 상세 정보:")
            for i, item in enumerate(processed_items):
                print(f"[DEBUG] 아이템 {i+1}: {item}")

            # inventory 테이블에 직접 저장
            inventory_items = []
            
            for item in processed_items:
                try:
                    expiry_date = datetime.now().date() + timedelta(days=item.get('expiry_days', 7))
                    print(f"[DEBUG] 만료일 계산: {expiry_date}")
                    
                    inventory_item = {
                        "name": item.get('item_name'),
                        "category_id": item.get('category_id'),
                        "quantity": item.get('quantity', 1),
                        "expiry_date": expiry_date.isoformat(),
                        "source_type": 'receipt',
                        "store_name": 'Unknown Store', # TODO: LLM으로 가게 이름도 추출 가능
                        "raw_text": item.get('raw_text'),
                        "purchase_date": datetime.now().date().isoformat(),
                        "user_id": user_id
                    }
                    print(f"[DEBUG] 생성된 inventory 아이템: {inventory_item}")
                    inventory_items.append(inventory_item)
                except Exception as item_error:
                    print(f"[DEBUG] 아이템 처리 중 에러: {str(item_error)}")
                    continue
            
            stored_inventory_items = []
            # Supabase 클라이언트 직접 생성
            from supabase import create_client
            supabase_url = os.environ.get('SUPABASE_URL')
            supabase_key = os.environ.get('SUPABASE_ANON_KEY')
            supabase = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None
            
            if inventory_items and supabase:
                print(f"[DEBUG] inventory 테이블 저장 시작, 항목 수: {len(inventory_items)}")
                try:
                    response = supabase.table('inventory').insert(inventory_items).execute()
                    if response.data:
                        stored_inventory_items = response.data
                        print(f"[DEBUG] inventory 저장 성공, 저장된 항목 수: {len(stored_inventory_items)}")
                    else:
                        print(f"[DEBUG] inventory 저장 실패 - 응답 데이터 없음: {response}")
                except Exception as db_error:
                    print(f"[DEBUG] inventory 저장 예외: {str(db_error)}")
            else:
                print("[DEBUG] inventory 저장 생략 (데이터 없음 또는 Supabase 클라이언트 없음)")

            return jsonify({
                'success': True,
                'processed_count': len(stored_inventory_items),
                'message': f'{len(stored_inventory_items)}개 품목이 재고에 저장되었습니다.'
            })

        finally:
            os.unlink(temp_image_path)

    except Exception as e:
        print(f"[DEBUG] /upload_receipt 전체 예외: {str(e)}")
        import traceback
        print(f"[DEBUG] 예외 상세: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500
