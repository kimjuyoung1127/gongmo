# 프론트엔드 개발 계획 (Expo React Native)

이 문서는 **Expo 기반**의 React Native AI 식료품 관리 앱 프론트엔드 개발을 위한 상세 계획입니다. `log.md`의 기술 추천과 사용자 경험(UX) 흐름을 반영하여, 복잡한 네이티브 설정을 최소화하고 빠른 개발 및 테스트에 중점을 둡니다.

---

## Phase 1: 프로젝트 설정 및 핵심 라이브러리 설치

앱 개발의 기반을 다지는 단계입니다.

- [x] **Expo 프로젝트 생성:** `npx create-expo-app app` 명령으로 `app` 디렉토리에 새 프로젝트 생성
- [x] **네이티브 라이브러리 설치 (Expo 방식):** `npx expo install`을 사용하여 네이티브 호환성을 자동으로 맞춥니다.
    - [x] `npx expo install react-native-vision-camera`
    - [x] `npx expo install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context`
- [x] **일반 라이브러리 설치:** `npm` 또는 `yarn`을 사용하여 나머지 라이브러리를 설치합니다.
    - [x] `npm install zustand @supabase/supabase-js axios`
- [x] **개발 클라이언트(Development Client) 설정:** 네이티브 라이브러리 사용을 위해 개발용 앱을 빌드하고 설정합니다.
    - [x] `eas login` 및 `eas build:configure`를 통해 EAS 설정 완료
    - [x] `eas build` 명령으로 개발용 앱(APK) 빌드 및 설치 완료
- [x] **Expo Router 기반 파일 구조 생성:**
    - [x] `app/(tabs)/` 디렉토리 생성
    - [x] `app/(tabs)/_layout.tsx` 파일 생성 (하단 탭 네비게이터 설정)
    - [x] `app/(tabs)/index.tsx` 파일 생성 ('재고' 탭 화면)
    - [x] `app/(tabs)/scan.tsx` 파일 생성 ('스캔' 탭 화면) [✅ 2025-11-13 QR 코드 필터링 추가]
    - [x] `app/(tabs)/settings.tsx` 파일 생성 ('설정' 탭 화면)
    - [x] `app/_layout.tsx` 파일 생성 (최상위 레이아웃 설정)
    - [x] `app/components/scan/` 디렉토리 생성 및 모듈화 [✅ 2025-11-15 완료]
- [x] **카메라 권한 설정:** `react-native-vision-camera` 사용을 위한 권한 요청 로직 추가 (`scan.tsx`에 구현 완료)

---

## Phase 2: 바코드 스캔을 통한 '빠른 상품 등록' 구현

가장 빠르고 정확하게 상품을 등록하는 핵심 경험입니다.

- [x] **'스캔' 화면 UI 및 카메라 설정:** `app/(tabs)/scan.tsx` 파일에서 `react-native-vision-camera`의 `<Camera>` 컴포넌트를 사용하여 전체 화면 카메라 뷰 렌더링 (기본 렌더링 완료)
- [x] **바코드 인식 로직:** `useCodeScanner` 훅을 사용하여 바코드를 실시간으로 감지하고, 인식 시 진동 피드백 구현
- [x] **API 연동:** 인식된 바코드 값으로 백엔드의 `/lookup_barcode` API 호출 (로딩 인디케이터 표시)
- [x] **결과 표시:** API로부터 받은 상품명/카테고리 정보를 Modal 형태로 표시
- [x] **재고 추가:** 결과 팝업에서 유통기한 입력 후 '재고에 추가' 버튼을 누르면 Supabase DB에 저장하는 로직 구현
    - [x] 카테고리 ID 유효성 검사 및 기본값 처리 구현
    - [x] 상세한 콘솔 로깅 및 디버깅 기능 추가

---

## Phase 3: 영수증 스캔을 통한 '대량 상품 등록' 구현 (AI 피드백 포함)

AI의 스마트함과 MLOps의 첫 단추를 경험하게 하는 기능입니다.

- [ ] **사진 촬영 및 서버 전송:**
    - `app/(tabs)/scan.tsx` 파일에 '영수증 촬영' 모드 전환 버튼 추가
    - `takePhoto()` 메소드로 사진 촬영 후, 백엔드의 `/upload_receipt` API로 이미지 전송 (로딩 메시지 표시)
- [ ] **결과 검토 및 AI 피드백 UI:**
    - 서버로부터 받은 품목 리스트를 새로운 '결과 확인' 화면에 표시
    - **[MLOps 연계]** 각 품목 옆에 AI 예측 카테고리를 보여주고, 사용자가 수정할 수 있는 Picker/Dropdown UI 제공
- [ ] **선택적 재고 추가:** 사용자가 재고에 추가할 품목들을 체크박스로 선택 후, '선택 항목 추가' 버튼 구현

### 참고 파일 목록

*   **프론트엔드 (`app`):**
    *   `app/(tabs)/scan.tsx`: **(핵심 참고)** 기존 바코드 스캔 기능의 카메라 제어, UI, API 호출 로직 참고.
    *   `app/(tabs)/index.tsx`: 스캔 결과가 최종적으로 표시될 재고 목록 화면 참고.
    *   `lib/supabase.ts`: DB 저장 로직 구현 시 참고.
*   **백엔드 (`backend`):**
    *   `api/app.py`: `/upload_receipt` API 설계를 위해 기존 API 구조 참고.
*   **문서 (`docs`):**
    *   `ml/implementation_plan.md`: OCR 후 품목을 분류하는 AI 모델 상세 정보 확인.
    *   `스키마`: 스캔 결과가 저장될 DB 테이블 구조 확인.

---

## 📝 LLM 아키텍처 전환에 따른 업데이트 제안 (2025-11-16)

- [ ] **Phase 3 "영수증 스캔을 통한 '대량 상품 등록' 구현" 섹션 수정:**
  - [ ] **"결과 검토 및 AI 피드백 UI"**의 목표를 재검토해야 합니다. 백엔드에서 LLM을 사용하여 매우 정확한 상품명 목록을 반환하므로, **사용자가 카테고리를 직접 수정하는 기능의 필요성 및 우선순위가 낮아졌습니다.**
  - [ ] "MLOps 연계" 부분은 현재 OCR 기능의 핵심 플로우에서 벗어났음을 명시.
  - [ ] UI/UX를 '검토 및 수정'에서 '확인 및 추가' 중심으로 단순화하는 방향을 제안.
