# AI 식료품 관리 앱 - 프론트엔드 (Expo React Native)

이 프로젝트는 AI 식료품 관리 앱의 프론트엔드 파트로, **Expo**와 **React Native**를 사용하여 개발되었습니다.

**⚠️ 중요: 이 프로젝트는 `react-native-vision-camera`와 같은 네이티브 라이브러리를 사용하므로, 표준 Expo Go 앱에서는 실행할 수 없습니다. 반드시 아래의 '개발 클라이언트' 방식으로 실행해야 합니다.**

---

## 🚀 시작하기 (Development Client 방식)

1.  **의존성 설치:**
    *   `app` 디렉토리에서 다음 명령어를 실행하여 필요한 모든 라이브러리를 설치합니다.
    ```bash
    npm install
    ```
    *   네이티브 라이브러리 호환성을 위해 다음 명령어를 추가로 실행할 수 있습니다.
    ```bash
    npx expo install --fix
    ```

2.  **개발용 앱(APK) 설치:**
    *   **(최초 1회)** 이 프로젝트를 실행하기 위한 개발용 앱(APK)이 필요합니다.
    *   팀 리더로부터 공유받은 최신 APK 파일을 스마트폰에 직접 설치합니다.
    *   만약 직접 빌드해야 한다면, [Expo EAS](https://expo.dev/eas)에 로그인 후 다음 명령어를 실행합니다.
    ```bash
    # Expo 계정 로그인
    eas login

    # 개발용 앱 빌드 (시간 소요)
    eas build --profile development --platform android
    ```

3.  **환경 변수 설정:**
    *   `app` 디렉토리의 루트에 `.env` 파일을 생성하고, 백엔드 및 Supabase 접속 정보를 입력합니다. Expo에서는 클라이언트에서 접근 가능한 환경 변수 앞에 `EXPO_PUBLIC_` 접두사를 붙여야 합니다.
    ```env
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    EXPO_PUBLIC_BACKEND_URL=your_backend_api_url
    ```

4.  **개발 서버 실행:**
    *   **반드시 `--dev-client` 플래그와 함께** 다음 명령어를 실행하여 Expo 개발 서버를 시작합니다.
    ```bash
    npx expo start --dev-client
    ```
    *   터미널에 나타나는 QR 코드를 **2번에서 설치한 개발용 앱**으로 스캔하거나, 앱 내에서 직접 서버 주소를 입력하여 접속합니다.

---

## 🛠️ 주요 기술 및 라이브러리

-   **프레임워크:** React Native (with Expo)
-   **개발 환경:** Expo Development Client
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
