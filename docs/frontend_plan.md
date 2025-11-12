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
- [x] **Expo Router 기반 파일 구조 생성:**
    - [x] `app/(tabs)/` 디렉토리 생성
    - [x] `app/(tabs)/_layout.tsx` 파일 생성 (하단 탭 네비게이터 설정)
    - [x] `app/(tabs)/index.tsx` 파일 생성 ('재고' 탭 화면)
    - [x] `app/(tabs)/scan.tsx` 파일 생성 ('스캔' 탭 화면)
    - [x] `app/(tabs)/settings.tsx` 파일 생성 ('설정' 탭 화면)
    - [x] `app/_layout.tsx` 파일 생성 (최상위 레이아웃 설정)
- [ ] **카메라 권한 설정:** `react-native-vision-camera` 사용을 위한 권한 요청 로직 추가 (Expo가 대부분의 네이티브 설정을 자동 처리)

---

## Phase 2: 바코드 스캔을 통한 '빠른 상품 등록' 구현

가장 빠르고 정확하게 상품을 등록하는 핵심 경험입니다.

- [ ] **'스캔' 화면 UI 및 카메라 설정:** `app/(tabs)/scan.tsx` 파일에서 `react-native-vision-camera`의 `<Camera>` 컴포넌트를 사용하여 전체 화면 카메라 뷰 렌더링
- [ ] **바코드 인식 로직:** `useCodeScanner` 훅을 사용하여 바코드를 실시간으로 감지하고, 인식 시 진동 피드백 구현
- [ ] **API 연동:** 인식된 바코드 값으로 백엔드의 `/lookup_barcode` API 호출 (로딩 인디케이터 표시)
- [ ] **결과 표시 및 재고 추가:** API로부터 받은 상품명/카테고리 정보를 Bottom Sheet 형태로 표시하고, 유통기한 입력 후 '재고에 추가' 버튼 구현

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

---

## Phase 4: 재고 관리 기능 구현

Supabase와 연동하여 실제 재고 데이터를 관리합니다.

- [ ] **Supabase 클라이언트 설정:** 앱에서 Supabase 프로젝트에 접근할 수 있도록 설정
- [ ] **재고 목록 표시:** `app/(tabs)/index.tsx` 파일에서 `inventory` 테이블 데이터를 실시간으로 구독하여 목록을 보여주는 UI 구현
- [ ] **재고 추가/수정/삭제:** '바코드 스캔'이나 '영수증 스캔' 결과 화면에서 '재고에 추가' 버튼을 누르거나, 목록에서 아이템을 스와이프하여 '소비 완료' 또는 '삭제' 처리하는 로직 구현

---

## 추가 고려사항: 사용자 인증

- [ ] **Supabase Auth 연동:** 로그인/회원가입 화면 구현 및 Supabase Auth를 통한 사용자 인증 처리
- [ ] **인증 토큰 관리:** 로그인 성공 시 발급되는 JWT 토큰을 저장하고, 모든 백엔드 API 요청 시 헤더에 포함하여 전송
- [ ] **백엔드 인증 로직:** 백엔드 API가 요청 헤더의 토큰을 검증하여 사용자 식별 로직 추가 (백엔드 수정 필요)