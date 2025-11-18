import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import RecipeCard from './RecipeCard';

interface RecipeRecommendationListProps {
  recipes: any[];
  onRecipePress: (recipe: any) => void;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const RecipeRecommendationList: React.FC<RecipeRecommendationListProps> = ({ 
  recipes, 
  onRecipePress, 
  loading = false, 
  onRefresh,
  refreshing = false
}) => {
  if (loading && (!recipes || recipes.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>레시피를 불러오는 중...</Text>
      </View>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>레시피를 찾을 수 없습니다</Text>
        <Text style={styles.emptySubtitle}>재료를 스캔하여 냉장고를 채워보세요!</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      {recipes.map((recipe, index) => (
        <RecipeCard
          key={recipe.id || recipe.menu_name || index}
          recipe={recipe}
          onPress={() => onRecipePress(recipe)}
        />
      ))}
      {/* 마지막 카드 뒤에 여백 추가 */}
      <View style={styles.endSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  endSpacer: {
    width: 16,
  },
});

export default RecipeRecommendationList;