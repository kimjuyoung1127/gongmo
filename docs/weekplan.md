### 🚀 4주 실행 체크리스트 (v3.0 - AI App with MLOps)

이 플랜은 '제출물 7종'을 모두 포함하며 하드웨어 리스크가 없는 스마트폰 앱 개발 계획입니다. 유료 API 의존성을 줄이고 오픈소스 솔루션을 적극 활용하며, 사용자 피드백 기반의 AI 모델 개선 파이프라인 구축에 중점을 둡니다.

---

### 🗓️ Week 1: 백엔드/AI v2.0 완성 (기존과 동일)

*   `[✅]` **데이터셋 완성:** `categories.csv`, `expiry_rules.csv` 완성
*   `[✅]` **DB 설계 및 적용:** Supabase DB 스키마 (v2.0 Full) 적용 및 `seed.py`로 데이터 삽입
*   `[✅]` **핵심 로직 코드 완성:** `clean_text.py` (정제), `expiry_logic.py` (규칙) 완성
*   `[✅]` **(제출물) `[7]학습데이터셋(CSV)`, `[5]Github(DB스키마, 로직코드)`**

---

### 🤖 Week 2: AI 모델 학습 및 백엔드 API 완성

*   `[✅]` **AI 모델 생성:** `food_dataset_v2.csv` 라벨링 완료 → `train.py` 실행 → **`model.pkl` 생성**
*   `[✅]` **OCR 엔진 교체:** Clova OCR 대신 **PaddleOCR 설정 및 연동** (`backend/utils/expiry_logic.py` 수정 완료)
*   `[✅]` **API 1: `/upload_receipt` (Flask):** 영수증 이미지를 받아 **PaddleOCR** → `model.pkl` → `expiry_logic.py` → `receipt_items` DB 저장
*   `[ ]` **API 2: `/lookup_barcode` (Flask):** (신규) 바코드(GTIN) 값을 받아서, **식품안전나라 API** (주력) 및 **Open Food Facts** (보조)를 호출해 '정확한 제품명'과 '카테고리'를 반환하는 API 구현
*   `[ ]` **백엔드 배포:** 완성된 Flask 앱을 Render 클라우드에 배포
*   `[ ]` **(제출물) `[6]AI모델(model.pkl)`, `[6]AI코드(train.py, Flask API)`, `[2]웹서비스 URL`(백엔드)**

---

### 📱 Week 3: 프론트엔드 앱(React Native) 구현

*   `[ ]` **프로젝트 생성:** React Native(Expo) 프로젝트 생성
*   `[ ]` **UI 구현:** 로그인, 메인(재고 목록), D-Day 표시, '추가하기' 버튼
*   `[ ]` **기능 1 (바코드):** `react-native-vision-camera`로 바코드 스캔 → `/lookup_barcode` API 호출 → `inventory` DB 저장
*   `[ ]` **기능 2 (영수증):** `react-native-vision-camera`로 사진 촬영/선택 → `@react-native-ml-kit/text-recognition` (온디바이스 OCR) 또는 `/upload_receipt` API 호출 → `receipt_items` 목록 표시
*   `[ ]` **기능 3 (실시간):** Supabase Realtime 연동 (DB 변경 시 목록 자동 새로고침)
*   `[ ]` **(제출물) `[3]앱 (APK 파일)`**

---

### 🏆 Week 4: 데모 영상 및 문서화 & MLOps 기반 마련

*   `[ ]` **데모 시나리오 구상:**
    1.  [바코드] '서울우유' 바코드를 스캔 → 1초 만에 '서울우유 D-7' 등록 (정확)
    2.  [영수증] 야채/과일 영수증을 촬영 → AI가 '새송이버섯 D-5' 등록 (스마트)
    3.  [규칙] '버터'가 포함된 영수증 촬영 → AI가 '버터 D-90'으로 등록 (예외처리)
*   `[ ]` **데모 영상 제작:** 위 시나리오를 2~5분 내외로 촬영 및 편집
*   `[ ]` **성과 보고서 작성:** 'AI + 바코드' 하이브리드 방식 및 MLOps 전략 강조
*   `[ ]` **README.md 최종 업데이트:** 실행 방법, API 명세, MLOps 전략 등 상세히 기술
*   `[ ]` **MLOps 기반 마련:** `Label Studio` 및 `MLflow` 초기 설정 (사용자 피드백 수집 및 실험 추적 환경 구축)
*   `[ ]` **(제출물) `[1]성과보고서`, `[4]데모영상`, `[7]실행스크립트(README)`**