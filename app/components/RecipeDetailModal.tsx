import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Image, Dimensions, Linking } from 'react-native';
import { useRouter } from 'expo-router';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RecipeDetailModalProps {
  visible: boolean;
  recipe: any;
  onClose: () => void;
  onComplete: (recipe: any) => void;
}

const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ visible, recipe, onClose, onComplete }) => {
  const router = useRouter();

  if (!recipe) {
    return null;
  }

  const { menu_name, recipe_data, match_percentage, missing_ingredients } = recipe;
  const { ingredients, instructions, nutrition_info, cooking_time, difficulty, tips, image_url } = recipe_data || {};

  const availableIngredients = ingredients?.filter((ing: any) => 
    !missing_ingredients?.includes(ing.name)
  ) || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={2}>{menu_name}</Text>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 요약 카드 */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryIcon}>⏱️</Text>
                <Text style={styles.summaryValue}>{cooking_time || '정보 없음'}</Text>
                <Text style={styles.summaryLabel}>조리시간</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryIcon}>⭐️</Text>
                <Text style={styles.summaryValue}>{difficulty || '정보 없음'}</Text>
                <Text style={styles.summaryLabel}>난이도</Text>
              </View>
              {nutrition_info?.calories && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryIcon}>🔥</Text>
                  <Text style={styles.summaryValue}>{nutrition_info.calories}</Text>
                  <Text style={styles.summaryLabel}>Kcal</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* 레시피 이미지 */}
          {image_url && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image_url }} style={styles.recipeImage} />
            </View>
          )}
          
          {/* 재료 체크리스트 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>필요 재료</Text>
            
            {/* 보유 재료 */}
            {availableIngredients.length > 0 && (
              <View style={styles.ingredientsCategory}>
                <Text style={styles.categoryTitle}>✓ 보유 중인 재료 ({availableIngredients.length}개)</Text>
                {availableIngredients.map((ingredient: any, index: number) => (
                  <View key={`available-${index}`} style={styles.ingredientRow}>
                    <Text style={styles.ingredientCheck}>✓</Text>
                    <Text style={styles.ingredientText}>{ingredient.name} {ingredient.amount && `(${ingredient.amount})`}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* 부족한 재료 */}
            {missing_ingredients?.length > 0 && (
              <View style={styles.ingredientsCategory}>
                <Text style={styles.categoryTitle}>❌ 부족한 재료 ({missing_ingredients.length}개)</Text>
                {missing_ingredients.map((ingredient: string, index: number) => (
                  <View key={`missing-${index}`} style={styles.ingredientRow}>
                    <Text style={styles.ingredientCheck}>❌</Text>
                    <Text style={styles.missingIngredientText}>{ingredient}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          
          {/* 조리 순서 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>조리 순서</Text>
            {instructions?.map((step: any, index: number) => (
              <View key={index} style={styles.instructionStep}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{step.description}</Text>
              </View>
            ))}
          </View>
          
          {/* AI 꿀팁 */}
          {tips && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI 꿀팁</Text>
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsText}>{tips}</Text>
              </View>
            </View>
          )}
        </ScrollView>
        
        {/* 하단 고정 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.completeButton} 
            onPress={() => {
              onComplete(recipe);
              onClose();
            }}
          >
            <Text style={styles.completeButtonText}>요리 완료!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    paddingBottom: 100, // 버튼 높이만큼 패딩
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  imageContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ingredientsCategory: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  ingredientCheck: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 20,
  },
  ingredientText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  missingIngredientText: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    flex: 1,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0064FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    flex: 1,
  },
  tipsContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  completeButton: {
    backgroundColor: '#0064FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecipeDetailModal;