import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { ReceiptItem } from '../lib/supabase';

interface ReceiptItemCardProps {
  item: ReceiptItem;
  onToggle: () => void;
}

const ReceiptItemCard: React.FC<ReceiptItemCardProps> = ({ item, onToggle }) => {
  return (
    <View style={[
      styles.card,
      item.selected ? styles.cardSelected : styles.cardUnselected
    ]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.itemName}>{item.clean_text}</Text>
          <Text style={styles.category}>카테고리: {item.category_name_kr}</Text>
          <Text style={styles.expiry}>유통기한: {item.expiry_days}일</Text>
        </View>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>{item.selected ? '선택됨' : '미선택'}</Text>
          <Switch
            value={item.selected}
            onValueChange={onToggle}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={item.selected ? "#007AFF" : "#f4f3f4"}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardSelected: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardUnselected: {
    borderLeftWidth: 4,
    borderLeftColor: '#CCC',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  expiry: {
    fontSize: 14,
    color: '#888',
  },
  toggleContainer: {
    alignItems: 'flex-end',
  },
  toggleLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
});

export default ReceiptItemCard;