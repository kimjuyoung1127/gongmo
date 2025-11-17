import React, { useEffect, useState } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LottieView from 'lottie-react-native'

// 화면 너비 가져오기
const { width: screenWidth } = Dimensions.get('window')

// 온보딩 첫 화면 - 앱의 주요 기능을 소개하고 사용자에게 시작 유도
export default function OnboardingScreen() {
  const router = useRouter()
  const [showOnboardingContent, setShowOnboardingContent] = useState(false)

  // Lottie 애니메이션 완료 후 온보딩 콘텐츠 표시
  const onAnimationComplete = () => {
    setTimeout(() => {
      setShowOnboardingContent(true)
    }, 500) // 짧은 지연 후 콘텐츠 전환
  }

  const handleStartPress = async () => {
    try {
      // 개발용 스킵 로직 - 실제 앱에서는 사용자가 온보딩을 완료하면 표시하지 않도록 설정
      await AsyncStorage.setItem('hasVisitedApp', 'true')
      router.replace('/onboarding/permissions')
    } catch (error) {
      console.error('AsyncStorage error:', error)
    }
  }

  // 초기 로딩 시 애니메이션 먼저 표시
  useEffect(() => {
    // 애니메이션이 없는 경우에도 콘텐츠 표시를 보장
    const timer = setTimeout(() => {
      if (!showOnboardingContent) {
        setShowOnboardingContent(true)
      }
    }, 5000) // 5초 후에 강제로 콘텐츠 표시

    return () => clearTimeout(timer)
  }, [])

  if (!showOnboardingContent) {
    // Lottie 애니메이션 표시
    return (
      <View style={styles.container}>
        <View style={styles.animationContainer}>
          <LottieView
            source={require('../../assets/images/onboarding.json')}
            autoPlay
            loop={false}
            resizeMode="contain"
            style={styles.animation}
            onAnimationFinish={onAnimationComplete}
          />
        </View>
      </View>
    )
  }

  // 기존 온보딩 콘텐츠
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
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

      {/* 데모 모드 설명 추가 */}
      <View style={styles.demoHintContainer}>
        <Text style={styles.demoHintTitle}>💡 데모 모드 활용 팁</Text>
        <Text style={styles.demoHintText}>재고 목록에서 항목을 터치하면{'\n'}해당 기능에 대해 자세히 알아볼 수 있어요!</Text>
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
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  animation: {
    width: '130%',
    height: '130%',
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
  },
  demoHintContainer: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#0064FF',
  },
  demoHintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  demoHintText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  }
})