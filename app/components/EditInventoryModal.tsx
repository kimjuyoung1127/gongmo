import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, InventoryItem } from '../lib/supabase';
import { CATEGORIES } from '../lib/categories';

interface EditInventoryModalProps {
  visible: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSave: (updatedItem: InventoryItem) => void;
}

export default function EditInventoryModal({
  visible,
  onClose,
  item,
  onSave
}: EditInventoryModalProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 카테고리 목록
  const categoryList = Object.entries(CATEGORIES).map(([id, info]) => ({
    id: parseInt(id),
    ...info
  }));

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity.toString());
      setExpiryDate(item.expiry_date);
      setCategoryId(item.category_id);
    } else {
      // Reset form when item is null
      setName('');
      setQuantity('');
      setExpiryDate('');
      setCategoryId(6); // Default to "육류(신鮮)" as the highest priority category
    }
  }, [item]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('오류', '상품 이름을 입력해주세요.');
      return;
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('오류', '수량을 올바르게 입력해주세요.');
      return;
    }

    if (!expiryDate) {
      Alert.alert('오류', '유통기한을 입력해주세요.');
      return;
    }

    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity <= 0) {
      Alert.alert('오류', '수량은 1 이상의 숫자여야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      // Validate that item has a valid ID for update
      if (!item?.id) {
        throw new Error('Invalid item ID for update');
      }

      const { data: updatedItem, error } = await supabase
        .from('inventory')
        .update({
          name: name.trim(),
          quantity: newQuantity,
          expiry_date: expiryDate,
          category_id: categoryId,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id) // Using non-null assertion since we validated above
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (updatedItem) {
        onSave(updatedItem);
        onClose();
      }
    } catch (error: any) {
      console.error('재고 수정 오류:', error);
      Alert.alert('오류', error.message || '재고 정보를 수정하는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      '삭제 확인',
      `${item?.name} 항목을 정말 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // Validate that item has a valid ID for deletion
              if (!item?.id) {
                throw new Error('Invalid item ID for deletion');
              }

              const { error } = await supabase
                .from('inventory')
                .delete()
                .eq('id', item.id);

              if (error) {
                throw error;
              }

              onClose();
            } catch (error: any) {
              console.error('재고 삭제 오류:', error);
              Alert.alert('오류', error.message || '재고 항목을 삭제하는 중 문제가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const categoryInfo = CATEGORIES[categoryId as keyof typeof CATEGORIES] ||
    { icon: '📦', color: '#F5F5F5', name: '기타' };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>재고 수정</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {item && (
              <View style={styles.itemInfo}>
                <TouchableOpacity style={styles.itemIcon} disabled>
                  <Text style={styles.itemIconText}>{categoryInfo.icon}</Text>
                </TouchableOpacity>
                <Text style={styles.itemId}>ID: {item.id}</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>상품 이름</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="상품 이름을 입력하세요"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>수량</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="수량을 입력하세요"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>유통기한</Text>
              <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="YYYY-MM-DD 형식으로 입력"
                keyboardType="default"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>카테고리</Text>
              <View style={styles.categorySelector}>
                <FlatList
                  data={categoryList}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item: cat }) => (
                    <TouchableOpacity
                      style={[
                        styles.categoryItem,
                        categoryId === cat.id && styles.selectedCategory
                      ]}
                      onPress={() => setCategoryId(cat.id)}
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text style={styles.categoryText}>{cat.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              {item?.id && (
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDelete}
                  disabled={isLoading}
                >
                  <Text style={styles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>{isLoading ? '저장 중...' : '저장'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  itemInfo: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  itemIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemIconText: {
    fontSize: 30,
  },
  itemId: {
    fontSize: 14,
    color: '#666',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 5,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategory: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2, // Add small margin between buttons
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    color: '#F44336',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    marginLeft: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});