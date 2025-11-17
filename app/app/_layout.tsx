import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { BACKEND_URL } from '../components/scan/ScanUtils';

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

  // 서버 프리워밍 (Pre-warming): 앱이 시작될 때 서버를 미리 깨워서 콜드 스타트 문제 해결
  useEffect(() => {
    // 서버를 깨우는 요청을 보냄 (Fire and Forget - 응답 대기 없음)
    fetch(`${BACKEND_URL}/health`)
      .then(response => {
        if (response.ok) {
          console.log("[SERVER-PREWARM] 서버가 성공적으로 깨어남");
        } else {
          console.log("[SERVER-PREWARM] 서버 깨우기 요청 실패:", response.status);
        }
      })
      .catch(error => {
        console.log("[SERVER-PREWARM] 서버 깨우기 중 오류:", error);
      });
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

      if (session && !inAppGroup && segments[0] !== 'settings' && segments[0] !== 'explore') {
        // 2. 로그인 유저? (인증 그룹이 아니고, 설정/탐색 페이지도 아닐 때) → 앱 메인으로
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

  // 인증 초기화 중에는 로티 로딩 화면 표시
  if (!initialized || !firstVisitChecked) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require('../assets/images/loading/Boiling pot.json')}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
});

export default RootLayout;