import React, { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import LottieView from 'lottie-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width: screenWidth } = Dimensions.get('window')

const ONBOARDING_STEPS = [
  {
    id: 'scan',
    title: '영수증과 바코드로\n1초 만에 등록',
    description: '번거로운 입력은 그만! 카메라로 찍기만 하면\nAI가 자동으로 식재료를 등록해줍니다.',
    emoji: '📷',
  },
  {
    id: 'expiry',
    title: '유통기한 임박,\n놓치지 마세요',
    description: '소중한 식재료가 버려지지 않도록,\n유통기한이 다가오면 미리 알려드립니다.',
    emoji: '⏰',
  },
  {
    id: 'recipe',
    title: '냉장고 속 재료로\n만드는 요리',
    description: '뭘 해먹을지 고민되시나요? 보유한 재료로\n만들 수 있는 최적의 레시피를 추천해드려요.',
    emoji: '🍳',
  },
  {
    id: 'start',
    title: '지금 바로\n시작해보세요',
    description: '더 스마트한 주방 생활,\nAI 식료품 관리자와 함께하세요.',
    emoji: '🚀',
  },
];

export default function OnboardingScreen() {
  const router = useRouter()
  const [showOnboardingContent, setShowOnboardingContent] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const onAnimationComplete = () => {
    setTimeout(() => {
      setShowOnboardingContent(true)
    }, 500)
  }

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentStep + 1,
        animated: true,
      })
    } else {
      handleStartPress()
    }
  }

  const handleStartPress = async () => {
    try {
      await AsyncStorage.setItem('hasVisitedApp', 'true')
      router.replace('/onboarding/permissions')
    } catch (error) {
      console.error('AsyncStorage error:', error)
    }
  }

  const handleSkip = () => {
    flatListRef.current?.scrollToIndex({
      index: ONBOARDING_STEPS.length - 1,
      animated: true,
    })
  }

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth)
    setCurrentStep(slideIndex)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showOnboardingContent) {
        setShowOnboardingContent(true)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (!showOnboardingContent) {
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

  const renderItem = ({ item }: { item: typeof ONBOARDING_STEPS[0] }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {currentStep < ONBOARDING_STEPS.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>건너뛰기</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_STEPS}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        bounces={false}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                currentStep === index && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {currentStep === ONBOARDING_STEPS.length - 1 ? '시작하기' : '다음'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  slide: {
    width: screenWidth,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#F0F8FF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 60,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#0064FF',
    width: 20,
  },
  button: {
    backgroundColor: '#0064FF',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0064FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
})