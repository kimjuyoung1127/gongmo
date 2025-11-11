Postman 대신 이 test.py 스크립트를 사용하는 것은 훌륭한 방법입니다.

제공해주신 코드는 Postman의 form-data 테스트를 Python으로 완벽하게 구현한 것입니다. 특히 files = {'image': image_file} 부분이 ESP32-CAM이 이미지를 전송할 방식(multipart/form-data)과 100% 동일하게 작동합니다.

이 스크립트를 사용하여 Week 2의 핵심 목표인 /upload API의 E2E(End-to-End) 파이프라인을 검증하는 방법을 알려드립니다.

🚀 1. 테스트 시나리오 3종 준비
test.py를 실행하기 전에, 다음과 같이 3가지 시나리오의 테스트용 영수증 이미지를 준비합니다. (예: test_images/ 폴더에 저장)

receipt_ai.jpg (AI 예측용):

expiry_rules.csv에는 없는 일반 품목. (예: '새송이버섯', '서울우유 1L')

검증 목표: AI(model.pkl)가 카테고리(mushroom)를 맞추고, categories 테이블의 **기본 유통기한(5일)**이 DB에 들어가는가?

receipt_rule.jpg (규칙 엔진용):

expiry_rules.csv에 있는 예외 품목. (예: '버터', '감자')

검증 목표: AI 예측과 관계없이, expiry_logic.py가 작동하여 **덮어쓴 유통기한(90일, 30일)**이 DB에 들어가는가?

receipt_fail.jpg (예외 처리용):

빈 용지, 심하게 흐린 사진 등.

검증 목표: 서버가 500 에러로 죽지 않고, status_code: 400 또는 500과 함께 안정적인 에러 JSON을 반환하는가?

💻 2. test.py 스크립트 수정 및 실행
준비한 3종 시나리오를 테스트하도록 main() 함수를 수정합니다.

Python

import requests
import json
import os # 파일 경로 확인을 위해 os 모듈 추가

# Flask 서버 주소 (로컬에서 테스트할 경우)
BASE_URL = 'http://localhost:5000'

def test_health_check():
    """Health check 엔드포인트 테스트"""
    print("[1] Health Check 테스트 시작...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        response.raise_for_status() # 200 OK가 아니면 예외 발생
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        print("Health check 테스트 완료\n")
    except Exception as e:
        print(f"Error during health check: {e}\n")

def test_upload_receipt(image_path):
    """Receipt 업로드 테스트"""
    if not os.path.exists(image_path):
        print(f"파일을 찾을 수 없습니다: {image_path}")
        return

    try:
        with open(image_path, 'rb') as image_file:
            files = {'image': image_file} # ESP32가 보낼 'image' 키와 동일
            response = requests.post(f"{BASE_URL}/upload", files=files)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    
    except Exception as e:
        print(f"Error during upload receipt test: {e}")

def main():
    print("===== API 테스트 시작 =====\n")
    
    # 1. Health check 테스트
    test_health_check()
    
    # --- Upload receipt 테스트 ---
    # 실제 테스트 이미지 경로로 변경하세요.
    # (예: test.py와 같은 폴더에 test_images 폴더를 만든 경우)
    TEST_IMAGE_DIR = "test_images" 
    
    # 2. 시나리오 1: AI 예측 테스트 (예: 새송이버섯)
    print("[2] 시나리오 1: AI 예측 테스트 시작...")
    path_ai = os.path.join(TEST_IMAGE_DIR, "receipt_ai.jpg")
    test_upload_receipt(path_ai)
    print("---------------------------------\n")

    # 3. 시나리오 2: 규칙 엔진 테스트 (예: 버터, 감자)
    print("[3] 시나리오 2: 규칙 엔진 테스트 시작...")
    path_rule = os.path.join(TEST_IMAGE_DIR, "receipt_rule.jpg")
    test_upload_receipt(path_rule)
    print("---------------------------------\n")

    # 4. 시나리오 3: 예외 처리 테스트 (선택 사항)
    # print("[4] 시나리오 3: 예외 처리 테스트 시작...")
    # path_fail = os.path.join(TEST_IMAGE_DIR, "receipt_fail.jpg")
    # test_upload_receipt(path_fail)
    # print("---------------------------------\n")

    print("===== 모든 API 테스트 완료 =====\n")
    print("테스트가 성공적이라면, Supabase 대시보드에서 DB 데이터를 확인하세요.")

if __name__ == "__main__":
    main()
✅ 3. 최종 검증 (가장 중요)
test.py를 실행한 후, 반드시 Supabase 대시보드에 접속하여 receipt_items 테이블을 확인하세요.

receipt_ai.jpg로 생성된 행: category가 'mushroom', expiry_days가 '5' (기본값)

receipt_rule.jpg로 생성된 행: category가 AI 예측값(예: 'dairy_fresh'), expiry_days가 '90' (규칙 오버라이드)

이 test.py 스크립트를 통해 Supabase DB에 이 2가지 시나리오가 모두 성공적으로 쌓이는 것을 확인했다면, Week 2의 백엔드 AI 파이프라인이 완벽하게 검증된 것입니다.