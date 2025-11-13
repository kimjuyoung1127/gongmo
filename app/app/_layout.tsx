import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking'; // Linking 임포트

const RootLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Deep Link URL 로깅
  const url = Linking.useURL();
  if (url) {
    console.log('[Deep Link] 앱이 URL로 열림:', url);
  }

  useEffect(() => {
    // Supabase 세션 초기화 및 인증 상태 변경 감지
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[onAuthStateChange] 이벤트:', event);
      console.log('[onAuthStateChange] 세션:', session);
      setSession(session);
      setInitialized(true);
    });

    // 컴포넌트 언마운트 시 리스너 정리
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';

    if (session && !inAppGroup) {
      // 로그인 상태이고, 앱 그룹에 있지 않다면 앱의 메인 화면으로 이동
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      // 로그아웃 상태이고, 인증 그룹에 있지 않다면 로그인 화면으로 이동
      router.replace('/sign-in');
    }
  }, [initialized, session, segments]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RootLayout;