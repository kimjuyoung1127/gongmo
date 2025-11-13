import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { calculateDDay } from '../lib/utils';
import { CATEGORIES } from '../lib/categories';
import { InventoryItem } from '../lib/supabase';

interface Props {
  item: InventoryItem;
  onConsume: () => void;
  onDiscard: () => void;
}

export default function InventoryCard({ item, onConsume, onDiscard }: Props) {
  const dDay = calculateDDay(item.expiry_date);
  const categoryInfo = CATEGORIES[item.category_id as keyof typeof CATEGORIES] || 
    { icon: '📦', color: '#F5F5F5', name: '기타' };
  
  // D-Day 상태에 따른 시각적 속성
  const isExpired = dDay < 0;
  const isUrgent = dDay <= 3 && dDay > 0;
  
  const cardStyle = {
    borderLeftWidth: isUrgent ? 6 : 3,
    borderLeftColor: isExpired ? '#9E9E9E' : 
                   isUrgent ? '#F44336' : categoryInfo.color,
    shadowOpacity: isUrgent ? 0.3 : 0.1,
  };
  
  const dDayTextStyle = {
    color: isExpired ? '#9E9E9E' : 
           isUrgent ? '#F44336' : '#333333',
    fontSize: isUrgent ? 28 : 24,
    fontWeight: 'bold' as const,
  };
  
  return (
    <View style={[styles.card, cardStyle]}>
      {/* 1순위: D-Day - 가장 크게 */}
      <View style={styles.dDaySection}>
        <Text style={[styles.dDayText, dDayTextStyle]}>
          {dDay < 0 ? `D+${Math.abs(dDay)}` : `D-${dDay}`}
        </Text>
        <Text style={styles.dDayLabel}>유통기한</Text>
      </View>
      
      {/* 2순위: 이름/카테고리 */}
      <View style={styles.infoSection}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryIcon}>{categoryInfo.icon}</Text>
          <Text style={styles.categoryText}>{categoryInfo.name}</Text>
        </View>
      </View>
      
      {/* 3순위: 수량/유통기한 */}
      <View style={styles.detailSection}>
        <View style={styles.quantityBox}>
          <Text style={styles.quantityLabel}>수량</Text>
          <Text style={styles.quantity}>{item.quantity}</Text>
        </View>
        <Text style={styles.expiryDate}>
          {new Date(item.expiry_date).toLocaleDateString()}
        </Text>
      </View>
      
      {/* 4순위: 액션 버튼 */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.button, styles.consumeButton]} 
          onPress={onConsume}
        >
          <Text style={styles.buttonText}>소비 완료</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.discardButton]} 
          onPress={onDiscard}
        >
          <Text style={styles.buttonText}>폐기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dDaySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dDayText: {
    fontSize: 24,
  },
  dDayLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  infoSection: {
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  detailSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quantityBox: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quantityLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  quantity: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  expiryDate: {
    fontSize: 14,
    color: '#666',
  },
  actionSection: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  consumeButton: {
    backgroundColor: '#4CAF50',
  },
  discardButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
