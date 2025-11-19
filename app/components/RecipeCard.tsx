import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

interface RecipeCardProps {
  recipe: {
    id?: string;
    menu_name: string;
    recipe_data: any;
    match_percentage: number;
    missing_ingredients: string[];
    image_url?: string;
    is_generated?: boolean;
  };
  onPress: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  const { menu_name, match_percentage, missing_ingredients, recipe_data, is_generated } = recipe;
  
  // 조리 시간 정보 추출
  const cooking_time = recipe_data?.cooking_time || '정보 없음';
  // 난이도 정보 추출
  const difficulty = recipe_data?.difficulty || '정보 없음';
  
  // 부족한 재료 개수 계산
  const missingCount = missing_ingredients.length;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {is_generated && (
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      )}
      {/* 레시피 이미지 */}
      {recipe.image_url ? (
        <Image source={{ uri: recipe.image_url }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>🍳</Text>
        </View>
      )}
      
      <View style={styles.content}>
        {/* 레시피 제목 */}
        <Text style={styles.title} numberOfLines={2}>
          {menu_name}
        </Text>
        
        {/* 요약 정보 */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>⏱️</Text>
            <Text style={styles.infoText}>{cooking_time}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>⭐️</Text>
            <Text style={styles.infoText}>{difficulty}</Text>
          </View>
        </View>
        
        {/* 매칭률 */}
        <View style={styles.matchContainer}>
          <Text style={styles.matchText}>재료 매칭률: <Text style={styles.matchValue}>{match_percentage}%</Text></Text>
        </View>
        
        {/* 부족한 재료 표시 */}
        {missingCount > 0 && (
          <View style={styles.missingContainer}>
            <Text style={styles.missingText}>
              {missingCount}개 재료 부족: {missing_ingredients.slice(0, 2).join(', ')}
              {missingCount > 2 ? ' 외...' : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginHorizontal: 8,
    marginVertical: 4,
    overflow: 'hidden',
    width: 280,
  },
  aiBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#6A1B9A',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 1,
  },
  aiBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    minHeight: 40,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  matchContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  matchText: {
    fontSize: 12,
    color: '#333',
  },
  matchValue: {
    fontWeight: '600',
    color: '#0064FF',
  },
  missingContainer: {
    backgroundColor: '#fff8f0',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  missingText: {
    fontSize: 11,
    color: '#FF8C00',
  },
});

export default RecipeCard;