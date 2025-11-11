# 🧠 백엔드 (v2.0 - for AI App)

이 백엔드는 **Flask 기반**으로 구축되었으며, **스마트폰 앱**을 위한 핵심 비즈니스 로직을 담당합니다. 주요 기능은 **영수증 이미지 처리**, **AI 기반 품목 분류**, **바코드 조회**, **유통기한 예측**, 그리고 **Supabase DB 저장**입니다.

---

## 🔧 주요 기능

- **영수증 처리:** 영수증 이미지를 업로드받아 네이버 Clova OCR로 텍스트를 추출합니다.
- **AI 품목 분류:** 추출된 텍스트를 TF-IDF + Naive Bayes 기반의 자체 AI 모델(`model.pkl`)로 분석하여 품목을 표준 카테고리로 분류합니다.
- **바코드 조회:** 상품 바코드(GTIN)를 입력받아 외부 API(식품안전나라 등)를 통해 정확한 상품 정보를 조회합니다.
- **유통기한 예측:** 분류된 카테고리와 예외 규칙(`expiry_rules`)을 조합하여 유통기한을 계산합니다.
- **DB 연동:** 처리된 모든 데이터를 Supabase 데이터베이스에 저장합니다.

---

## 📁 디렉토리 구조

```
backend/
├── api/                    # API 엔드포인트
│   └── app.py             # Flask 메인 애플리케이션
├── ml/                     # 머신러닝 관련 코드
│   ├── train.py           # 모델 예측 함수
│   └── train_model.py     # 모델 학습 스크립트
├── utils/                  # 유틸리티 함수
│   └── expiry_logic.py    # 유통기한 계산 및 OCR 처리 로직
├── tests/                  # 테스트 스크립트
│   ├── test_api.py        # API 테스트
│   └── test_model.py      # 모델 테스트
├── data/                   # 데이터 파일 및 모델 저장소
│   ├── food_dataset_v2.csv # 학습용 식품 데이터셋
│   ├── model.pkl          # 학습된 AI 모델
│   └── vectorizer.pkl     # 학습된 TF-IDF 벡터라이저
├── db/                     # 데이터베이스 스키마 및 마이그레이션
│   └── schema.sql         # Supabase DB 스키마
├── .env                   # 환경 변수 파일
├── requirements.txt       # Python 의존성 목록
└── run.py                 # 애플리케이션 실행 엔트리 포인트
```

---

## ⚙️ 백엔드 실행 방법

1. 의존성 설치:
   ```bash
   pip install -r requirements.txt
   ```

2. `.env` 파일에 환경 변수 설정

3. Flask 앱 실행:
   ```bash
   python run.py
   ```

---

## 🌐 API 엔드포인트

- `GET /health`
  - **설명:** 서버 상태를 확인하는 헬스 체크 API입니다.
  - **응답:** `{"status": "ok"}`

- `POST /upload_receipt`
  - **설명:** 영수증 이미지를 받아 처리하고, 품목별 정보를 DB에 저장합니다.
  - **요청:** `multipart/form-data` 형식의 이미지 파일
  - **응답:** `{"message": "Receipt processed successfully", "items": [...]}`

- `POST /lookup_barcode`
  - **설명:** 상품 바코드(GTIN)를 받아 해당 상품의 정보를 반환합니다.
  - **요청:** `{"barcode": "8801234567890"}`
  - **응답:** `{"name": "서울우유", "category": "dairy_fresh", ...}`

---

## 🔑 환경 변수 (.env)

- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_SERVICE_KEY`: Supabase 서비스 키
- `CLOVA_API_URL`: 네이버 Clova OCR API URL
- `CLOVA_SECRET_KEY`: Clova OCR 비밀 키
- `MODEL_PATH`: 학습된 모델 경로 (기본값: `data/model.pkl`)
- `VECTORIZER_PATH`: 학습된 벡터라이저 경로 (기본값: `data/vectorizer.pkl`)
- `FOOD_SAFETY_KOREA_API_KEY`: (선택) 식품안전나라 API 사용 시 필요한 키