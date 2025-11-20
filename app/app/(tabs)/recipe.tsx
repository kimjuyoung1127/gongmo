import React, { useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Alert } from 'react-native';
import { useRecipes, completeRecipe } from '../../hooks/useRecipe';
import RecipeRecommendationList from '../../components/RecipeRecommendationList';
import RecipeDetailModal from '../../components/RecipeDetailModal';
import LoginPromptBanner from '../../components/LoginPromptBanner';

export default function RecipeScreen() {
  const { session } = useAuth();
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const userId = session?.user?.id;

  const {
    recipes,
    loading,
    error,
    refetch,
    generateNewRecipe
  } = useRecipes(userId);

  const handleGenerateRecipe = async () => {
    try {
      await generateNewRecipe();
      // 성공 알림은 선택사항, 리스트가 업데이트되므로 생략 가능하거나 짧게 표시
    } catch (err) {
      Alert.alert('오류', '레시피 생성 중 문제가 발생했습니다.');
    }
  };

  const handleRecipePress = (recipe: any) => {
    setSelectedRecipe(recipe);
    setDetailModalVisible(true);
  };

  const handleCompleteRecipe = async (recipe: any) => {
    if (userId) {
      try {
        await completeRecipe(recipe, userId);
        // TODO: 사용자에게 완료 알림 제공
        console.log('레시피 완료 처리 성공');
      } catch (err) {
        console.error('레시피 완료 처리 실패:', err);
      }
    }
  };

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
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={handleGenerateRecipe}
              disabled={loading}
              style={{ marginRight: 16 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#0064FF" />
              ) : (
                <Ionicons name="add-circle-outline" size={28} color="#0064FF" />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      {loading && (!recipes || recipes.length === 0) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0064FF" />
          <Text style={styles.loadingText}>레시피를 불러오는 중...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>추천 레시피</Text>
          <RecipeRecommendationList
            recipes={recipes}
            onRecipePress={handleRecipePress}
            loading={loading}
            onRefresh={refetch}
            refreshing={false}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </>
      )}

      {/* 레시피 상세 모달 */}
      <RecipeDetailModal
        visible={detailModalVisible}
        recipe={selectedRecipe}
        onClose={() => setDetailModalVisible(false)}
        onComplete={handleCompleteRecipe}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
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
});
