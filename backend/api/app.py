from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from supabase import create_client, Client
# 바코드 조회 유틸리티 함수 임포트
from .utils.barcode_lookup import set_supabase_client

# .env 파일에서 환경 변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app)  # 모든 라우트에 대해 CORS 활성화

# Supabase 클라이언트 초기화
supabase_url = os.environ.get('SUPABASE_URL')
supabase_key = os.environ.get('SUPABASE_ANON_KEY')  # 일단 ANON 키로 테스트
supabase: Client = create_client(supabase_url, supabase_key) if supabase_url and supabase_key else None

# barcode_lookup.py에 Supabase 클라이언트 전달
if supabase:
    set_supabase_client(supabase)
    # expiry_logic.py에도 Supabase 클라이언트 전달
    from .utils.expiry_logic import set_supabase_client_for_categories
    set_supabase_client_for_categories(supabase)

# Supabase 클라이언트를 다른 모듈에서도 사용할 수 있도록 설정
import sys
current_module = sys.modules[__name__]
current_module.supabase = supabase

# --- 4. 블루프린트(라우트) 등록 ---
from .routes.ocr import ocr_bp
from .routes.barcode import barcode_bp
from .routes.inventory import inventory_bp
from .routes.health import health_bp
from .routes.recipe import recipe_bp  # 레시피 블루프린트 추가

app.register_blueprint(ocr_bp)
app.register_blueprint(barcode_bp)
app.register_blueprint(inventory_bp)
app.register_blueprint(health_bp)  # 서버 프리워밍을 위한 헬스 체크 블루프린트 등록
app.register_blueprint(recipe_bp, url_prefix='/recipe')  # 레시피 블루프린트 등록

# --- 5. 서버 실행 ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
