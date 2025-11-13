import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { loadActiveInventory, updateInventoryStatus, subscribeToInventoryChanges, InventoryItem } from '../../lib/supabase';
import InventoryCard from '../../components/InventoryCard';
import { calculateDdayStable } from '../../lib/utils';

type StatusFilter = 'active' | 'expiring';

export default function InventoryScreen() {
  // useState 호출 순서 유지
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [userId, setUserId] = useState<string | null>(null);

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

  // 초기 데이터 로드
  useEffect(() => {
    if (!userId) return;
    
    const loadInventory = async () => {
      try {
        setLoading(true);
        const data = await loadActiveInventory(userId);
        setInventory(data);
      } catch (error) {
        console.error('재고 목록 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    const setupRealtime = async () => {
      try {
        const subscription = await subscribeToInventoryChanges(userId, () => {
          console.log('실시간 변경 감지 - 데이터 새로고침');
          loadInventory();
        });
        
        return () => {
          supabase.removeChannel(subscription);
        };
      } catch (error) {
        console.error('Realtime 구독 실패:', error);
        // 5초마다 폴링으로 대체
        const interval = setInterval(loadInventory, 5000);
        return () => clearInterval(interval);
      }
    };

    // 데이터 로드 후 Realtime 구독 설정
    loadInventory();
    setupRealtime();
  }, [userId]);

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
      // Realtime 구독에서 자동으로 목록 업데이트됨
    } catch (error) {
      console.error('소비 처리 실패:', error);
    }
  };

  const handleDiscard = async (itemId: number) => {
    try {
      await updateInventoryStatus(itemId, 'expired');
      // Realtime 구독에서 자동으로 목록 업데이트됨
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