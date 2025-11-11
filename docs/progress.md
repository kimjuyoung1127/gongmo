# 개발 진행 상황 정리 (v2.0 - AI App with MLOps)

**전략 선회:** 기존 '하드웨어 스캐너'에서 'AI + 바코드 스마트폰 앱'으로 계획을 변경했으며, 유료 API 의존성을 줄이고 오픈소스 솔루션(PaddleOCR, Open Food Facts)을 적극 활용합니다. 또한, 사용자 피드백 기반의 AI 모델 개선을 위한 MLOps 파이프라인 구축을 목표로 합니다.

---

## ✅ 완료된 작업

*   **프로젝트 기획 및 재설계**
    *   `[✅]` `log.md`를 통해 PaddleOCR, 하이브리드 바코드 조회, MLOps 도입 등 새로운 기술 스택 및 아키텍처 확정
    *   `[✅]` 모든 관련 문서 (`README.md`, `weekplan.md`, `data.md` 등) 최신화 완료
*   **백엔드 환경 및 기본 설정**
    *   `[✅]` `requirements.txt`에 `paddleocr`, `openfoodfacts`, `mlflow` 등 신규 라이브러리 추가
    *   `[✅]` Supabase DB 스키마 최신화 (`receipts`, `inventory` 테이블 등) 및 `barcode` 컬럼 추가
    *   `[✅]` `.env` 파일에서 Clova OCR 관련 키 제거
*   **백엔드 핵심 기능 구현**
    *   `[✅]` **OCR 엔진 교체:** Clova OCR 로직을 **PaddleOCR** 기반으로 성공적으로 교체 (`api/app.py`, `utils/expiry_logic.py`)
    *   `[✅]` **`/upload_receipt` API 개선:**
        *   OCR 처리 결과를 새로운 DB 스키마에 맞게 `receipts`, `receipt_items` 테이블에 저장하도록 로직 수정 완료
        *   AI가 예측한 카테고리 이름을 `category_id`로 변환하는 매핑 로직 추가 완료 (`utils/expiry_logic.py`)
    *   `[✅]` **`/lookup_barcode` API 구현:**
        *   API 호출 로직을 `utils/barcode_lookup.py`로 분리
        *   식품안전나라 + Open Food Facts **하이브리드 조회 전략** 구현 완료
        *   네트워크 오류 등을 처리하는 **예외 처리 로직** 적용 완료
        *   외부 카테고리를 내부 `category_id`로 변환하는 **카테고리 매핑** 로직 적용 완료
        *   성공(200), 실패(404), 서버오류(503)를 구분하여 응답하도록 로직 구현 완료 (`api/app.py`)

---

## 🔄 진행 중인 작업

*   `[ ]` **Week 2: 백엔드 배포**
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

1.  백엔드 클라우드 배포
2.  React Native 프론트엔드 앱 핵심 기능(바코드, 영수증 스캔) 구현
3.  백엔드-프론트엔드 통합 테스트
4.  MLOps 파이프라인 구축 및 AI 모델 지속 개선 (DVC, Evidently AI 등 확장)
5.  최종 문서화 및 데모 영상 제작