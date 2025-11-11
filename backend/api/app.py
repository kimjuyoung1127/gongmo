from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import tempfile
from utils.expiry_logic import process_receipt_image, get_clova_api_details
from supabase import create_client, Client

# .env 파일에서 환경 변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app)  # 모든 라우트에 대해 CORS 활성화

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
    ESP32-CAM에서 영수증 이미지를 수신하고,
    OCR 및 AI 모델을 통해 처리한 후,
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
            # 영수증 이미지 처리
            model_path = os.environ.get('MODEL_PATH', 'model.pkl')
            clova_api_url, clova_secret_key = get_clova_api_details()
            
            processed_items = process_receipt_image(
                temp_image_path, 
                model_path, 
                clova_api_url, 
                clova_secret_key
            )
            
            # 데이터베이스에 항목 저장
            for item in processed_items:
                if supabase:
                    # Supabase에 삽입
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)