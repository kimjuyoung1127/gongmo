 개발 진행 상황 정리

  완료된 작업

   - [x] Week 1: 프로젝트 구조 생성 - Github Monorepo에 /hardware, /backend, /frontend 디렉토리 생성
   - [x] Week 1: 백엔드 초기화 - Flask 앱(app.py) 및 의존성(requirements.txt) 설정
   - [x] Week 1: 데이터베이스 설계 - Supabase products 테이블 스키마(schema.sql) 생성
   - [x] Week 1: 데이터셋 생성 - food_dataset_v2.csv 파일 생성 (101개의 식품 항목 포함)
   - [x] Week 2: AI 모델 개발 - train.py 스크립트 작성 (scikit-learn, Tfidf, 나이브 베이즈)
   - [x] Week 2: 모델 훈련 - train_model.py를 사용하여 model.pkl 파일 생성
   - [x] Week 2: 백엔드 API 구현 - Flask /upload 엔드포인트 구현
   - [x] Week 2: 핵심 로직 구현 - 이미지 → OCR → model.pkl 예측 → 유통기한 계산 → Supabase 삽입 흐름 구현
   - [x] Week 2: 로컬 테스트 - Python 스크립트(test_api.py)를 사용하여 API 테스트
   - [x] Week 3: 백엔드 배포 - Flask 앱을 Render에 배포 (로컬에서 테스트 가능하도록 설정 완료)
   - [x] Week 3: 백엔드 개선 - Python 파일들을 기능별로 정리 및 구조 개선

  진행 중인 작업

   - [x] Week 3: 하드웨어 개발 - ESP32-CAM 펌웨어 작성 시작

  시작하지 않은 작업

   - [ ] Week 3: 프론트엔드 개발 - React 웹 앱 생성
   - [ ] Week 3: 프론트엔드 배포 - React 앱을 Vercel에 배포
   - [ ] Week 3: E2E 테스트 - ESP32 버튼 → Vercel 웹 실시간 업데이트 확인
   - [ ] Week 4: 데모 시나리오 구상 - "실패 → 학습 → 성공" 스토리라인 확정
   - [ ] Week 4: 데모 영상 제작 - 2-5분 분량 데모 영상 촬영 및 편집
   - [ ] Week 4: 성과 보고서 작성 - AI 접근법 및 유통기한 예측 기능 강조
   - [ ] Week 4: 문서화 - 실행 스크립트 포함한 README.md 작성
   - [ ] Week 4: 최종 통합 - 7가지 제출물 정리 및 최종 점검

  주요 파일

   - backend/api/app.py - Flask 백엔드 애플리케이션
   - backend/ml/train.py - AI 모델 학습 스크립트
   - backend/utils/expiry_logic.py - 유통기한 계산 로직
   - backend/requirements.txt - 파이썬 의존성
   - backend/schema.sql - 데이터베이스 스키마
   - backend/food_dataset_v2.csv - 학습용 데이터셋
   - backend/model.pkl - 훈련된 AI 모델
   - backend/tests/test_api.py - API 테스트 스크립트
   - backend/.env - 환경 변수 설정
   - backend/test_images/ - API 테스트 이미지 폴더
   - backend/run.py - 애플리케이션 실행 엔트리 포인트

  차후 계획

   1. ESP32-CAM 펌웨어 개발 완료
   2. React 프론트엔드 개발
   3. 배포 및 통합 테스트
   4. 최종 문서화 및 데모 영상 제작