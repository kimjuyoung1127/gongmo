
## 🧠 백엔드 개요

이 백엔드는 **Flask 기반**으로 구축되었으며, **영수증 이미지 처리**, **AI 기반 품목 분류**, **유통기한 예측**, 그리고 **Supabase DB 저장** 기능을 수행합니다.

---

## 🔧 주요 기능

- 영수증 이미지 업로드 및 처리  
- TF-IDF + Naive Bayes 기반 품목 분류  
- 품목 카테고리에 따른 유통기한 예측  
- 네이버 Clova OCR 연동을 통한 텍스트 추출  
- Supabase 데이터베이스 연동 및 저장

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
├── run.py                 # 애플리케이션 실행 엔트리 포인트
└── test_images/           # API 검증용 테스트 이미지
```

---

## ⚙️ 백엔드 실행 방법

1. 의존성 설치:
   ```bash
   pip install -r requirements.txt
   ```

2. `.env` 파일에 환경 변수 설정 (루트 README 참고)

3. Flask 앱 실행:
   ```bash
   python run.py
   ```

---

## 🌐 API 엔드포인트

- `GET /health` → 서버 상태 확인용 헬스 체크  
- `POST /upload` → 영수증 이미지 업로드 및 처리

---

## 🔑 환경 변수 (.env)

- `SUPABASE_URL`: Supabase 프로젝트 URL  
- `SUPABASE_SERVICE_KEY`: Supabase 서비스 키  
- `CLOVA_API_URL`: 네이버 Clova OCR API URL  
- `CLOVA_SECRET_KEY`: Clova OCR 비밀 키  
- `MODEL_PATH`: 학습된 모델 경로 (기본값: `data/model.pkl`)

---

