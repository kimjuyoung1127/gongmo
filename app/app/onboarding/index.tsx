import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

// 화면 너비 가져오기
const { width: screenWidth } = Dimensions.get('window')

// 온보딩 첫 화면 - 앱의 주요 기능을 소개하고 사용자에게 시작 유도
export default function OnboardingScreen() {
  const router = useRouter()

  const handleStartPress = async () => {
    try {
      // 개발용 스킵 로직 - 실제 앱에서는 사용자가 온보딩을 완료하면 표시하지 않도록 설정
      await AsyncStorage.setItem('hasVisitedApp', 'true')
      router.replace('/onboarding/permissions')
    } catch (error) {
      console.error('AsyncStorage error:', error)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>🥫</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            영수증을 찍기만 하면,{"\n"}식비 관리까지 한 번에! 💡
          </Text>
          <Text style={styles.subtitle}>
            AI가 영수증과 바코드를 자동으로 스캔해서{"\n"}
            냉장고 재고를 스마트하게 관리해드릴게요
          </Text>
        </View>
      </View>

      <View style={styles.features}>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>📷</Text>
          <Text style={styles.featureText}>영수증 스캔</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>⚡</Text>
          <Text style={styles.featureText}>자동 등록</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>🗓️</Text>
          <Text style={styles.featureText}>유통기한 관리</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartPress}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>시작하기</Text>
        </TouchableOpacity>

        {/* 개발용 스킵 버튼 - 실제 배포 시에는 제거해야 함 */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.skipButtonText}>건너뛰기 (개발용)</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 48,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 32,
  },
  startButton: {
    backgroundColor: '#0064FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 56,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#999999',
    fontSize: 14,
  }
})