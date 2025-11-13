from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import tempfile
# PaddleOCR 임포트
from paddleocr import PaddleOCR
from utils.expiry_logic import process_receipt_image
from supabase import create_client, Client
# 바코드 조회 유틸리티 함수 임포트
from utils.barcode_lookup import get_product_info_from_food_safety_korea, get_product_info_from_open_food_facts, get_product_info_from_food_qr

# .env 파일에서 환경 변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app)  # 모든 라우트에 대해 CORS 활성화

# PaddleOCR 초기화 (앱 시작 시 한 번만)
# lang='korean'으로 한국어 모델 로드
# use_gpu=False로 CPU 사용 (GPU 사용 시 use_gpu=True 설정 및 관련 드라이버 필요)
ocr = PaddleOCR(lang='korean')

# Supabase 클라이언트 초기화
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_SERVICE_KEY')  # 쓰기 작업에는 서비스 키 사용
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# 기본 상태 확인 엔드포인트
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK', 'message': 'Flask 서버가 작동 중입니다'})

# 영수증 업로드 엔드포인트
@app.route('/upload', methods=['POST'])
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
            model_path = os.environ.get('MODEL_PATH', 'data/model.pkl')
            
            processed_items = process_receipt_image(
                temp_image_path,
                model_path,
                ocr # PaddleOCR 인스턴스 전달
            )

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
                    # TODO: process_receipt_image가 category_id를 반환하도록 수정 필요
                    items_to_insert.append({
                        "receipt_id": receipt_id,
                        "raw_text": item.get('item_name'), # TODO: 원본 텍스트 필드 필요
                        "clean_text": item.get('item_name'),
                        # "category_id": item.get('category_id'), 
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

# 바코드 조회 엔드포인트 (구현 완료)
@app.route('/lookup_barcode', methods=['POST'])
def lookup_barcode():
    """
    바코드 번호를 받아 외부 API를 통해 상품 정보를 조회하는 API 엔드포인트입니다.
    하이브리드 전략: 1. Open Food Facts -> 2. FOOD_QR -> 3. 식품안전나라
    """
    try:
        data = request.get_json()
        barcode = data.get('barcode')

        if not barcode:
            return jsonify({'status': 'error', 'message': '바코드 번호가 제공되지 않았습니다'}), 400

        # 1. Open Food Facts API 먼저 조회
        product_info = get_product_info_from_open_food_facts(barcode)
        if product_info and 'error' not in product_info:
            return jsonify({'status': 'success', 'message': 'Open Food Facts API에서 상품 정보를 성공적으로 조회했습니다', 'data': product_info}), 200
        if product_info and 'error' in product_info:
            print(f"Open Food Facts API Error: {product_info['error']}")

        # 2. FOOD_QR API 조회
        product_info = get_product_info_from_food_qr(barcode)
        if product_info and 'error' not in product_info:
            return jsonify({'status': 'success', 'message': 'FOOD_QR API에서 상품 정보를 성공적으로 조회했습니다', 'data': product_info}), 200
        if product_info and 'error' in product_info:
            print(f"FOOD_QR API Error: {product_info['error']}")

        # 3. 식품안전나라 API 조회
        product_info = get_product_info_from_food_safety_korea(barcode)
        if product_info and 'error' not in product_info:
            return jsonify({'status': 'success', 'message': '식품안전나라 API에서 상품 정보를 성공적으로 조회했습니다', 'data': product_info}), 200
        if product_info and 'error' in product_info:
            print(f"Food Safety Korea API Error: {product_info['error']}")

        # 모든 API에서 제품을 찾지 못했을 경우
        return jsonify({'status': 'not_found', 'message': '모든 API에서 해당 바코드의 상품 정보를 찾을 수 없습니다.'}), 404

    except Exception as e:
        print(f"Error in /lookup_barcode: {e}")
        return jsonify({
            'status': 'error',
            'message': '서버 내부 오류가 발생했습니다.'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
