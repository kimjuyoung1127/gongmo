import React, { useEffect } from 'react';
import { Alert, StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

// Generate redirect URI using the scheme from app.json
const redirectUri = makeRedirectUri({ scheme: 'app' });

export default function SignInScreen() {
  const router = useRouter();

  // Handle deep link URLs when the app is opened from a URL
  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url);
    }
  }, [url]);

  // Function to parse tokens from deep link URL and set the session
  async function createSessionFromUrl(url: string) {
    try {
      console.log('[Deep Link] 딥 링크 URL 수신:', url);

      // Extract the hash part from the URL (tokens are typically in the hash for OAuth)
      const urlObject = new URL(url);

      // Parse the hash fragment manually to extract parameters
      const hashFragment = urlObject.hash.substring(1); // Remove the '#'
      const params: { [key: string]: string } = {};

      // Split the hash fragment by '&' to get individual parameters
      const pairs = hashFragment.split('&');
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          // DecodeURIComponent to properly handle special characters in tokens
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      }

      const accessToken = params['access_token'];
      const refreshToken = params['refresh_token'];

      console.log('[Deep Link] 토큰 파싱 결과:');
      console.log('   - Access Token:', accessToken ? '있음' : '없음');
      console.log('   - Refresh Token:', refreshToken ? '있음' : '없음');

      // Only proceed if both tokens are present (actual OAuth callback)
      if (!accessToken || !refreshToken) {
        console.log('[Deep Link] OAuth 토큰 없음 - 일반적인 URL 접근으로 간주');
        return; // Just return without showing an error for non-OAuth URLs
      }

      console.log('[Deep Link] 토큰 추출 성공. Supabase 세션 설정 시도.');
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) throw sessionError;

      console.log('[Deep Link] Supabase 세션 설정 성공! 홈으로 이동합니다.');
      // Navigate to home screen after successful login
      router.replace('/(tabs)');
    } catch (e: any) {
      console.error('[Deep Link] URL에서 세션 생성 실패:', e?.message ?? e);
      // Don't show alert if it's a non-OAuth scenario
      if (e?.message?.includes('토큰 정보를 찾을 수 없습니다')) {
        console.log('[Deep Link] OAuth 토큰 없는 일반 접근 - 알럿 표시 안 함');
        return;
      }
      Alert.alert('세션 생성 실패', e?.message ?? 'URL에서 세션을 생성하는 데 실패했습니다.');
    }
  }

  async function signInWithOAuth(provider: 'google' | 'kakao') {
    try {
      console.log(`\n--- [OAuth] ${provider} 로그인 프로세스 시작 ---`);
      console.log('[OAuth] 1. 사용할 리디렉션 URI:', redirectUri);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });

      if (error || !data?.url) {
        throw error ?? new Error('인증 URL을 받지 못했습니다.');
      }
      console.log('[OAuth] 2. 인증 URL 받기 성공. 브라우저 열기 시도.');
      console.log('   - URL:', data.url);

      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      console.log('[OAuth] 3. WebBrowser 결과 수신:', res);

      if (res.type === 'success' && res.url) {
        console.log('[OAuth] 4. 성공적인 리디렉션. 딥 링크를 통한 세션 설정 시도.');
        console.log('   - 돌아온 URL:', res.url);
        await createSessionFromUrl(res.url);
      } else if (res.type === 'cancel') {
        console.log('[OAuth] 사용자가 인증을 취소했습니다.');
      } else {
        throw new Error('OAuth 흐름이 취소되거나 실패했습니다.');
      }
    } catch (e: any) {
      console.error('[OAuth] 최종 오류:', e?.message ?? e);
      Alert.alert('로그인 실패', e?.message ?? '알 수 없는 오류가 발생했습니다.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>냉장고 파먹기</Text>
          <Text style={styles.appSubtitle}>당신의 식재료로 만드는 맞춤 레시피</Text>
        </View>

        <View style={styles.loginOptions}>
          <Text style={styles.loginTitle}>로그인하고 맞춤 레시피를 받아보세요</Text>

          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={() => signInWithOAuth('google')}
          >
            <Image source={require('../assets/images/google-logo.png')} style={styles.socialLogo} />
            <Text style={styles.socialButtonText}>Google로 계속하기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.kakaoButton]}
            onPress={() => signInWithOAuth('kakao')}
          >
            <Image source={require('../assets/images/kakao-logo.png')} style={styles.socialLogo} />
            <Text style={styles.socialButtonText}>카카오톡으로 계속하기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 80,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  loginOptions: {
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 24,
    textAlign: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderColor: '#FEE500',
  },
  socialLogo: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 18,
  },
});