# 바코드 스캔 및 재고 등록 시스템 구현 문서

이 문서는 스마트폰 앱에 구현된 바코드 스캔 및 재고 등록 시스템에 대한 상세 구현 내용을 설명합니다.

## 구현 개요

바코드 스캔을 통한 제품 정보 조회 및 재고 등록 기능은 다음과 같은 흐름으로 동작합니다:
1. 사용자가 앱에서 바코드를 스캔
2. 앱이 백엔드 API에 바코드 정보 전송
3. 백엔드가 외부 API(식품안전나라, Open Food Facts 등)를 통해 제품 정보 조회
4. 제품 정보와 카테고리 매핑 후 앱으로 반환
5. 사용자가 유통기한 입력 후 재고에 추가
6. Supabase DB의 inventory 테이블에 저장

## 핵심 구현 파일

- `app/(tabs)/scan.tsx`: 바코드 스캔 및 재고 등록 UI/로직 구현
- `backend/api/app.py`: `/lookup_barcode` API 엔드포인트
- `backend/utils/barcode_lookup.py`: 바코드 조회 로직
- `backend/utils/expiry_logic.py`: 유통기한 계산 로직

## 상세 구현 사항

### 1. 바코드 스캔

- `react-native-vision-camera` 라이브러리 사용
- `useCodeScanner` 훅을 통해 `ean-13` 및 `qr` 코드 타입 인식
- 스캔 시 진동 피드백 제공
- 스캔 전후 상태 관리 (`isProcessing`, `isLoading`)

### 2. API 연동

- `axios`를 사용한 HTTP 요청
- 백엔드 URL: `http://[IP]:5000/lookup_barcode`
- 바코드 정보를 JSON 형태로 전송
- 상세한 에러 처리 및 로깅 구현

### 3. 카테고리 매핑

- API 응답의 카테고리명을 내부 카테고리 ID로 매핑
- 규칙 기반 -> 정확히 일치 -> 키워드 포함 순서로 매핑 시도
- 유효하지 않은 카테고리 ID에 대한 폴백 처리

### 4. 재고 등록

- 사용자 입력 유통기한과 제품 정보를 결합
- Supabase `inventory` 테이블에 삽입
- Foreign Key 제약 조건 확인 및 처리
- Row Level Security(RLS)에 따른 사용자별 데이터 분리

## 주요 로깅 포인트

### 바코드 스캔 관련:
- `[SCAN-1]` ~ `[SCAN-5]`: 바코드 인식부터 API 호출까지
- `[API-1]` ~ `[API-7]`: API 요청부터 응답까지
- `[ERR-1]` ~ `[ERR-5]`: 오류 상황별 상세 로그

### 재고 등록 관련:
- `[INV-1]` ~ `[INV-7]`: 유효성 검사부터 DB 삽입까지
- `[INV-VALIDATION]`: 카테고리 ID 유효성 검사 로그

## 오류 해결 및 개선 사항

### 1. 카테고리 ID Foreign Key 제약 오류
- **문제**: `inventory_category_id_fkey` 제약 조건 위반
- **원인**: API 응답의 category_id가 DB의 categories 테이블에 존재하지 않음
- **해결**: 유효성 검사 로직 추가 및 폴백 카테고리 처리

### 2. 네트워크 연결 오류
- **문제**: API 호출 실패
- **원인**: 앱과 백엔드 서버 간 IP 주소 불일치
- **해결**: BACKEND_URL을 실제 서버 IP 주소로 설정

### 3. 상태 관리 개선
- 로딩 상태와 처리 상태를 명확히 분리
- 사용자에게 명확한 피드백 제공

## 테스트 결과

모든 기능이 성공적으로 작동함이 확인됨:
- 바코드 스캔 → 제품 정보 조회 → 카테고리 매핑 → 재고 등록
- Supabase DB에 정상적으로 데이터 저장
- 사용자별 데이터 분리 및 RLS 정책 정상 작동