# 개발 진행 상황 정리 (v2.0 - AI App with MLOps)

**전략 선회:** 기존 '하드웨어 스캐너'에서 'AI + 바코드 스마트폰 앱'으로 계획을 변경했으며, 유료 API 의존성을 줄이고 오픈소스 솔루션(PaddleOCR, Open Food Facts)을 적극 활용합니다. 또한, 사용자 피드백 기반의 AI 모델 개선을 위한 MLOps 파이프라인 구축을 목표로 합니다.

---

## ✅ 완료된 작업

*   **프로젝트 기획 및 재설계**
    *   `[✅]` `log.md`를 통해 PaddleOCR, 하이브리드 바코드 조회, MLOps, Expo 도입 등 새로운 기술 스택 및 아키텍처 확정
    *   `[✅]` 모든 관련 문서 (`README.md`, `weekplan.md`, `frontend_plan.md` 등) 최신화 완료
*   **백엔드 환경 및 핵심 기능 구현**
    *   `[✅]` `requirements.txt`에 신규 라이브러리 추가 및 DB 스키마 최신화
    *   `[✅]` **OCR 엔진 교체:** Clova OCR 로직을 **PaddleOCR** 기반으로 성공적으로 교체
    *   `[✅]` **`/upload_receipt` API 개선:** 새로운 DB 스키마(`receipts`, `receipt_items`)에 맞게 저장 로직 수정 및 `category_id` 매핑 로직 추가
    *   `[✅]` **`/lookup_barcode` API 구현:** 하이브리드 조회 전략, 예외 처리, 카테고리 매핑 로직 적용 완료
*   **프론트엔드 초기 설정 (Phase 1)**
    *   `[✅]` **Expo 프로젝트 생성:** `npx create-expo-app app` 명령으로 프로젝트 생성 완료
    *   `[✅]` **핵심 라이브러리 설치:** `react-navigation`, `react-native-vision-camera`, `zustand`, `supabase-js` 등 설치 완료
    *   `[✅]` **Expo Router 기반 화면 구조 설정:** `app/(tabs)` 구조 및 `_layout.tsx` 파일들을 생성하여 하단 탭 네비게이션 구현 완료

---

## 🔄 진행 중인 작업

*   `[ ]` **백엔드 배포**
    *   Flask 전체 앱을 Render 클라우드에 배포
*   `[ ]` **프론트엔드 개발 (Phase 1 마무리 및 Phase 2 시작)**
    *   `[ ]` **카메라 권한 설정:** `react-native-vision-camera` 사용을 위한 권한 요청 로직 추가
    *   `[ ]` **Supabase 클라이언트 설정:** 앱에서 Supabase 프로젝트에 접근할 수 있도록 설정
    *   `[ ]` **바코드 스캔 기능 구현:** '스캔' 화면에 카메라 뷰 렌더링 및 `useCodeScanner` 훅을 사용한 바코드 인식 로직 구현

---

## 🔜 시작하지 않은 작업

*   `[ ]` **프론트엔드 개발 (Phase 3, 4)**
    *   영수증 스캔 기능 및 AI 피드백 UI 구현
    *   실시간 재고 관리 기능 구현
*   `[ ]` **사용자 인증 구현** (프론트엔드 & 백엔드)
*   `[ ]` **MLOps 기반 마련** (`Label Studio`, `MLflow` 초기 설정)

---

## 🎯 차후 계획

1.  백엔드 클라우드 배포
2.  프론트엔드 핵심 기능(바코드/영수증 스캔, 재고 관리) 구현 완료
3.  사용자 인증 기능 구현
4.  백엔드-프론트엔드 통합 테스트
5.  MLOps 파이프라인 구축 및 AI 모델 지속 개선
