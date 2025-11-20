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
import AddInventoryModal from '../../components/AddInventoryModal' // Import the new modal
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

  // Modal states
  const [inventoryDetailVisible, setInventoryDetailVisible] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addModalVisible, setAddModalVisible] = useState(false) // State for the new modal

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setGuideType(type);
      setGuideVisible(true);
    } else {
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
    router.replace('/sign-in');
  };

  // Handle saving updated inventory item
  const handleEditSave = (updatedItem: InventoryItem) => {
    if (session) {
      setRealInventory(prev =>
        prev.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        )
      );
    }
    setEditModalVisible(false);
    forceRefresh({});
  };

  // Inventory detail modal for expiring items state
  const [expiringDetailVisible, setExpiringDetailVisible] = useState(false);
  const [expiringItemsForModal, setExpiringItemsForModal] = useState<InventoryItem[]>([]);

  // Force refresh trigger
  const [, forceRefresh] = useState({});

  // Handle showing inventory detail modal
  const showInventoryDetail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInventoryDetailVisible(true);
  };

  // Handle showing all expiring items detail modal
  const showAllExpiringDetail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpiringItemsForModal(allExpiringItems);
    setExpiringDetailVisible(true);
  };

  // 아이들 타이머 리셋 함수
  const resetIdleTimer = () => {
    if (idleTimeout) clearTimeout(idleTimeout);
    const timeout = setTimeout(() => {
      if (!session && expiringItems.length > 0) {
        setShowIdleHint(true);
        setIdleItem(expiringItems[0]);
      }
    }, 3000);
    setIdleTimeout(timeout);
  };

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimeout) clearTimeout(idleTimeout);
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
      .slice(0, 3)
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
      {session && loading && (
        <View style={styles.loadingContainer}>
          <LottieView source={require('../../assets/images/loading/cook in a wok.json')} autoPlay loop style={styles.lottieAnimation} />
          <Text style={styles.loadingText}>재고 정보를 불러오는 중...</Text>
        </View>
      )}

      {/* Dashboard Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>나의 냉장고</Text>
            <Text style={styles.headerSubtitle}>오늘의 식재료 현황입니다</Text>
          </View>
          {session && (
            <TouchableOpacity style={styles.headerAddButton} onPress={() => setAddModalVisible(true)}>
              <Text style={styles.headerAddButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerStats}>
          <TouchableOpacity style={styles.headerStatItem} onPress={showInventoryDetail}>
            <Text style={styles.headerStatNumber}>{inventory.length}</Text>
            <Text style={styles.headerStatLabel}>전체 재고</Text>
          </TouchableOpacity>
          <View style={styles.headerStatDivider} />
          <TouchableOpacity style={styles.headerStatItem} onPress={showAllExpiringDetail}>
            <Text style={[styles.headerStatNumber, styles.warningText]}>{currentStats.expiring}</Text>
            <Text style={styles.headerStatLabel}>임박 항목</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Storage Stats Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>❄️</Text>
            <Text style={styles.gridNumber}>{currentStats.refrigerated}</Text>
            <Text style={styles.gridLabel}>냉장</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>🧊</Text>
            <Text style={styles.gridNumber}>{currentStats.frozen}</Text>
            <Text style={styles.gridLabel}>냉동</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridIcon}>🏠</Text>
            <Text style={styles.gridNumber}>{currentStats.room_temp}</Text>
            <Text style={styles.gridLabel}>실온</Text>
          </View>
        </View>

        {/* Expiring Items */}
        <InfoCard
          emoji="⚠️"
          title={`소비기한 임박 (${currentStats.expiring}개)`}
          subtitle={expiringItems.length > 0 ? "곧 소비해야 할 식료품이 있어요" : "임박한 식료품이 없어요"}
          variant="warning"
        >
          {expiringItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.expiringItem, showIdleHint && idleItem?.id === item.id && styles.expiringItemHighlighted]}
              onPress={() => { resetIdleTimer(); handleItemPress(item, 'expiry'); }}
            >
              <View style={styles.expiringItemContent}>
                <Text style={styles.expiringItemName}>{item.name}</Text>
                <Text style={styles.expiringItemDate}>{calculateDdayStable(item.expiry_date) + '일 남음'}</Text>
              </View>
              <View style={[styles.dDayBadge, { backgroundColor: calculateDdayStable(item.expiry_date) <= 1 ? '#FF3B30' : '#FF6B00' }]}>
                <Text style={styles.dDayText}>{`D-${calculateDdayStable(item.expiry_date)}`}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {expiringItems.length === 0 && (
            <View style={styles.noExpiringContainer}><Text style={styles.noExpiringText}>😊 여유로운 재고상태네요!</Text></View>
          )}
        </InfoCard>

        {/* Horizontal Recipe Recommendations */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🍳 냉파 레시피 추천</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/recipe')}>
              <Text style={styles.sectionMore}>더보기</Text>
            </TouchableOpacity>
          </View>

          {recipesLoading ? (
            <Text style={styles.loadingText}>레시피를 불러오는 중...</Text>
          ) : recipesError ? (
            <Text style={styles.errorText}>레시피를 불러오지 못했어요</Text>
          ) : recommendedRecipes && recommendedRecipes.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recipeScroll}>
              {recommendedRecipes.slice(0, 5).map((recipe, index) => (
                <TouchableOpacity key={index} style={styles.recipeCard} onPress={() => router.push('/(tabs)/recipe')}>
                  <View style={styles.recipeCardHeader}>
                    <Text style={styles.recipeMatchBadge}>{recipe.match_percentage}% 매칭</Text>
                  </View>
                  <Text style={styles.recipeCardTitle} numberOfLines={2}>{recipe.menu_name}</Text>
                  <Text style={styles.recipeCardSubtitle}>
                    {recipe.missing_ingredients?.length || 0}개 재료 부족
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyRecipeContainer}>
              <Text style={styles.emptyRecipeText}>추천 레시피가 없어요</Text>
            </View>
          )}
        </View>

        {!session && <LoginPromptBanner />}
        <View style={{ height: 100 }} />
      </ScrollView>

      <FixedScanButton />

      <DemoGuideModal visible={guideVisible} onClose={() => setGuideVisible(false)} itemType={guideType} onCTAPress={handleCTAPress} ctaText="저도 이렇게 관리할래요!" />

      <InventoryDetailModal
        visible={inventoryDetailVisible}
        onClose={() => setInventoryDetailVisible(false)}
        inventory={inventory}
        onItemUpdate={handleEditSave}
        onItemDelete={(itemId) => {
          if (session) setRealInventory(prev => prev.filter(item => item.id !== itemId));
          forceRefresh({});
        }}
      />

      <EditInventoryModal visible={editModalVisible} onClose={() => setEditModalVisible(false)} item={editItem} onSave={handleEditSave} />

      <AddInventoryModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={() => {
          setAddModalVisible(false);
          loadRealInventory();
        }}
      />

      <InventoryDetailModal
        visible={expiringDetailVisible}
        onClose={() => setExpiringDetailVisible(false)}
        inventory={expiringItemsForModal}
        onItemPress={(item) => {
          setEditItem(item);
          setExpiringDetailVisible(false);
          setEditModalVisible(true);
        }}
        onItemUpdate={handleEditSave}
        onItemDelete={(itemId) => {
          if (session) setRealInventory(prev => prev.filter(item => item.id !== itemId));
          setExpiringItemsForModal(prev => prev.filter(item => item.id !== itemId));
          setExpiringDetailVisible(false);
          forceRefresh({});
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  // Header Styles
  header: {
    backgroundColor: '#0064FF',
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    shadowColor: '#0064FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerAddButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAddButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    marginTop: -2,
  },
  headerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  headerStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  headerStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  warningText: {
    color: '#FFD700', // Gold color for warning in dark background
  },

  // Grid Styles
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  gridNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  gridLabel: {
    fontSize: 12,
    color: '#666',
  },

  // Recipe Section Styles
  sectionContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  sectionMore: {
    fontSize: 14,
    color: '#0064FF',
    fontWeight: '600',
  },
  recipeScroll: {
    paddingRight: 16,
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: 160,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    height: 140,
    justifyContent: 'space-between',
  },
  recipeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  recipeMatchBadge: {
    backgroundColor: '#E8F4FD',
    color: '#0064FF',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  recipeCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
    lineHeight: 22,
  },
  recipeCardSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  emptyRecipeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRecipeText: {
    color: '#999',
    fontSize: 14,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },

  // Existing Styles (retained/tweaked)
  expiringItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  expiringItemContent: { flex: 1 },
  expiringItemName: { fontSize: 15, fontWeight: '600', color: '#333333' },
  expiringItemDate: { fontSize: 13, color: '#666666', marginTop: 4 },
  dDayBadge: { backgroundColor: '#FF6B00', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  dDayText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  noExpiringContainer: { alignItems: 'center', paddingVertical: 16 },
  noExpiringText: { fontSize: 14, color: '#666666' },
  expiringItemHighlighted: { backgroundColor: '#F0F8FF', borderRadius: 8, transform: [{ scale: 1.02 }] },
  loadingContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5', zIndex: 10 },
  lottieAnimation: { width: 150, height: 150 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#666', fontWeight: '500' },
})