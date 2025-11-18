import React, { useMemo, useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import * as Haptics from 'expo-haptics'
import { useAuth } from '../../hooks/useAuth'
import { useDemoData } from '../../hooks/useDemoData'
import { useRecipes } from '../../hooks/useRecipe'
import InfoCard from '../../components/InfoCard'
import FixedScanButton from '../../components/FixedScanButton'
import LoginPromptBanner from '../../components/LoginPromptBanner'
import DemoGuideModal from '../../components/DemoGuideModal'
import InventoryDetailModal from '../../components/InventoryDetailModal'
import EditInventoryModal from '../../components/EditInventoryModal'
import { loadActiveInventory, InventoryItem } from '../../lib/supabase'
import LottieView from 'lottie-react-native'

// 유틸리티 함수
const calculateDdayStable = (expiryDate: string): number => {
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = expiry.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 홈 화면 - 인증 상태에 따라 데모 데이터 또는 실제 데이터를 표시하며, 온보딩 기반 UX 제공
export default function InventoryScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const { demoInventory, stats, storyGroups } = useDemoData()

  const [realInventory, setRealInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)

  // 레시피 추천 데이터 가져오기
  const userId = session?.user?.id;
  const { recipes: recommendedRecipes, loading: recipesLoading, error: recipesError } = useRecipes(userId);

  // Demo guide modal state
  const [guideVisible, setGuideVisible] = useState(false)
  const [guideType, setGuideType] = useState<'expiry' | 'storage' | 'recipe'>('expiry')

  // Inventory detail modal state
  const [inventoryDetailVisible, setInventoryDetailVisible] = useState(false)
  // Edit inventory item modal state
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)

  // Idle state for animation hint
  const [idleTimeout, setIdleTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showIdleHint, setShowIdleHint] = useState(false)
  const [idleItem, setIdleItem] = useState<any>(null)

  // 실제 데이터 로드 (로그인된 경우)
  const loadRealInventory = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      const data = await loadActiveInventory(session.user.id)
      setRealInventory(data)
    } catch (error) {
      console.error('실제 데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 아이템 클릭 핸들러 - 데모 모드일 때는 가이드 모달, 실제 모드일 때는 수정 모달
  const handleItemPress = (item: any, type: 'expiry' | 'storage' | 'recipe') => {
    if (!session) {
      // 데모 모드(비로그인) -> 가이드 모달 띄우기
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 햅틱 피드백
      setGuideType(type);
      setGuideVisible(true);
    } else {
      // 실제 모드(로그인) -> 수정 모달 열기
      if (type === 'expiry') {
        setEditItem(item);
        setEditModalVisible(true);
      } else {
        console.log('상세 페이지 이동');
      }
    }
  };

  // CTA 버튼 핸들러 - 데모 모드에서 로그인 유도
  const handleCTAPress = () => {
    setGuideVisible(false);
    // 로그인 화면으로 이동
    router.replace('/sign-in');
  };

  // Handle saving updated inventory item
  const handleEditSave = (updatedItem: InventoryItem) => {
    if (session) {
      // Update the real inventory with the edited item
      setRealInventory(prev =>
        prev.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );
    } else {
      // Update the demo inventory if in demo mode
      // Note: This would require updating useDemoData hook to expose setter
      console.log("Updated demo item:", updatedItem);
    }
    setEditModalVisible(false);
    // Force a refresh to ensure UI updates immediately
    forceRefresh({});
  };

  // Inventory detail modal for expiring items state
  const [expiringDetailVisible, setExpiringDetailVisible] = useState(false);
  const [expiringItemsForModal, setExpiringItemsForModal] = useState<InventoryItem[]>([]);

  // Force refresh trigger
  const [, forceRefresh] = useState({}); // Simple state to trigger re-renders

  // Handle showing inventory detail modal
  const showInventoryDetail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 햅틱 피드백
    setInventoryDetailVisible(true);
  };

  // Handle showing expiring items detail modal
  const showExpiringDetail = (items: InventoryItem[]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 햅틱 피드백
    setExpiringItemsForModal(items);
    setExpiringDetailVisible(true);
  };

  // Handle showing all expiring items detail modal
  const showAllExpiringDetail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // 햅틱 피드백
    setExpiringItemsForModal(allExpiringItems);
    setExpiringDetailVisible(true);
  };

  // 아이들 타이머 리셋 함수
  const resetIdleTimer = () => {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }

    // 3초 후에 아이들 상태 활성화
    const timeout = setTimeout(() => {
      // 데모 모드이고 아이템이 있으면 첫 번째 아이템에 힌트 표시
      if (!session && expiringItems.length > 0) {
        setShowIdleHint(true);
        setIdleItem(expiringItems[0]);
      }
    }, 3000);

    setIdleTimeout(timeout);
  };

  // 터치 이벤트 발생 시 타이머 리셋
  useEffect(() => {
    // 컴포넌트 마운트 시 타이머 시작
    resetIdleTimer();

    return () => {
      if (idleTimeout) {
        clearTimeout(idleTimeout);
      }
    };
  }, [expiringItems, session]);

  // 세션 상태가 변경될 때마다 실제 데이터 로드
  useEffect(() => {
    if (session) {
      loadRealInventory()
    }
  }, [session])

  // 화면이 포커스될 때마다 실제 데이터 로드 (새로고침 기능)
  useFocusEffect(
    React.useCallback(() => {
      if (session) {
        loadRealInventory()
      }
    }, [session])
  )

  // 데모/실제 데이터 결정
  const inventory = session ? realInventory : demoInventory
  const currentStats = session ?
    (() => {
      const refrigerated = inventory.filter(item => item.category_name_kr?.includes('유제품') || item.category_name_kr?.includes('계란')).length
      const frozen = inventory.filter(item => item.category_name_kr?.includes('냉동')).length
      const room_temp = inventory.length - refrigerated - frozen
      const expiring = inventory.filter(item => {
        const dDay = calculateDdayStable(item.expiry_date)
        return dDay <= 7 && dDay > 0
      }).length
      return { refrigerated, frozen, room_temp, expiring }
    })()
    : stats

  // 임박 상품 필터링 (3개만 표시용)
  const expiringItems = useMemo(() => {
    return inventory
      .filter(item => {
        const dDay = calculateDdayStable(item.expiry_date)
        return dDay <= 7 && dDay > 0
      })
      .sort((a, b) => {
        const dDayA = calculateDdayStable(a.expiry_date)
        const dDayB = calculateDdayStable(b.expiry_date)
        return dDayA - dDayB
      })
      .slice(0, 3) // 최대 3개만 표시
  }, [inventory])

  // 전체 임박 상품 (모달용)
  const allExpiringItems = useMemo(() => {
    return inventory
      .filter(item => {
        const dDay = calculateDdayStable(item.expiry_date)
        return dDay <= 7 && dDay > 0
      })
      .sort((a, b) => {
        const dDayA = calculateDdayStable(a.expiry_date)
        const dDayB = calculateDdayStable(b.expiry_date)
        return dDayA - dDayB
      })
  }, [inventory])

  return (
    <View style={styles.container}>
      {/* 데이터 로딩 중 로티 애니메이션 */}
      {session && loading && (
        <View style={styles.loadingContainer}>
          <LottieView
            source={require('../../assets/images/loading/cook in a wok.json')}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
          <Text style={styles.loadingText}>재고 정보를 불러오는 중...</Text>
        </View>
      )}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 카드 1: 오늘의 식품 현황 */}
        <TouchableOpacity onPress={showInventoryDetail} activeOpacity={0.8}>
          <InfoCard
            emoji="💡"
            title="오늘의 식품 현황"
            subtitle={`냉장 ${currentStats.refrigerated}개 | 냉동 ${currentStats.frozen}개 | 실온 ${currentStats.room_temp}개`}
          >
            <View style={styles.quickStats}>
              <TouchableOpacity
                style={styles.statItem}
                onPress={showInventoryDetail}
              >
                <Text style={styles.statNumber}>{inventory.length}</Text>
                <Text style={styles.statLabel}>총재고</Text>
              </TouchableOpacity>
              <View style={styles.statDivider} />
              <TouchableOpacity
                style={styles.statItem}
                onPress={showAllExpiringDetail}
              >
                <Text style={[styles.statNumber, styles.warningText]}>{currentStats.expiring}</Text>
                <Text style={styles.statLabel}>임박</Text>
              </TouchableOpacity>
            </View>
          </InfoCard>
        </TouchableOpacity>

        {/* 카드 2: 소비기한 임박 */}
        <InfoCard
          emoji="⚠️"
          title={`소비기한 임박 (${currentStats.expiring}개)`}
          subtitle={expiringItems.length > 0 ? "곧 소비해야 할 식료품이 있어요" : "임박한 식료품이 없어요"}
          variant="warning"
        >
          {expiringItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.expiringItem,
                showIdleHint && idleItem?.id === item.id ? styles.expiringItemHighlighted : null
              ]}
              onPress={() => {
                resetIdleTimer();
                handleItemPress(item, 'expiry');
              }}
            >
              <View style={styles.expiringItemContent}>
                <Text style={styles.expiringItemName}>{item.name}</Text>
                <Text style={styles.expiringItemDate}>{item.d_day || calculateDdayStable(item.expiry_date) + '일'}</Text>
              </View>
              <View style={[styles.dDayBadge, { backgroundColor: item.d_day?.includes('D-1') ? '#FF3B30' : '#FF6B00' }]}>
                <Text style={styles.dDayText}>{item.d_day || `D-${calculateDdayStable(item.expiry_date)}`}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {expiringItems.length === 0 && (
            <View style={styles.noExpiringContainer}>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>😊</Text>
              </View>
              <Text style={styles.noExpiringText}>여유로운 재고상태네요!</Text>
            </View>
          )}
        </InfoCard>

        {/* 카드 3: 레시피 추천 */}
        <InfoCard
          emoji="🍳"
          title="냉파 레시피 추천"
          subtitle="보유 재료로 만들 수 있는 요리"
        >
          {recipesLoading ? (
            <View style={styles.recipeItem}>
              <Text style={styles.recipeTitle}>레시피를 불러오는 중...</Text>
            </View>
          ) : recipesError ? (
            <View style={styles.recipeItem}>
              <Text style={styles.recipeTitle}>레시피를 불러오지 못했어요</Text>
              <Text style={styles.recipeDesc}>다시 시도해 주세요</Text>
            </View>
          ) : recommendedRecipes && recommendedRecipes.length > 0 ? (
            recommendedRecipes.slice(0, 2).map((recipe, index) => (
              <TouchableOpacity
                key={recipe.id || recipe.menu_name || index}
                style={styles.recipeItem}
                onPress={() => router.push('/(tabs)/recipe')}
              >
                <View style={styles.recipeContent}>
                  <Text style={styles.recipeTitle}>{recipe.menu_name}</Text>
                  <Text style={styles.recipeDesc}>
                    {recipe.match_percentage}% 매칭 | {recipe.missing_ingredients?.length || 0}개 재료 부족
                  </Text>
                </View>
                <Text style={styles.recipeArrow}>→</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.recipeItem}>
              <Text style={styles.recipeTitle}>추천 레시피가 없어요</Text>
              <Text style={styles.recipeDesc}>재료를 더 추가해 보세요!</Text>
            </View>
          )}
        </InfoCard>

        {/* 로그인 유도 배너 (데모 모드일 때만) */}
        {!session && <LoginPromptBanner />}

        {/* 하단 여백 (고정 버튼 공간 확보) */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 고정된 하단 CTA 버튼 */}
      <FixedScanButton />

      {/* 데모 가이드 모달 */}
      <DemoGuideModal
        visible={guideVisible}
        onClose={() => setGuideVisible(false)}
        itemType={guideType}
        onCTAPress={handleCTAPress}
        ctaText="저도 이렇게 관리할래요!"
      />

      {/* 재고 상세 모달 */}
      <InventoryDetailModal
        visible={inventoryDetailVisible}
        onClose={() => setInventoryDetailVisible(false)}
        inventory={inventory}
        onItemUpdate={(updatedItem) => {
          if (session) {
            setRealInventory(prev =>
              prev.map(item =>
                item.id === updatedItem.id ? updatedItem : item
              )
            );
          }
          // Force a refresh to ensure UI updates immediately
          forceRefresh({});
        }}
        onItemDelete={(itemId) => {
          if (session) {
            setRealInventory(prev =>
              prev.filter(item => item.id !== itemId)
            );
          }
          // Force a refresh to ensure UI updates immediately
          forceRefresh({});
        }}
      />

      {/* 재고 항목 수정 모달 */}
      <EditInventoryModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        item={editItem}
        onSave={handleEditSave}
      />

      {/* 소비기한 임박 상세 모달 */}
      <InventoryDetailModal
        visible={expiringDetailVisible}
        onClose={() => setExpiringDetailVisible(false)}
        inventory={expiringItemsForModal}
        onItemPress={(item) => {
          setEditItem(item);
          setExpiringDetailVisible(false);
          setEditModalVisible(true);
        }}
        onItemUpdate={(updatedItem) => {
          if (session) {
            setRealInventory(prev =>
              prev.map(item =>
                item.id === updatedItem.id ? updatedItem : item
              )
            );
          }
          setExpiringItemsForModal(prev =>
            prev.map(item =>
              item.id === updatedItem.id ? updatedItem : item
            )
          );
          // Force a refresh to ensure UI updates immediately
          forceRefresh({});
        }}
        onItemDelete={(itemId) => {
          if (session) {
            setRealInventory(prev =>
              prev.filter(item => item.id !== itemId)
            );
          } else {
            // For demo mode, trigger a refresh to get updated demo data
            // This is a workaround since we can't directly modify demo data
            console.log("Demo item deleted:", itemId);
          }
          setExpiringItemsForModal(prev =>
            prev.filter(item => item.id !== itemId)
          );
          // Also close the modal after deletion
          setExpiringDetailVisible(false);
          // Force a refresh to ensure UI updates immediately
          forceRefresh({});
        }}
      />
    </View>
  )
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  quickStats: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
  },
  warningText: {
    color: '#FF6B00',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E1E8E8',
    marginHorizontal: 16,
  },
  expiringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  expiringItemContent: {
    flex: 1,
  },
  expiringItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  expiringItemDate: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  dDayBadge: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dDayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  noExpiringContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emojiContainer: {
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
  },
  noExpiringText: {
    fontSize: 14,
    color: '#666666',
  },
  recipeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipeContent: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  recipeDesc: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  recipeArrow: {
    fontSize: 16,
    color: '#999999',
  },
  expiringItemHighlighted: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    transform: [{ scale: 1.02 }], // 약간 확대 효과
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    zIndex: 1,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
})