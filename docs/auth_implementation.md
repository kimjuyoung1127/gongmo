# OAuth 인증 시스템 구현 문서

이 문서는 스마트폰 앱에 구현된 Google OAuth 인증 시스템에 대한 상세 구현 내용을 설명합니다.

## 구현 개요

Google OAuth 인증 시스템은 기존의 deprecated된 'Expo 프록시' 방식 대신 '네이티브 딥 링크' 방식을 사용하여 구현되었습니다. 이 방식은 보안상 더 안전하며, 최신 브라우저의 쿠키 정책 변화에도 잘 대응할 수 있습니다.

## 구현 파일

- `app/sign-in.tsx`: Google 및 Kakao OAuth 로그인 로직 구현
- `lib/supabase.ts`: Supabase 클라이언트 설정

## 핵심 구현 사항

### 1. 네이티브 딥 링크 방식 전환

- 기존: `https://auth.expo.io/@gmdqn2tp/app` 사용
- 변경: `makeRedirectUri({ scheme: 'app' })`을 사용하여 `app://` 스킴 사용

### 2. OAuth 흐름

1. 사용자가 Google 또는 Kakao 로그인 버튼 클릭
2. `supabase.auth.signInWithOAuth` 호출 시 `skipBrowserRedirect: true` 옵션 사용
3. `WebBrowser.openAuthSessionAsync`를 사용하여 외부 브라우저에서 인증 진행
4. 인증 완료 후 앱으로 `app://` 딥 링크로 리디렉션
5. `Linking.useURL()` 훅으로 딥 링크 수신
6. `createSessionFromUrl` 함수로 URL에서 토큰 파싱
7. `supabase.auth.setSession` 호출로 로그인 세션 설정 완료

### 3. 토큰 파싱

OAuth 인증 성공 후 반환되는 URL의 해시 파라미터에서 직접 토큰을 추출합니다:
- `access_token`
- `refresh_token`

URL 파싱은 `decodeURIComponent`를 사용하여 특수 문자를 올바르게 디코딩합니다.

### 4. 설정 파일 업데이트

#### app.json
```json
{
  "expo": {
    "scheme": "app",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "category": ["BROWSABLE", "DEFAULT"],
          "data": {
            "scheme": "app"
          }
        }
      ]
    }
  }
}
```

## 의존성 모듈

- `expo-auth-session`: OAuth 세션 관리
- `expo-web-browser`: 외부 브라우저에서 인증 진행
- `expo-linking`: 딥 링크 처리
- `@supabase/supabase-js`: 사용자 인증 및 데이터베이스 연동
- `@react-native-async-storage/async-storage`: 토큰 영속성 보장

## 중요한 주의 사항

1. Google Cloud Console에서 인증 정보 설정 시, '승인된 리디렉션 URI'에 `app://` 스킴을 등록해야 합니다.
2. Supabase 대시보드에서 'Authentication' → 'URL Configuration'에 `app://*`을 등록해야 합니다.
3. Android 앱에서 딥 링크를 처리하기 위해 `app.json`의 `intentFilters` 설정이 필요합니다.

## 오류 해결

기존 'Something went wrong' 오류는 다음의 이유로 해결되었습니다:
- Expo 프록시 방식 대신 네이티브 딥 링크 방식으로 전환
- 최신 브라우저의 쿠키 정책 변화에 대한 대응