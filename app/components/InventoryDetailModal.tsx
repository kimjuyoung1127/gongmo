import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase, InventoryItem } from '../lib/supabase';
import { calculateDDay } from '../lib/utils';
import { getCategoryInfo, Category } from '../lib/categories';
import EditInventoryModal from './EditInventoryModal';

// Props for the main modal
interface InventoryDetailModalProps {
  visible: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onItemPress?: (item: InventoryItem) => void;
  onItemUpdate?: (updatedItem: InventoryItem) => void;
  onItemDelete?: (itemId: number) => void;
}

// A new sub-component for rendering a single inventory item.
// It fetches its own category info asynchronously.
const InventoryListItem = ({
  item,
  onPress,
  onLongPress,
}: {
  item: InventoryItem;
  onPress: () => void;
  onLongPress: () => void;
}) => {
  const [categoryInfo, setCategoryInfo] = useState<Category>({
    id: item.category_id,
    name: '로딩...',
    icon: '⏳',
    color: '#F5F5F5',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchCategory = async () => {
      const info = await getCategoryInfo(item.category_id);
      if (isMounted) {
        setCategoryInfo(info);
      }
    };
    fetchCategory();
    return () => {
      isMounted = false;
    };
  }, [item.category_id]);

  const dDay = calculateDDay(item.expiry_date);
  const isExpired = dDay < 0;
  const isUrgent = dDay <= 3 && dDay > 0;
  const dDayText = isExpired ? `D+${Math.abs(dDay)}` : `D-${dDay}`;
  const dDayColor = isExpired ? '#9E9E9E' : isUrgent ? '#F44336' : '#333333';

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onPress} onLongPress={onLongPress}>
      <View style={styles.itemRow}>
        <View style={[styles.itemIcon, { backgroundColor: categoryInfo.color }]}>
          <Text style={styles.itemIconText}>{categoryInfo.icon}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemCategory}>{categoryInfo.name}</Text>
        </View>
        <View style={styles.itemDetails}>
          <Text style={[styles.dDayText, { color: dDayColor }]}>{dDayText}</Text>
          <Text style={styles.itemQuantity}>{item.quantity}개</Text>
        </View>
      </View>
      <View style={styles.itemFooter}>
        <Text style={styles.itemExpiryDate}>
          {new Date(item.expiry_date).toLocaleDateString('ko-KR')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Main Modal Component
export default function InventoryDetailModal({
  visible,
  onClose,
  inventory,
  onItemPress,
  onItemUpdate,
  onItemDelete,
}: InventoryDetailModalProps) {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const sortedInventory = useMemo(() => {
    return [...inventory].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [inventory]);

  const handleLongPress = (item: InventoryItem) => {
    Alert.alert(
      '재고 항목',
      `${item.name} 항목을 어떻게 하시겠습니까?`,
      [
        {
          text: '수정',
          onPress: () => {
            setSelectedItem(item);
            setEditModalVisible(true);
          },
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => confirmDelete(item),
        },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  const confirmDelete = (item: InventoryItem) => {
    Alert.alert(
      '삭제 확인',
      `${item.name} 항목을 정말 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('inventory').delete().eq('id', item.id);
              if (error) throw error;
              onItemDelete?.(item.id);
            } catch (error: any) {
              console.error('재고 삭제 오류:', error);
              Alert.alert('오류', error.message || '재고 항목을 삭제하는 중 문제가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleEditModalSave = (updatedItem: InventoryItem) => {
    onItemUpdate?.(updatedItem);
    setEditModalVisible(false);
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.overlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>내 재고 현황</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            {sortedInventory.length > 0 ? (
              <FlatList
                data={sortedInventory}
                renderItem={({ item }) => (
                  <InventoryListItem
                    item={item}
                    onPress={() => onItemPress?.(item)}
                    onLongPress={() => handleLongPress(item)}
                  />
                )}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>등록된 재고가 없습니다</Text>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      <EditInventoryModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        item={selectedItem}
        onSave={handleEditModalSave}
      />
    </>
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
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemIconText: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
  },
  itemDetails: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  dDayText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemFooter: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  itemExpiryDate: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});