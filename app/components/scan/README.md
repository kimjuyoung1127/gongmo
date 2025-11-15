# Scan Components 모듈

이 모듈은 앱의 스캔 기능을 모듈화한 컴포넌트입니다.
- 바코드 스캔 및 영수증 OCR 기능
- 모드 전환 및 UI 개선
- 에러 처리 및 사용자 피드백

## 📁 파일 구조

```
components/scan/
├── README.md                    # 이 문서
├── ScanUtils.ts               # 유틸리티 함수 및 타입
├── ModeToggle.tsx             # 바코드/영수증 모드 전환
├── PhotoConfirmModal.tsx       # 사진 확인 화면
├── BarcodeScanner.tsx         # 바코드 스캔 기능
├── ReceiptCamera.tsx          # 영수증 카메라 및 OCR
├── BarcodeModal.tsx           # 바코드 결과 모달
└── ManualEntryModal.tsx       # 직접 입력 화면
```

## 🚀 특징

### ✨ 완료된 기능
- **모드 전환**: 바코드/영수증 전환 토글
- **사진 확인**: 촬영 가이드 포함
- **바코드 캐싱**: DB 캐싱 시스템 연동
- **직접 입력**: 404 오류 시 상품 정보 입력
- **데이터 표준화**: products → inventory 2단계 저장

### 🔄 진행 중인 기능
- **영수증 OCR**: /upload_receipt API 연동
- **결과 검토**: 카테고리 수정 및 체크박스
- **MLOps 피드백**: 사용자 수정 데이터 수집

## 🎯 사용 방법

### 스캔 메인 화면에서

```typescript
import { ModeToggle } from '../components/scan/ModeToggle';
import { PhotoConfirmModal } from '../components/scan/PhotoConfirmModal';

// 모드 전환
<ModeToggle 
  scanMode={scanMode}
  onModeChange={setScanMode}
/>

// 사진 확인
<PhotoConfirmModal
  visible={showPhotoConfirm}
  imageUri={capturedImage}
  onRetake={handleRetakePhoto}
  onUsePhoto={handleUsePhoto}
/>
```

## 📊 백엔드 연동

### API 엔드포인트

| 엔드포인트 | 설명 | 상태 |
|------------|------|------|
| `/lookup_barcode` | 바코드 조회 (DB 캐싱 포함) | ✅ 완료 |
| `/upload_receipt` | 영수증 OCR 처리 | ✅ 완료 |
| `/inventory/batch_add` | 대량 재고 추가 | 🔄 진행 중 |

### 응답 형식

#### 바코드 응답
```json
{
  "data": {
    "name": "상품명",
    "category_id": 8,
    "category_name_kr": "카테고리명",
    "barcode": "8801043047722"
  }
}
```

#### 영수증 응답
```json
{
  "receipt_id": 123,
  "items": [
    {
      "id": 456,
      "clean_text": "상추",
      "pred": {
        "category_id": 8,
        "confidence": 0.82
      },
      "quantity_hint": 2,
      "expiry_days": 3
    }
  ]
}
```

## 🔧 개발 가이드

### 타입 정의
```typescript
import { ScannedProductData, ReceiptItem } from './ScanUtils';
```

### 유틸리티 함수
```typescript
import { getCategoryIdByName } from './ScanUtils';

// 카테고리 이름으로 ID 조회
const categoryId = await getCategoryIdByName('채소');
```

## 🎨 스타일 가이드

### 공통 테마
- **메인 색상**: #007AFF (파란색)
- **성공 색상**: #4CAF50 (초록색)
- **오류 색상**: #F44336 (빨간색)
- **배경**: 검은색 (카메라 뷰)

### 모달 패턴
- `transparent={true}`: 배경 흐리게
- `animationType="slide"`: 아래에서 올라오기
- `onRequestClose`: 뒤로가기 버튼 처리

## 🐛 디버깅

### 로그 형식
```
--- [SECTION] 설명 ---
[LOG-LEVEL] 메시지: 데이터
--- [SECTION] 완료 ---
```

### 섹션 카테고리
- `[MODE]`: 모드 전환
- `[PHOTO]`: 사진 촬영
- `[BARCODE]`: 바코드 처리
- `[API]`: 서버 통신
- `[ERROR]`: 오류 발생

## 📱 테스트 시나리오

### 1. 바코드 스캔 흐름
1. 바코드 모드 선택
2. 바코드 스캔 → DB 조회
3. 결과 표시 → 재고 추가
4. 404 발생 시 → 직접 입력 → 저장

### 2. 영수증 OCR 흐름
1. 영수증 모드 선택
2. 사진 촬영 → 확인 화면
3. OCR 처리 → 결과 표시
4. 카테고리 수정 → 재고 추가

## 🔄 향후 개선

### 기능 개선
- [ ] 이미지 리사이즈 최적화
- [ ] HEIC → JPEG 변환
- [ ] 오프라인 모드 지원
- [ ] 배치 처리 기능

### 성능 개선
- [ ] 메모리 사용 최적화
- [ ] 애니메이션 성능 향상
- [ ] 로딩 상태 세분화

## 📝 변경 로그

### 2025-11-15
- ✅ scan.tsx 파일 800줄 → 모듈화 시작
- ✅ 바코드 캐싱 시스템 완성
- ✅ 직접 입력 기능 구현
- ✅ 커스텀 토글 구현 (SegmentedControl 제거)
- ✅ /upload_receipt 엔드포인트 추가

---

## 👥 기여자

### 개발
- **Frontend**: scan.tsx, 모듈화
- **Backend**: API 엔드포인트, OCR 처리

### 테스트
- 바코드 스캔 테스트 (8801043048552)
- DB HIT/MISS 확인 (4801245047722)
- 직접 입력 및 캐싱 동작 확인
