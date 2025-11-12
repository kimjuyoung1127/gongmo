# AI 식료품 관리 앱 - 프론트엔드 (Expo React Native)

이 프로젝트는 AI 식료품 관리 앱의 프론트엔드 파트로, **Expo**와 **React Native**를 사용하여 개발되었습니다.

## 🚀 시작하기 (Getting Started)

1.  **의존성 설치:**
    *   `app` 디렉토리에서 다음 명령어를 실행하여 필요한 모든 라이브러리를 설치합니다.
    ```bash
    npm install
    ```

2.  **환경 변수 설정:**
    *   `app` 디렉토리의 루트에 `.env` 파일을 생성하고, 백엔드 및 Supabase 접속 정보를 입력합니다. Expo에서는 클라이언트에서 접근 가능한 환경 변수 앞에 `EXPO_PUBLIC_` 접두사를 붙여야 합니다.
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    EXPO_PUBLIC_BACKEND_URL=your_backend_api_url
    ```

3.  **개발 서버 실행:**
    *   다음 명령어를 실행하여 Expo 개발 서버를 시작합니다.
    ```bash
    npx expo start
    ```
    *   터미널에 나타나는 QR 코드를 스마트폰의 **Expo Go** 앱으로 스캔하면, 개발 중인 앱을 실시간으로 확인할 수 있습니다.

## 🛠️ 주요 기술 및 라이브러리

-   **프레임워크:** React Native (with Expo)
-   **화면 이동:** `react-navigation`
-   **라우팅:** `expo-router` (파일 시스템 기반)
-   **카메라/스캔:** `react-native-vision-camera`
-   **상태 관리:** `zustand`
-   **데이터베이스 연동:** `@supabase/supabase-js`
-   **API 통신:** `axios`

## 📁 폴더 구조 (Expo Router)

이 프로젝트는 파일 시스템 기반의 라우팅을 사용하는 **Expo Router**를 따릅니다.

-   `app/`: Expo Router의 루트 디렉토리. 모든 파일 기반 라우팅이 여기서 시작됩니다.
    -   `_layout.tsx`: 앱 전체의 최상위 레이아웃. (폰트 로딩, 전역 Provider 설정 등)
    -   `(tabs)/`: 하단 탭 네비게이션 그룹. URL 경로에 영향을 주지 않으면서 관련된 화면들을 묶습니다.
        -   `_layout.tsx`: 하단 탭 메뉴(재고, 스캔, 설정)를 구성하는 네비게이터 파일.
        -   `index.tsx`: '재고' 탭 화면.
        -   `scan.tsx`: '스캔' 탭 화면.
        -   `settings.tsx`: '설정' 탭 화면.
-   `assets/`: 이미지, 폰트 등 정적 에셋.
-   `components/`: 여러 화면에서 재사용되는 공통 컴포넌트.