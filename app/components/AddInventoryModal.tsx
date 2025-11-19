import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { getAllCategories, Category } from '../lib/categories';

interface AddInventoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function AddInventoryModal({
  visible,
  onClose,
  onSave
}: AddInventoryModalProps) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  // Fetch all categories when the modal becomes visible
  useEffect(() => {
    if (visible) {
      const fetchCategories = async () => {
        const categories = await getAllCategories();
        setCategoryList(categories);
      };
      fetchCategories();
      
      // Reset form on open
      setName('');
      setQuantity('1');
      setExpiryDate('');
      setCategoryId(null);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!name.trim() || !quantity || !expiryDate || categoryId === null) {
      Alert.alert('오류', '모든 필드를 올바르게 입력해주세요.');
      return;
    }

    const newQuantity = parseInt(quantity);
    if (isNaN(newQuantity) || newQuantity <= 0) {
      Alert.alert('오류', '수량은 1 이상의 숫자여야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { error } = await supabase
        .from('inventory')
        .insert({
          name: name.trim(),
          quantity: newQuantity,
          expiry_date: expiryDate,
          category_id: categoryId,
          user_id: user.id,
          source_type: 'manual', // Mark as manually added
        });

      if (error) throw error;

      Alert.alert('성공', '재고가 성공적으로 추가되었습니다.');
      onSave(); // Trigger refresh on the main screen
      onClose(); // Close the modal
      
    } catch (error: any) {
      console.error('재고 추가 오류:', error);
      Alert.alert('오류', error.message || '재고를 추가하는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>재고 직접 추가</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>상품 이름</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="예: 서울우유 1L" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>수량</Text>
              <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>유통기한</Text>
              <TextInput style={styles.input} value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>카테고리</Text>
              <View style={styles.categorySelector}>
                <FlatList
                  data={categoryList}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(cat) => cat.id.toString()}
                  renderItem={({ item: cat }) => (
                    <TouchableOpacity
                      style={[ styles.categoryItem, categoryId === cat.id && styles.selectedCategory ]}
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
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>{isLoading ? '저장 중...' : '저장'}</Text>
            </TouchableOpacity>
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
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
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
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
    // Styles for category selector container
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
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
    fontSize: 14,
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
