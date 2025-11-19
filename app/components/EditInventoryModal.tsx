import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, InventoryItem } from '../lib/supabase';
import { getAllCategories, getCategoryInfo, Category } from '../lib/categories';

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
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [selectedCategoryIcon, setSelectedCategoryIcon] = useState('📦');

  // Fetch all categories when the modal becomes visible
  useEffect(() => {
    if (visible) {
      const fetchCategories = async () => {
        const categories = await getAllCategories();
        setCategoryList(categories);
      };
      fetchCategories();
    }
  }, [visible]);

  // Populate form when the item prop changes
  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity.toString());
      setExpiryDate(item.expiry_date);
      setCategoryId(item.category_id);
    } else {
      // Reset form when item is null
      setName('');
      setQuantity('1');
      setExpiryDate('');
      setCategoryId(null);
    }
  }, [item]);

  // Update selected category icon when categoryId changes
  useEffect(() => {
    if (categoryId !== null) {
      const fetchCategoryIcon = async () => {
        const info = await getCategoryInfo(categoryId);
        setSelectedCategoryIcon(info.icon);
      };
      fetchCategoryIcon();
    } else {
      setSelectedCategoryIcon('📦');
    }
  }, [categoryId]);


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
      if (!item?.id) {
        throw new Error('수정할 아이템의 ID가 유효하지 않습니다.');
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
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      if (updatedItem) onSave(updatedItem);
      
    } catch (error: any) {
      console.error('재고 수정 오류:', error);
      Alert.alert('오류', error.message || '재고 정보를 수정하는 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

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
                  <Text style={styles.itemIconText}>{selectedCategoryIcon}</Text>
                </TouchableOpacity>
                <Text style={styles.itemId}>ID: {item.id}</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>상품 이름</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
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