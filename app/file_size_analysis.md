# 파일 크기 분석 보고서

2025년 11월 20일, `scanner-project` 폴더의 대용량 파일을 분석한 결과입니다.

## 분석 요약

- **문제점**: `eas build` 실행 시, `.easignore` 파일이 적용되지 않아 프로젝트 압축 용량이 1.2GB에 달하는 문제가 지속적으로 발생하고 있습니다.
- **주요 원인**: 프로젝트 용량의 대부분은 **Android 빌드 과정에서 생성된 로컬 캐시/산출물**과 `node_modules` 및 `.venv`에 포함된 **무거운 라이브러리 파일**입니다.
- **결론**: 이 파일들은 모두 `.easignore` 파일에 의해 빌드 시 제외되어야 하지만, 현재 EAS 빌드 과정에서 알 수 없는 이유(캐시 또는 CLI 내부 문제로 추정)로 무시되지 않고 있습니다.

## 대용량 파일 목록 (상위 20개)

| 크기 (근사치) | 파일명 | 경로 (일부) |
|---|---|---|
| 298 MB | out.aar | `.../react-native-reanimated/android/build/.../release` |
| 156 MB | libreactnative.so | `.../react-native-reanimated/android/build/.../arm64-v8a` |
| 156 MB | libreactnative.so | `.../react-native-vision-camera/android/build/.../arm64-v8a` |
| 156 MB | libreactnative.so | `.../react-native-screens/android/build/.../arm64-v8a` |
| 156 MB | libreactnative.so | `.../android/app/build/intermediates/.../arm64-v8a` |
| 156 MB | libreactnative.so | `.../expo-modules-core/android/build/.../arm64-v8a` |
| 156 MB | libreactnative.so | `.../react-native-worklets/android/build/.../arm64-v8a` |
| 156 MB | libreactnative.so | `.../android/app/build/intermediates/.../out/lib/arm64-v8a` |
| 156 MB | libreactnative.so | `.../react-native-gesture-handler/android/build/.../arm64-v8a` |
| 152 MB | libreactnative.so | `.../react-native-vision-camera/android/build/.../x86_64` |
| 152 MB | libreactnative.so | `.../react-native-worklets/android/build/.../x86_64` |
| 152 MB | libreactnative.so | `.../expo-modules-core/android/build/.../x86_64` |
| 152 MB | libreactnative.so | `.../react-native-screens/android/build/.../x86_64` |
| 127 MB | libpaddle.pyd | `.../.venv/Lib/site-packages/paddle/base` |
| 116 MB | app-release.apk | `.../android/app/build/outputs/apk/release` |

*참고: 위 목록의 `libreactnative.so` 파일들은 서로 다른 경로에 존재하는 별개의 파일들이지만 용량은 유사합니다.*
