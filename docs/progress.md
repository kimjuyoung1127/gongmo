# 개발 진행 상황 정리 (v2.0 - AI App)

**전략 선회:** 기존 '하드웨어 스캐너'에서 'AI + 바코드 스마트폰 앱'으로 계획을 변경하여, 하드웨어 리스크를 제거하고 소프트웨어의 완성도를 높이는 방향으로 진행합니다.

---

## ✅ 완료된 작업

*   **Week 1: 프로젝트 구조 및 백엔드/DB 초기화**
    *   `[✅]` Github Monorepo에 `/backend`, `/frontend` 디렉토리 생성
    *   `[✅]` 백엔드 초기화: Flask 앱(app.py) 및 의존성(requirements.txt) 설정
    *   `[✅]` 데이터베이스 설계: Supabase 테이블 스키마(v2.0) 생성
    *   `[✅]` 데이터셋 생성: `categories.csv`, `expiry_rules.csv` 정의
*   **Week 2: AI 모델 및 핵심 백엔드 API 구현**
    *   `[✅]` AI 모델 개발: `train.py` 스크립트 작성 (scikit-learn, Tfidf, 나이브 베이즈)
    *   `[✅]` 모델 훈련: `train.py`를 사용하여 `model.pkl` 파일 생성
    *   `[✅]` 백엔드 API 구현: Flask `/upload_receipt` 엔드포인트 구현
    *   `[✅]` 핵심 로직 구현: 이미지 → OCR → `model.pkl` 예측 → 유통기한 계산 → Supabase 삽입 흐름 구현
    *   `[✅]` 로컬 테스트: `test_api.py`를 사용하여 API 로컬 테스트 완료
    *   `[✅]` 백엔드 구조 개선: Python 파일들을 기능별(`api`, `ml`, `utils` 등)로 정리

---

## 🔄 진행 중인 작업

*   `[ ]` **Week 2: 백엔드 API 완성**
    *   신규 API `/lookup_barcode` 구현 (바코드 조회 기능)
    *   Flask 전체 앱을 Render 클라우드에 배포

---

## 🔜 시작하지 않은 작업

*   `[ ]` **Week 3: 프론트엔드 앱(Flutter/RN) 개발**
    *   Flutter 또는 React Native 프로젝트 생성
    *   메인 UI (재고 목록, D-Day 표시) 구현
    *   바코드 스캔 기능 구현 및 API 연동
    *   영수증 촬영 기능 구현 및 API 연동
    *   Supabase Realtime 연동
*   `[ ]` **Week 4: 데모 및 문서화**
    *   'AI + 바코드' 하이브리드 데모 시나리오 구상
    *   데모 영상 제작
    *   성과 보고서 작성
    *   README.md 최종 업데이트

---

## 🎯 차후 계획

1.  백엔드 배포 및 신규 API(`/lookup_barcode`) 개발 완료
2.  Flutter/React Native 프론트엔드 앱 핵심 기능(바코드, 영수증 스캔) 구현
3.  백엔드-프론트엔드 통합 테스트
4.  최종 문서화 및 데모 영상 제작