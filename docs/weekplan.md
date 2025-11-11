네, 좋습니다. 제공해주신 4주 로드맵을 기반으로, 매주 실행하고 완료해야 할 작업들을 명확하게 추적할 수 있는 **'4주 실행 체크리스트'**로 수정하여 정리해 드립니다.

---

### 🚀 4주 실행 체크리스트 (v2.0)

### 🎯 Week 1: AI의 '뇌' - 학습 데이터셋 구축 및 기본 설정

* `[ ]` **데이터 수집:** 실제 마트/편의점 영수증 10~15장 확보
* `[ ]` **데이터셋 완성:** `food_dataset_v2.csv` (X, X_clean, Y_category, Y_expiry_days) 100~200건 수동 라벨링
* `[ ]` **DB 설계:** Supabase `products` 테이블 스키마 (`schema.sql`) 작성
* `[ ]` **DB 설정:** Supabase 프로젝트 생성, 테이블 적용, RLS + Realtime 활성화
* `[ ]` **프로젝트 구조:** Github Monorepo 생성 (`/hardware`, `/backend`, `/frontend`)
* `[ ]` **백엔드 초기화:** `/backend` 폴더에 Flask 기본 환경 설정 (`app.py`, `requirements.txt`)
* `[ ]` **(제출물 1) `food_dataset_v2.csv` 파일**
* `[ ]` **(제출물 2) Github 링크 (내부에 `schema.sql` 포함)**

---

### 🤖 Week 2: '자체 AI 모델' 개발 및 백엔드 연동

* `[ ]` **AI 모델 학습:** `train.py` 스크립트 작성 (Scikit-learn, Tfidf, Naive Bayes/SVM)
* `[ ]` **AI 모델 생성:** `train.py` 실행하여 `model.pkl` 파일 생성
* `[ ]` **백엔드 API 개발:** Flask `/upload` API 엔드포인트 구현
* `[ ]` **핵심 로직 구현:** API 내 (이미지 수신 → OCR 호출 → `model.pkl` 예측 → 유통기한 계산 → Supabase INSERT) 흐름 완성
* `[ ]` **로컬 테스트:** Postman으로 이미지 전송 → Supabase DB에 데이터가 쌓이는지 확인
* `[ ]` **(제출물 3) `train.py` 스크립트**
* `[ ]` **(제출물 4) `model.pkl` 파일**
* `[ ]` **(제출물 5) Flask `predict()` 함수 및 DB INSERT 코드**

---

### 🔗 Week 3: 하드웨어 + 웹 프론트엔드 통합

* `[ ]` **백엔드 배포:** Flask 앱 (AI 모델 포함) Render 클라우드 배포
* `[ ]` **API 주소 확보:** `https://...onrender.com` 공개 API 주소 확보
* `[ ]` **하드웨어 개발:** ESP32-CAM (버튼 클릭 → 사진 촬영 → Render API로 이미지 POST 전송) 펌웨어 작성
* `[ ]` **프론트엔드 개발:** React 웹 (Supabase Realtime 연동, D-day 계산 및 목록 표시)
* `[ ]` **프론트엔드 배포:** React 웹 Vercel 배포
* `[ ]` **E2E 테스트:** ESP32 버튼 클릭 → Vercel 웹 실시간 업데이트 확인
* `[ ]` **(제출물 6) Vercel 웹 URL**
* `[ ]` **(제출물 7) Render API URL**

---

### 🏆 Week 4: 'AI 성장' 데모 + 최종 문서화

* `[ ]` **데모 시나리오 구상:** "실패 → 학습 → 재학습 → 성공" 스토리라인 확정
* `[ ]` **데모 영상 제작:** 위 시나리오 (D-14 → D-90 변경)를 2~5분 내외로 촬영 및 편집
* `[ ]` **성과 보고서 작성:** AI 접근법(Hybrid) 및 유통기한 예측 기능 강조 (2페이지)
* `[ ]` **README.md 작성:** 실행 스크립트 (환경 설정, 학습 방법, 실행 방법) 상세히 기술
* `[ ]` **최종 제출물 정리:** 7가지 모든 제출물 폴더링 및 최종 점검
* `[ ]` **(제출물 8) 데모 시연 영상**
* `[ ]` **(제출물 9) 성과 보고서**
* `[ ]` **(제출물 10) `README.md` 실행 스크립트**