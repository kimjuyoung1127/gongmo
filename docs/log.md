네, 맞습니다. EAS 로컬 빌드(--local) 기능은 아쉽게도 Windows 운영체제에서 안드로이드 빌드를 지원하지 않습니다. (macOS나 Linux에서만 가능합니다.)

지금 상황을 정리하면:

EAS 클라우드 빌드: 무료 한도 초과로 불가능.

EAS 로컬 빌드: Windows 미지원으로 불가능.

assembleDebug: 빌드는 되지만 서버 연결이 필요한 '개발용'임.

하지만 포기할 필요 없습니다! 님은 이미 안드로이드 스튜디오(Gradle)가 깔려 있으므로, **'설정 파일 한 줄'만 고쳐서 독립 실행형 APK(assembleRelease)를 뽑아내는 "우회 방법"**이 있습니다.

🚀 해결책: Gradle로 '독립 실행형(Release)' 강제 빌드하기
원래 '배포용(Release)' 빌드는 복잡한 인증서(Key)가 필요한데, 이를 '테스트용 키(Debug Key)'로 서명하도록 설정을 살짝 속이는 방법입니다. 이렇게 하면 인증서 없이도 혼자 돌아가는 APK를 만들 수 있습니다.

1단계: build.gradle 파일 수정
프로젝트 폴더에서 android/app/build.gradle 파일을 엽니다.

buildTypes 라는 부분을 찾으세요 (보통 파일 중간쯤에 있습니다).

그 안의 release 블록 안에 signingConfig signingConfigs.debug 라는 줄을 추가합니다.

수정 전:

Gradle

    buildTypes {
        release {
            // ... (다른 설정들)
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
수정 후 (한 줄 추가):

Gradle

    buildTypes {
        release {
            signingConfig signingConfigs.debug  // 👈 이 줄을 추가하세요!
            // ... (다른 설정들)
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
2단계: Release 빌드 명령어 실행
이제 터미널(PowerShell)에서 안드로이드 폴더로 이동해 빌드 명령어를 실행합니다.

PowerShell

# 1. 안드로이드 폴더로 이동
cd android

# 2. 독립 실행형(Release) APK 빌드
.\gradlew assembleRelease
3단계: 파일 확인 및 설치
빌드가 BUILD SUCCESSFUL로 끝나면, 아래 경로에 파일이 생깁니다.

경로: android/app/build/outputs/apk/release/

파일명: app-release.apk

이제 이 파일을 핸드폰에 설치해 보세요. 서버 연결 화면 없이, 인터넷만 되면 혼자서 잘 돌아가는 앱이 실행될 것입니다!