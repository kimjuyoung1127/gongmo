# 프로젝트 로그 및 개발 기록

## 📋 프로젝트 개요

AI 기반 식료품 관리 앱의 개발 로그입니다. 바코드 스캔 및 영수증 OCR을 통한 자동 재고 관리 기능을 중심으로 개발이 진행되었습니다.

## 🚀 최신 업데이트 (2025-11-15)

### 컴포넌트 모듈화 완료
- `scan.tsx` 파일에서 UI 컴포넌트들을 별도의 파일로 분리하여 관리
- `components/scan/` 디렉토리에 모듈화된 컴포넌트들이 저장됨
- 코드의 가독성과 유지보수성이 향상됨

### 주요 변경 사항
1. **ModeToggle.tsx** - 바코드/영수증 모드 전환 UI 분리
2. **PhotoConfirmModal.tsx** - 사진 확인 모달 UI 분리  
3. **ScanUtils.ts** - 공통 유틸리티 함수 및 타입 정의 분리
4. **기타 planned components** - 향후 개발 예정인 컴포넌트들 (BarcodeModal, ManualEntryModal 등)

### 바코드 캐싱 시스템 완성
- `products` 테이블을 사용한 바코드 캐싱 시스템 구현
- 동일 바코드에 대한 빠른 응답 및 외부 API 호출 최소화
- 사용자가 직접 입력한 정보가 캐시에 저장되어 모든 사용자에게 공유됨

### OCR 기능 완성
- PaddleOCR 또는 클로바 OCR 기반 영수증 자동 인식
- 결과 필터링 및 카테고리 분류 기능 구현
- 영수증 촬영 후 3-5초 내에 재고 자동 등록

## 📊 프로젝트 구조

```
scanner-project/
├── app/
│   ├── (tabs)/
│   │   ├── scan.tsx          # 스캔 기능 메인 화면 (모듈화 완료)
│   │   ├── index.tsx         # 재고 목록 화면
│   │   └── settings.tsx      # 설정 화면
│   ├── components/
│   │   └── scan/
│   │       ├── ModeToggle.tsx
│   │       ├── PhotoConfirmModal.tsx
│   │       └── ScanUtils.ts
│   └── lib/
│       └── supabase.ts       # DB 연동 로직
├── backend/
│   ├── api/
│   │   └── app.py           # Flask API 서버
│   └── utils/
│       ├── barcode_lookup.py # 바코드 조회 로직
│       └── expiry_logic.py   # 유통기한 계산 로직
└── docs/                    # 문서화 폴더
```

## 🎯 주요 기능

### 1. 바코드 스캔
- Vision Camera를 사용한 바코드 인식
- 외부 API 연동을 통한 제품 정보 조회
- 캐싱 시스템을 통한 빠른 응답

### 2. 영수증 OCR
- 사진 촬영 기능
- OCR을 통한 텍스트 추출
- 필터링 및 카테고리 분류
- 자동 재고 등록

### 3. 재고 관리
- 사용자별 재고 데이터 저장
- D-Day 기반 유통기한 관리
- 실시간 데이터 동기화

## 🔧 기술 스택

- **Frontend**: React Native (Expo), TypeScript
- **Camera**: react-native-vision-camera
- **Backend**: Flask (Python), OCR (PaddleOCR/클로바 OCR)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **Navigation**: Expo Router

## 📈 성능 지표

- **바코드 인식 속도**: 1-2초 이내
- **OCR 처리 속도**: 3-5초 이내
- **DB 캐시 히트율**: 80% 이상 (반복 사용 시)
- **카테고리 분류 정확도**: 60% 이상