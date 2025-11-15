import React, { useState, useEffect, useMemo, useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // useFocusEffect, useNavigation 임포트
import { loadActiveInventory, updateInventoryStatus, InventoryItem } from '../../lib/supabase';
import InventoryCard from '../../components/InventoryCard';
import { calculateDdayStable } from '../../lib/utils';

type StatusFilter = 'active' | 'expiring';

export default function InventoryScreen() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [userId, setUserId] = useState<string | null>(null);
  const navigation = useNavigation();

  // 사용자 ID 가져오기
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // 데이터 로드 함수 (useCallback으로 감싸서 불필요한 재생성 방지)
  const loadInventory = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await loadActiveInventory(userId);
      setInventory(data);
    } catch (error) {
      console.error('재고 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 화면이 포커스될 때마다 데이터 로드
  useFocusEffect(
    useCallback(() => {
      loadInventory();
    }, [loadInventory]) // loadInventory 함수가 변경될 때만 useFocusEffect를 다시 실행
  );

  // 헤더에 새로고침 버튼 추가
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={loadInventory} style={{ marginRight: 15 }}>
          <Text style={{ color: '#007AFF', fontSize: 16 }}>새로고침</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, loadInventory]);

  // 필터링된 재고 목록
  const filteredInventory = useMemo(() => {
    let filtered = inventory;
    
    if (statusFilter === 'expiring') {
      filtered = filtered.filter(item => {
        const dDay = calculateDdayStable(item.expiry_date);
        const diffDays = Math.ceil(dDay / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays > 0;
      });
    }
    
    // D-Day 기반 정렬
    return filtered.sort((a, b) => {
      const dDayA = calculateDdayStable(a.expiry_date);
      const dDayB = calculateDdayStable(b.expiry_date);
      return dDayA - dDayB;
    });
  }, [inventory, statusFilter]);

  // 재고 상태 변경 핸들러
  const handleConsume = async (itemId: number) => {
    try {
      await updateInventoryStatus(itemId, 'consumed');
      loadInventory(); // 상태 변경 후 목록 새로고침
    } catch (error) {
      console.error('소비 처리 실패:', error);
    }
  };

  const handleDiscard = async (itemId: number) => {
    try {
      await updateInventoryStatus(itemId, 'expired');
      loadInventory(); // 상태 변경 후 목록 새로고침
    } catch (error) {
      console.error('폐기 처리 실패:', error);
    }
  };

  // 필터 카운트 계산
  const expiringCount = useMemo(() => {
    return inventory.filter(item => {
      const dDay = calculateDdayStable(item.expiry_date);
      const diffDays = Math.ceil(dDay / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    }).length;
  }, [inventory]);

  // 로딩 상태
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>재고 목록 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 필터 버튼 */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            statusFilter === 'active' && styles.activeFilter
          ]}
          onPress={() => setStatusFilter('active')}
        >
          <Text style={styles.filterText}>🥬 전체 ({inventory.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            statusFilter === 'expiring' && styles.activeFilter
          ]}
          onPress={() => setStatusFilter('expiring')}
        >
          <Text style={styles.filterText}>🔴 D-7 ({expiringCount})</Text>
        </TouchableOpacity>
      </View>

      {/* 재고 목록 */}
      <FlatList 
        data={filteredInventory}
        renderItem={({ item }) => (
          <InventoryCard 
            item={item}
            onConsume={() => handleConsume(item.id)}
            onDiscard={() => handleDiscard(item.id)}
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#FFF',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E8E8',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeFilterText: {
    color: '#FFF',
  },
  listContainer: {
    padding: 16,
  },
});