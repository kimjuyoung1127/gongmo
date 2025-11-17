import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../hooks/useAuth'

// 화면 너비 가져오기
const { width: screenWidth } = Dimensions.get('window')

// 하단에 고정된 스캔 버튼 컴포넌트 - 사용자 인증 상태에 따라 다른 버튼 텍스트와 동작 제공
export default function FixedScanButton() {
  const router = useRouter()
  const { session } = useAuth()

  const handlePress = () => {
    if (!session) {
      // 로그인하지 않은 경우 로그인 페이지로 이동
      router.replace('/sign-in')
    } else {
      // 로그인한 경우 스캔 페이지로 이동
      router.push('/(tabs)/scan')
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.scanButtonText}>
          {session ? "📷 영수증/바코드 스캔하기" : "🔑 로그인하고 스캔 시작하기"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32, // 홈 인디케이터 고려
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scanButton: {
    backgroundColor: '#0064FF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    width: screenWidth - 32,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  }
})