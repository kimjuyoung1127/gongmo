import React, { useState, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ReceiptItem, batchAddToInventory, ReceiptResult } from '../../lib/supabase';
import ReceiptItemCard from '../../components/ReceiptItemCard';

type RouteParams = {
  items: ReceiptItem[];
  stats: any;
};

export default function ReceiptReviewScreen() {
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { items } = route.params as RouteParams;

  // 초기 데이터 로드
  const loadReceiptItems = useCallback(() => {
    try {
      setLoading(true);
      
      // 안전한 데이터 확인
      if (!items || !Array.isArray(items)) {
        console.error('[REVIEW] items가 배열이 아닙니다:', items);
        Alert.alert('오류', '영수증 항목이 없습니다.');
        navigation.goBack();
        return;
      }
      
      // 이미 정제된 items 데이터를 ReceiptItem으로 변환
      const processedItems: ReceiptItem[] = items.map((item, index) => ({
        id: item.id || `temp-${index}`,
        receipt_id: item.receipt_id || 999,
        raw_text: item.raw_text || item.clean_text || '알 수 없음',
        clean_text: item.clean_text || '알 수 없음',
        category_id: item.category_id || 37,
        category_name_kr: item.category_name_kr || '기타',
        expiry_days: item.expiry_days || 7,
        status: 'parsed' as const,
        selected: true
      }));
      
      console.log(`[REVIEW] ${processedItems.length}개 항목 로드 완료`);
      setReceiptItems(processedItems);
    } catch (error) {
      console.error('영수증 항목 로드 실패:', error);
      Alert.alert('오류', '영수증 항목을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [items, navigation]);

  // 화면 진입 시 데이터 로드
  useFocusEffect(
    useCallback(() => {
      loadReceiptItems();
    }, [loadReceiptItems])
  );

  // 헤더 설정
  useLayoutEffect(() => {
    navigation.setOptions({
      title: `영수증 분석 결과 (${receiptItems.length})`,
      headerRight: () => (
        <TouchableOpacity onPress={handleSubmit} disabled={submitting || selectedCount === 0}>
          <Text style={[
            styles.addButton, 
            (submitting || selectedCount === 0) && styles.addButtonDisabled
          ]}>
            {submitting ? '저장 중...' : `추가 (${selectedCount})`}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, receiptItems.length, selectedCount, submitting]);

  // 개별 항목 선택 토글
  const toggleItemSelection = useCallback((itemId: number) => {
    setReceiptItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  }, []);

  // 전체 선택/해제 토글
  const toggleSelectAll = useCallback(() => {
    const allSelected = receiptItems.every(item => item.selected);
    setReceiptItems(prev => prev.map(item => ({ ...item, selected: !allSelected })));
  }, [receiptItems]);

  // 선택된 항목 수 계산
  useEffect(() => {
    const count = receiptItems.filter(item => item.selected).length;
    setSelectedCount(count);
  }, [receiptItems]);

  // 재고에 추가 제출
  const handleSubmit = useCallback(async () => {
    if (selectedCount === 0) {
      Alert.alert('알림', '추가할 항목을 선택해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      
      // 실제 API 호출 대신 모의 처리
      console.log(`[INVENTORY] ${selectedCount}개 항목 재고 추가 시도`);
      
      // 여기서 실제로는 batchAddToInventory(receiptItems) 호출
      // await batchAddToInventory(receiptItems);
      
      setTimeout(() => {
        Alert.alert(
          '성공',
          `${selectedCount}개 항목을 재고에 추가했습니다.`,
          [
            {
              text: '확인',
              onPress: () => navigation.navigate('index' as never)
            }
          ]
        );
        setSubmitting(false);
      }, 1500); // 로딩 효과
      
    } catch (error) {
      console.error('재고 추가 실패:', error);
      Alert.alert('오류', '재고 추가에 실패했습니다. 다시 시도해주세요.');
      setSubmitting(false);
    }
  }, [selectedCount, receiptItems, navigation]);

  // 로딩 상태
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>영수증 분석 결과를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 전체 선택/해제 버튼 */}
      <View style={styles.selectBar}>
        <TouchableOpacity 
          style={styles.selectAllButton}
          onPress={toggleSelectAll}
        >
          <Text style={styles.selectAllText}>
            {receiptItems.every(item => item.selected) ? '전체 해제' : '전체 선택'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.selectedCount}>
          {selectedCount} / {receiptItems.length} 선택됨
        </Text>
      </View>

      {/* 영수증 항목 목록 */}
      <FlatList 
        data={receiptItems}
        renderItem={({ item }) => (
          <ReceiptItemCard 
            item={item}
            onToggle={() => toggleItemSelection(item.id)}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  selectBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8E8',
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 15,
  },
  addButtonDisabled: {
    color: '#CCC',
  },
  listContainer: {
    padding: 16,
  },
});
