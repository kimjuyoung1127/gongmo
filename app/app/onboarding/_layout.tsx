import { Stack } from 'expo-router'

// 온보딩 화면의 레이아웃 설정 - 헤더를 숨기고 스택 네비게이션 구성
export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="permissions" />
    </Stack>
  )
}