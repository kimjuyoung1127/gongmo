import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ReceiptItem } from '../lib/supabase';

interface ReceiptItemCardProps {
  item: ReceiptItem;
  onToggle: () => void;
}

export default function ReceiptItemCard({ item, onToggle }: ReceiptItemCardProps) {
  return (
    <View style={styles.container}>
      {/* 체크박스 */}
      <TouchableOpacity 
        style={[styles.checkbox, item.selected && styles.checkboxChecked]}
        onPress={onToggle}
      >
        {item.selected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      
      {/* 품목 정보 */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.clean_text}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{item.category_name_kr}</Text>
          <Text style={styles.expiry}>D+{item.expiry_days}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E1E8E8',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  expiry: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});
