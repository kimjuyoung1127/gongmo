import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useAuth } from '../../hooks/useAuth'
import { useRouter } from 'expo-router'
import LoginPromptBanner from '../../components/LoginPromptBanner'

export default function RecipeScreen() {
  const { session } = useAuth()
  const router = useRouter()

  if (!session) {
    // Show demo content for non-logged users
    return (
      <View style={styles.container}>
        <LoginPromptBanner 
          message="레시피를 보려면 로그인이 필요합니다"
          buttonText="로그인하고 레시피 보기"
          onButtonPress={() => router.push('/sign-in')}
        />
        <View style={styles.demoContent}>
          <Text style={styles.title}>레시피 기능 준비 중</Text>
          <Text style={styles.description}>
            보유한 재료로 만들 수 있는 레시피를 추천해 드립니다.
            곧 멋진 레시피 기능이 출시됩니다!
          </Text>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🔮 곧 출시될 기능들</Text>
            <Text style={styles.featureItem}>• 재료 기반 레시피 추천</Text>
            <Text style={styles.featureItem}>• 유통기한 임박 재료 활용법</Text>
            <Text style={styles.featureItem}>• 영양 성분 분석</Text>
            <Text style={styles.featureItem}>• 조리 시간별 필터링</Text>
          </View>
        </View>
      </View>
    )
  }

  // Show coming soon screen for logged users
  return (
    <View style={styles.container}>
      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoonTitle}>🍳 레시피</Text>
        <Text style={styles.comingSoonSubtitle}>
          보유한 재료로 만들 수 있는 레시피를 추천해 드립니다
        </Text>
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>🔮 곧 출시될 기능들</Text>
          <Text style={styles.previewFeature}>• 재료 기반 레시피 추천</Text>
          <Text style={styles.previewFeature}>• 유통기한 임박 재료 활용법</Text>
          <Text style={styles.previewFeature}>• 영양 성분 분석</Text>
          <Text style={styles.previewFeature}>• 조리 시간별 필터링</Text>
          <Text style={styles.previewFeature}>• 개인 취향 기반 추천</Text>
        </View>
        <TouchableOpacity style={styles.scanButton}>
          <Text style={styles.scanButtonText}>먼저 재품을 스캔해 보세요</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  demoContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  comingSoonContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  comingSoonSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  previewCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    marginBottom: 32,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  previewFeature: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    lineHeight: 22,
  },
  scanButton: {
    backgroundColor: '#0064FF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
