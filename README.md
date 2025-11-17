# 🥫 AI 식료품 관리 앱 (AI Grocery Manager)

**영수증과 상품 바코드를 스캔하여 식료품을 등록하고, 유통기한을 스마트하게 관리해주는 모바일 애플리케이션입니다.**

이 프로젝트는 유료 API 의존성을 최소화하고 오픈소스 솔루션을 적극 활용하며, 사용자 피드백 기반의 AI 모델 개선 파이프라인 구축에 중점을 둡니다.

---

## ✨ 주요 기능

-   **하이브리드 입력 방식**
    -   **AI 영수증 스캔 (Clova OCR + Gemini LLM):** 영수증을 사진으로 찍으면 **Clova OCR**이 텍스트를 추출하고, **Gemini LLM**이 상품 목록만 지능적으로 분석하여 목록에 추가합니다.
    -   **정확한 바코드 스캔 (하이브리드 DB):** 상품 바코드를 스캔하여 **식품안전나라 API**와 **Open Food Facts**를 조합하여 100% 정확한 상품 정보를 즉시 등록합니다.
-   **자동 유통기한 계산:** AI가 품목의 카테고리를 인식하고, 내장된 규칙에 따라 최적의 유통기한을 자동으로 계산해줍니다.
-   **실시간 재고 관리:** 등록된 식료품 목록을 실시간으로 확인하고, 유통기한이 임박한 순서(D-Day)로 정렬하여 보여줍니다.
-   **클라우드 동기화:** 모든 데이터는 클라우드(Supabase)에 저장되어 여러 기기에서 동기화됩니다.
-   **AI 모델 지속 개선 (MLOps):** `MLflow`, `Label Studio` 등을 활용하여 사용자 피드백 기반의 AI 모델 재학습 및 개선 파이프라인을 구축합니다.

---

## 🏛️ 아키텍처

이 프로젝트는 다음과 같은 모던 앱 아키텍처로 구성됩니다.

```
[📱 프론트엔드: 스마트폰 앱]  <-- (REST API) -->  [⚙️ 백엔드: Python/Flask]  <-- (SDK) -->  [☁️ DB: Supabase]
 (React Native, Vision Camera)      (Clova OCR, Gemini LLM, 바코드 API)          (PostgreSQL + Realtime)
```

---

## 📁 프로젝트 구조

```
scanner-project/
├── app/                              # ✅ 프론트엔드 (Expo React Native)
│   ├── app/(tabs)/                   # 메인 탭 화면
│   │   ├── scan.tsx                 # ⚠️ 리팩토링 중 (구조: 아래 components/scan/ 참고)
│   │   ├── index.tsx                # 재고 목록 화면
│   │   └── settings.tsx             # 설정 화면
│   ├── components/
│   │   ├── scan/                    # 🆕 스캔 컴포넌트 모듈 (2025-11-15)
│   │   │   ├── ScanUtils.ts         # 유틸리티 및 타입
│   │   │   ├── ModeToggle.tsx       # 바코드/영수증 전환
│   │   │   ├── PhotoConfirmModal.tsx # 사진 확인 화면
│   │   │   ├── BarcodeScanner.tsx   # 바코드 스캔 로직 (계획)
│   │   │   ├── ReceiptCamera.tsx    # 영수증 카메라 & OCR (계획)
│   │   │   ├── BarcodeModal.tsx     # 바코드 결과 모달 (계획)
│   │   │   ├── ManualEntryModal.tsx # 직접 입력 화면 (계획)
│   │   │   └── README.md            # 스캔 모듈 기술 문서
│   │   └── ui/                      # 공용 UI 컴포넌트
│   ├── lib/                         # Supabase 클라이언트 등
│   └── styles/                      # 전역 스타일
│
├── backend/                          # ✅ AI 모델, 비즈니스 로직, API 서버
│   ├── api/
│   │   ├── app.py                   # 🆕 Flask 메인 앱 (리팩토링 완료, 40라인)
│   │   ├── ocr_service.py           # 🆕 Clova OCR + Gemini LLM 영수증 분석 로직
│   │   ├── utils/                   # 🆕 유틸리티 모듈 (이전 위치에서 api/로 이동)
│   │   │   ├── barcode_lookup.py    # DB 캐싱 + 외부 API 연동
│   │   │   ├── expiry_logic.py      # 영수증 OCR 처리 로직
│   │   │   └── __init__.py          # 패키지 구조
│   │   └── routes/                  # 🆕 블루프린트 기반 라우트 구조
│   │       ├── ocr.py               # /upload_receipt* 엔드포인트
│   │       ├── barcode.py           # /lookup_barcode 엔드포인트
│   │       ├── inventory.py         # /inventory/* 및 /health 엔드포인트
│   │       └── __init__.py          # 패키지 구조
│   ├── models/                      # 훈련된 ML 모델들 (Legacy)
│   │   ├── item_classifier.pkl     # (Legacy) 로컬 품목 분류 모델
│   │   ├── model_classes.json      # (Legacy) 카테고리 매핑
│   │   └── vectorizer.pkl          # (Legacy) 텍스트 벡터화
│   └── data/
│       └── categories_proper.csv   # ✅ 카테고리 마스터 데이터
│
├── docs/                            # ✅ 프로젝트 계획 및 기술 문서
│   ├── 프론트엔드/
│   │   ├── frontend_plan.md         # 프론트엔드 개발 계획
│   │   └── receipt_ocr_plan.md      # 영수증 OCR 세부 계획 (체크리스트)
│   ├── 스키마/
│   │   └── schema.md                # Supabase DB 스키마 정의
│   ├── log.md                       # 🔄 로그 및 개선사항 (2025-11-15 업데이트)
│   └── data.md                      # 데이터 모델 문서
│
└── backend/                         # ✅ (중복) 백엔드 코드 (최상단과 동일)
```

---

## 🚀 시작하기

### 🚀 테스트 확인된 기능 (2025-11-15)

#### ✅ 완료된 핵심 기능
1. **바코드 스캔 시스템** 
   - DB 캐싱 구조 (products → inventory 2단계 저장)
   - 외부 API 호출 최적화 (DB HIT 시 0.1초 응답)
   - 404 오류 시 직접 입력 기능
   
2. **영수증 OCR 기반**
   - react-native-vision-camera로 사진 촬영
   - Clova OCR + Gemini LLM 기반 품목 분석
   - /upload_receipt API 완료

#### 🔧 진행 중인 모듈화
- **scan.tsx** (800줄) → **components/scan/** 모듈로 분리 중
- 영수증 결과 검토 화면 및 카테고리 수정 UI
- MLOps 피드백 수집 기능

### 📁 각 파트별 상세 정보

1.  **프론트엔드 실행 및 모듈**: 
    - 실행: `app/` 참고
    - 스캔 모듈: `app/components/scan/README.md` 참고
2.  **백엔드 API 서버**:
    - 실행: `cd backend && source .venv/Scripts/activate && python -m api.app`
    - 구조: `backend/api/routes/` 블루프린트 기반
    - API 문서: 다음 엔드포인트 제공
      - `GET /health` - 상태 확인
      - `POST /upload_receipt*` - 영수증 OCR
      - `POST /lookup_barcode` - 바코드 조회
      - `POST /inventory/batch_add` - 재고 일괄 추가
3.  **프론트엔드 계획**: `docs/프론트엔드/frontend_plan.md` 참고
4.  **영수증 OCR 계획**: `docs/프론트엔드/receipt_ocr_plan.md` 참고
5.  **데이터베이스 스키마**: `docs/스키마/schema.md` 참고
6.  **MLOps 전략 및 개선사항**: `docs/log.md` 참고

### 🏗️ 백엔드 리팩토링 완료 (2025-11-16)

#### ✅ 완료된 리팩토링 작업
- **모듈화 구조 도입**: Flask Blueprint 기반 아키텍처
- **서비스 레이어 분리**: Clova OCR 비즈니스 로직 독립화
- **코드 크기 감축**: `app.py` 33,373라인 → 40라인 (99.9% 감소)
- **유지보수성 향상**: 기능별 명확한 책임 분리

#### 📂 새로운 구조
```
backend/api/
├── app.py              # Flask 앱 초기화 및 블루프린트 등록
├── ocr_service.py      # Clova OCR 관련 10개 함수
└── routes/             # 블루프린트 기반 라우트
    ├── ocr.py          # 영수증 관련 API
    ├── barcode.py      # 바코드 조회 API  
    └── inventory.py    # 재고 관리 API
```

#### 🎯 리팩토링 효과
- **확장성**: 새 기능 추가 시 블루프린트만 생성
- **테스트 용이성**: 각 모듈 독립적 테스트 가능
- **개발 효율**: 기능별 협업 용이
- **가독성**: 역할별 명확한 파일 분리

### 🚀 서버 콜드 스타트 문제 해결 (2025-11-17)

#### 문제: Render 무료 플랜의 '콜드 스타트' 현상
- 서버가 15분 동안 요청이 없으면 '수면' 상태로 진입
- 사용자가 영수증을 업로드할 때 서버가 깨어나는 데 50초~1분 소요
- 결과적으로 사용자는 504 게이트웨이 타임아웃 에러를 경험

#### 해결 전략: 서버 프리워밍 (Server Pre-warming)
1. **헬스 체크 엔드포인트 추가**: `/health` API (가벼운 응답만 처리)
2. **앱 시작 시 프리워밍**: `app/_layout.tsx`에서 앱 실행 시 `/health` 호출
3. **업로드 타임아웃 확장**: OCR 업로드 요청에 2분 타임아웃 설정

#### 파일 변경:
- `backend/api/routes/health.py`: 헬스 체크 엔드포인트
- `backend/api/app.py`: 헬스 블루프린트 등록
- `app/app/_layout.tsx`: 앱 시작 시 서버 프리워밍
- `app/app/(tabs)/scan.tsx`: 업로드 타임아웃 확장

---

### 🔍 현재 상태 요약
- **🟢 완료**: 백엔드 리팩토링, 모듈화 구조 도입, API 테스트 통과, 서버 콜드 스타트 문제 해결
- **🟡 진행 중**: 프론트엔드 리팩토링, 영수증 OCR UI 구현
- **🔵 계획**: MLOps 피드백 시스템, 오프라인 모드

---
