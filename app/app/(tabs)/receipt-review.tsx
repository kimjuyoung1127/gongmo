import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';

import { useNavigation, NavigationProp } from '@react-navigation/native';
import { StackParamList } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { ReceiptItem, ReceiptData } from '../../components/scan/ScanUtils';

type Props = StackParamList<'receipt-review'>;

export default function ReceiptReviewScreen({ navigation, route }: Props) {
  const [receiptData, setReceiptData] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const receiptItems: ReceiptItem[] = receiptData?.items || [];

  // Props에서 데이터 가져오기
  React.useEffect(() => {
    if (route.params?.receiptData) {
      setReceiptData(route.params.receiptData);
    }
  }, [route.params]);

  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedItems.size === receiptItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(receiptItems.map(item => item.id)));
    }
  };

  const handleAddToInventory = async () => {
    if (selectedItems.size === 0) {
      Alert.alert('안내', '재고에 추가할 항목을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const selectedItemsArray = receiptItems.filter(item => selectedItems.has(item.id));
      
      // 1. Supabase 스키마에 맞게 데이터 가공
      const purchaseDate = new Date();
      const itemsToInsert = selectedItemsArray.map(item => {
        // 백엔드에서 받은 유통기한(expiry_days)으로 실제 만료일 계산
        const expiryDate = new Date(purchaseDate);
        expiryDate.setDate(purchaseDate.getDate() + item.expiry_days); // (item.expiry_days는 백엔드 응답에 포함되어야 함)

        return {
          name: item.clean_text,
          category_id: item.pred.category_id, // 사용자가 수정한 ID (MLOps 기능 추가 시)
          expiry_date: expiryDate.toISOString().split('T')[0],
          purchase_date: purchaseDate.toISOString().split('T')[0],
          // user_id는 RLS 정책으로 자동 삽입됨
        };
      });

      // 2. Supabase DB에 일괄 삽입
      const { error } = await supabase
        .from('inventory')
        .insert(itemsToInsert);

      if (error) {
        throw error; // catch 블록으로 이동
      }

      // 3. 성공 알림 및 화면 이동
      Alert.alert('성공', `${itemsToInsert.length}개 항목이 재고에 추가되었습니다.`);
      navigation.navigate('index'); // '재고' 탭으로 이동
    } catch (error) {
      console.error('재고 저장 중 오류:', error);
      Alert.alert('오류', '재고에 추가하는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryTag = (item: ReceiptItem) => {
    const confidence = item.pred.confidence;
    const isLowConfidence = confidence < 0.7;
    
    return (
      <TouchableOpacity 
        style={[
          styles.categoryTag,
          isLowConfidence && styles.lowConfidenceTag
        ]}
      >
        <Text style={[
          styles.categoryText,
          isLowConfidence && styles.lowConfidenceText
        ]}>
          카테고리 {item.pred.category_id}
          {isLowConfidence && ' ⚠️'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: ReceiptItem }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity 
        style={[
          styles.checkbox,
          selectedItems.has(item.id) && styles.checkboxSelected
        ]}
        onPress={() => toggleItemSelection(item.id)}
      />
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.clean_text}</Text>
        {renderCategoryTag(item)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          영수증 분석 결과 ({receiptItems.length}개)
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={toggleAllSelection}
          >
            <Text style={styles.toggleButtonText}>
              {selectedItems.size === receiptItems.length ? '전체 해제' : '전체 선택'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.addButton,
              selectedItems.size === 0 && styles.addButtonDisabled
            ]}
            onPress={handleAddToInventory}
            disabled={selectedItems.size === 0 || isLoading}
          >
            <Text style={styles.addButtonText}>
              선택한 {selectedItems.size}개 추가
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={receiptItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  lowConfidenceTag: {
    backgroundColor: '#fff3e0',
  },
  categoryText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  lowConfidenceText: {
    color: '#f57c00',
  },
});
