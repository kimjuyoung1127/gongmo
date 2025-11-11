import requests
import json
import sys
import os

# API에서 가져올 수 있도록 부모 디렉토리를 경로에 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Flask 서버 주소 (로컬에서 테스트할 경우)
BASE_URL = 'http://localhost:5000'

def test_health_check():
    """Health check 엔드포인트 테스트"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        print("Health check 테스트 완료\n")
    except Exception as e:
        print(f"Error during health check: {e}\n")

def test_upload_receipt(image_path):
    """Receipt 업로드 테스트"""
    try:
        with open(image_path, 'rb') as image_file:
            files = {'image': image_file}
            response = requests.post(f"{BASE_URL}/upload", files=files)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        print("Upload receipt 테스트 완료\n")
    except Exception as e:
        print(f"Error during upload receipt test: {e}\n")

def main():
    print("API 테스트 시작\n")
    
    # Health check 테스트
    test_health_check()
    
    # Upload receipt 테스트 (실제 이미지 경로로 변경 필요)
    # test_upload_receipt("../test_images/test_image.jpg")
    
    print("API 테스트 완료")
    print("Upload 테스트를 하려면 실제 이미지 경로를 지정해 주세요.")

if __name__ == "__main__":
    main()