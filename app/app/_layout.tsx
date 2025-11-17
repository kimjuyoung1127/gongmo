import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

const RootLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [firstVisitChecked, setFirstVisitChecked] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Deep Link URL 로깅
  const url = Linking.useURL();
  if (url) {
    console.log('[Deep Link] 앱이 URL로 열림:', url);
  }

  // 첫 방문 여부 확인 (단순화)
  const checkFirstVisit = async () => {
    try {
      const hasVisited = await AsyncStorage.getItem('hasVisitedApp');

      return {
        isFirstTime: !hasVisited
      }
    } catch (error) {
      console.error('First visit check error:', error)
      return { isFirstTime: true }
    }
  }

  // Supabase 세션 초기화 및 인증 상태 변경 감지
  useEffect(() => {
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

  // 온보딩 체크 플래그
  useEffect(() => {
    const checkFirstVisitAsync = async () => {
      await checkFirstVisit();
      setFirstVisitChecked(true);
    };

    if (initialized) {
      checkFirstVisitAsync();
    }
  }, [initialized]);

  // 라우팅 로직 (수정됨: 로그인 장벽 제거)
  useEffect(() => {
    if (!initialized || !firstVisitChecked) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';

    checkFirstVisit().then(({ isFirstTime }) => {
      if (isFirstTime && !inOnboarding) {
        // 1. 첫 방문자? → 무조건 온보딩으로
        console.log('[Routing] 첫 방문자 → 온보딩으로 이동');
        router.replace('/onboarding');
        return;
      }

      if (session && !inAppGroup) {
        // 2. 로그인 유저? → 앱 메인으로
        console.log('[Routing] 로그인 유저 → 앱 메인으로 이동');
        router.replace('/(tabs)');
      } else if (!session && (inAuthGroup || segments[0] === 'sign-in' || segments[0] === 'sign-up')) {
        // 3. 비로그인 유저 + 인증 그룹에 있음? → 그대로 둠 (sign-in, sign-up)
        console.log('[Routing] 비로그인 유저 + 인증 그룹 → 그대로 유지');
        // (아무것도 안 함)
      } else if (!session && !inAuthGroup && !inOnboarding) {
        // 4. 비로그인 유저 + 인증 그룹 아님 (예: 앱의 루트) → 앱 메인(데모 모드)으로
        console.log('[Routing] 비로그인 유저 → 데모 모드 홈으로 이동');
        router.replace('/(tabs)');
      }
    });
  }, [initialized, session, segments, firstVisitChecked]);

  return (
    <Stack>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RootLayout;