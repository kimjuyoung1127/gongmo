from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import tempfile
# PaddleOCR 임포트
from paddleocr import PaddleOCR
from utils.expiry_logic import process_receipt_image # get_clova_api_details 제거
from supabase import create_client, Client

# .env 파일에서 환경 변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app)  # 모든 라우트에 대해 CORS 활성화

# PaddleOCR 초기화 (앱 시작 시 한 번만)
# lang='korean'으로 한국어 모델 로드
# use_gpu=False로 CPU 사용 (GPU 사용 시 use_gpu=True 설정 및 관련 드라이버 필요)
ocr = PaddleOCR(lang='korean', use_gpu=False)

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
            
            # process_receipt_image 함수가 PaddleOCR 인스턴스를 받도록 수정되어야 함
            # 현재는 임시로 ocr 인스턴스를 전달하는 형태로 변경
            processed_items = process_receipt_image(
                temp_image_path,
                model_path,
                ocr # PaddleOCR 인스턴스 전달
            )

            # 데이터베이스에 항목 저장
            # TODO: schema.sql 변경에 따라 receipts, receipt_items, inventory 테이블에 맞게 삽입 로직 수정 필요
            # 현재는 임시로 products 테이블에 삽입하는 로직 유지
            for item in processed_items:
                if supabase:
                    supabase.table('products').insert(item).execute()

            # 처리된 항목 반환
            return jsonify({
                'status': 'success',
                'message': f'{len(processed_items)}개 항목이 처리되고 저장되었습니다',
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

# 바코드 조회 엔드포인트 (기본 골격)
@app.route('/lookup_barcode', methods=['POST'])
def lookup_barcode():
    """
    바코드 번호를 받아 외부 API를 통해 상품 정보를 조회하는 API 엔드포인트입니다.
    """
    try:
        data = request.get_json()
        barcode = data.get('barcode')

        if not barcode:
            return jsonify({'status': 'error', 'message': '바코드 번호가 제공되지 않았습니다'}), 400

        # --- 여기에 식품안전나라 API 및 Open Food Facts API 호출 로직 구현 예정 ---
        # 예시:
        # product_info = get_product_info_from_food_safety_korea(barcode)
        # if not product_info:
        #     product_info = get_product_info_from_open_food_facts(barcode)

        # if product_info:
        #     return jsonify({
        #         'status': 'success',
        #         'message': '상품 정보를 성공적으로 조회했습니다',
        #         'data': product_info
        #     })
        # else:
        #     return jsonify({'status': 'error', 'message': '상품 정보를 찾을 수 없습니다'}), 404
        
        return jsonify({
            'status': 'success',
            'message': f'바코드 {barcode} 조회 요청 수신. 구현 예정.',
            'data': {'barcode': barcode, 'name': '상품명 (구현 예정)', 'category': '카테고리 (구현 예정)'}
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
