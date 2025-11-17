import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'

// 로그인 유도 배너 컴포넌트 - 데모 모드 사용자에게 실제 데이터 저장을 위해 로그인 유도
export default function LoginPromptBanner() {
  const router = useRouter()

  const handleLoginPress = () => {
    // 로그인 페이지로 이동
    router.replace('/sign-in')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💡 실제 데이터를 저장해보세요</Text>
      <Text style={styles.subtitle}>
        로그인하면 영수증 스캔 결과를 클라우드에 저장하고 여러 기기에서 동기화할 수 있어요
      </Text>
      <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
        <Text style={styles.loginButtonText}>지금 로그인하기</Text>
      </TouchableOpacity>
    </View>
  )
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F8FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0064FF',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#0064FF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  }
})