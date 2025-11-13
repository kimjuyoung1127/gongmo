import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, TextInput, Button, Text, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Generate redirect URI using the scheme from app.json
const redirectUri = makeRedirectUri({ scheme: 'app' });

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Handle deep link URLs when the app is opened from a URL
  const url = Linking.useURL();
  useEffect(() => {
    if (url) {
      createSessionFromUrl(url);
    }
  }, [url]);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('로그인 실패', error.message);
    setLoading(false);
  }

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

      if (!accessToken || !refreshToken) {
        throw new Error('돌아온 URL에서 토큰 정보를 찾을 수 없습니다.');
      }

      console.log('[Deep Link] 토큰 추출 성공. Supabase 세션 설정 시도.');
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) throw sessionError;

      console.log('[Deep Link] Supabase 세션 설정 성공! 홈으로 이동합니다.');
    } catch (e: any) {
      console.error('[Deep Link] URL에서 세션 생성 실패:', e?.message ?? e);
      Alert.alert('세션 생성 실패', e?.message ?? 'URL에서 세션을 생성하는 데 실패했습니다.');
    }
  }

  async function signInWithOAuth(provider: 'google' | 'kakao') {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
      console.log('--- [OAuth] 프로세스 종료 ---\n');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>로그인</Text>
      <TextInput style={styles.input} placeholder="이메일" value={email} onChangeText={setEmail}
                 autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="비밀번호" value={password}
                 onChangeText={setPassword} secureTextEntry />
      <View style={styles.buttonContainer}>
        <Button title="로그인" onPress={signInWithEmail} disabled={loading} />
      </View>

      <View style={styles.socialLoginContainer}>
        <TouchableOpacity style={styles.socialButton} onPress={() => signInWithOAuth('google')} disabled={loading}>
          <Image source={require('../assets/images/google-logo.png')} style={styles.socialLogo} />
          <Text style={styles.socialButtonText}>구글로 로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={() => signInWithOAuth('kakao')} disabled={loading}>
          <Image source={require('../assets/images/kakao-logo.png')} style={styles.socialLogo} />
          <Text style={styles.socialButtonText}>카카오로 로그인</Text>
        </TouchableOpacity>
      </View>

      <Link href="/sign-up" style={styles.link}>
        계정이 없으신가요? 회원가입
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    marginTop: 10,
  },
  socialLoginContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
    justifyContent: 'center',
  },
  socialLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: 'blue',
  },
});