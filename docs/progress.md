# 개발 진행 상황 정리 (v2.0 - AI App with MLOps)

**전략 선회:** 기존 '하드웨어 스캐너'에서 'AI + 바코드 스마트폰 앱'으로 계획을 변경했으며, 유료 API 의존성을 줄이고 오픈소스 솔루션(PaddleOCR, Open Food Facts)을 적극 활용합니다. 또한, 사용자 피드백 기반의 AI 모델 개선을 위한 MLOps 파이프라인 구축을 목표로 합니다.

---

## ✅ 완료된 작업

*   **Week 1: 프로젝트 구조 및 백엔드/DB 초기화**
    *   `[✅]` Github Monorepo에 `/backend`, `/frontend` 디렉토리 생성
    *   `[✅]` 백엔드 초기화: Flask 앱(app.py) 및 의존성(requirements.txt) 설정
    *   `[✅]` 데이터베이스 설계: Supabase 테이블 스키마(v2.0) 생성 및 최신화 (`docs/data.md` 및 `backend/db/schema.sql` 반영)
    *   `[✅]` 데이터셋 생성: `categories.csv`, `expiry_rules.csv` 정의
*   **Week 2: AI 모델 및 핵심 백엔드 API 구현 (진행 중)**
    *   `[✅]` AI 모델 개발: `train.py` 스크립트 작성 (scikit-learn, Tfidf, 나이브 베이즈)
    *   `[✅]` 모델 훈련: `train.py`를 사용하여 `model.pkl` 파일 생성
    *   `[✅]` **OCR 엔진 교체:** Clova OCR 대신 **PaddleOCR 설정 및 연동** (`backend/api/app.py`, `backend/utils/expiry_logic.py` 수정 완료)
    *   `[✅]` `backend/requirements.txt` 업데이트 (`paddleocr`, `openfoodfacts`, `mlflow` 추가)
    *   `[✅]` `backend/.env` 업데이트 (Clova OCR 키 제거)
    *   `[✅]` 백엔드 API 구현: Flask `/upload_receipt` 엔드포인트 구현 (PaddleOCR 연동)
    *   `[✅]` 핵심 로직 구현: 이미지 → PaddleOCR → `model.pkl` 예측 → 유통기한 계산 → Supabase 삽입 흐름 구현
    *   `[✅]` 로컬 테스트: `test_api.py`를 사용하여 API 로컬 테스트 완료
    *   `[✅]` 백엔드 구조 개선: Python 파일들을 기능별(`api`, `ml`, `utils` 등)로 정리

---

## 🔄 진행 중인 작업

*   `[ ]` **Week 2: 백엔드 API 완성**
    *   신규 API `/lookup_barcode` 구현 (식품안전나라 + Open Food Facts 하이브리드 전략)
    *   Flask 전체 앱을 Render 클라우드에 배포

---

## 🔜 시작하지 않은 작업

*   `[ ]` **Week 3: 프론트엔드 앱(React Native) 개발**
    *   React Native 프로젝트 생성
    *   메인 UI (재고 목록, D-Day 표시) 구현
    *   바코드 스캔 기능 구현 (`react-native-vision-camera` 사용) 및 API 연동
    *   영수증 촬영 기능 구현 (`react-native-vision-camera` 사용) 및 온디바이스 OCR (`@react-native-ml-kit/text-recognition`) 또는 서버 OCR 연동
    *   Supabase Realtime 연동
*   `[ ]` **Week 4: 데모 및 문서화 & MLOps 기반 마련**
    *   'AI + 바코드' 하이브리드 데모 시나리오 구상 및 영상 제작
    *   성과 보고서 작성 및 README.md 최종 업데이트
    *   **MLOps 기반 마련:** `Label Studio` 및 `MLflow` 초기 설정 (사용자 피드백 수집 및 실험 추적 환경 구축)

---

## 🎯 차후 계획

1.  백엔드 배포 및 신규 API(`/lookup_barcode`) 구현 완료
2.  React Native 프론트엔드 앱 핵심 기능(바코드, 영수증 스캔) 구현
3.  백엔드-프론트엔드 통합 테스트
4.  MLOps 파이프라인 구축 및 AI 모델 지속 개선 (DVC, Evidently AI 등 확장)
5.  최종 문서화 및 데모 영상 제작
