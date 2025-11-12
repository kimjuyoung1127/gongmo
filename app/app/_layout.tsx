import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* (tabs) 그룹 라우트를 렌더링합니다. */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* 다른 스크린이나 모달이 있다면 여기에 추가할 수 있습니다. */}
    </Stack>
  );
}