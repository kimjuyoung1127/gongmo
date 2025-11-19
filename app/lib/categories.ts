import { supabase } from './supabase';

// 타입 정의
export interface Category {
  id: number;
  icon: string;
  color: string;
  name: string;
}

// 아이콘/색상 매핑 (기존 데이터 유지)
// DB에 이 정보가 없으므로 프론트엔드에서 계속 관리합니다.
const categoryVisuals: { [key: string]: { icon: string; color: string } } = {
  DAIRY_FRESH: { icon: '🥛', color: '#E8F5E9' },
  DAIRY_PROCESSED: { icon: '🧈', color: '#E8F5E9' },
  SOFT_CHEESE: { icon: '🧀', color: '#FFECB3' },
  HARD_CHEESE: { icon: '🧀', color: '#FFCC80' },
  MEAT_FRESH: { icon: '🥩', color: '#FFCCBC' },
  MEAT_PROCESSED: { icon: '🥓', color: '#FFAB91' },
  EGGS: { icon: '🥚', color: '#FFF3E0' },
  LEAFY_VEGETABLES: { icon: '🥬', color: '#E8F5E9' },
  STEM_VEGETABLES: { icon: '🥒', color: '#F1F8E9' },
  ROOT_VEGETABLES: { icon: '🍠', color: '#FFECB3' },
  SPROUTS: { icon: '🌱', color: '#C8E6C9' },
  FRUIT_VEGETABLES: { icon: '🍅', color: '#FCE4EC' },
  MUSHROOMS: { icon: '🍄', color: '#F3E5F5' },
  FRUIT_GENERAL: { icon: '🍎', color: '#FFE0E6' },
  BERRIES: { icon: '🍓', color: '#FCE4EC' },
  CITRUS: { icon: '🍊', color: '#FFF3E0' },
  TROPICAL_FRUIT: { icon: '🥭', color: '#FFE0B2' },
  FISH_FRESH: { icon: '🐟', color: '#E1F5FE' },
  SHELLFISH: { icon: '🦞', color: '#E0F2F1' },
  MOLLUSCS_CRUSTACEANS: { icon: '🦀', color: '#E0F2F1' },
  FRESH_SEAWEED: { icon: '🥬', color: '#E8F5E9' },
  DRY_SEAWEED: { icon: '🥬', color: '#C8E6C9' },
  FROZEN_FOOD: { icon: '❄️', color: '#E1F5FE' },
  DRIED_NOODLES: { icon: '🍝', color: '#FFF8E1' },
  FRESH_NOODLES: { icon: '🍜', color: '#FFF3E0' },
  BREAD_GENERAL: { icon: '🍞', color: '#FFF3E0' },
  BAKERY_CREAM_SANDWICH: { icon: '🥮', color: '#FFECB3' },
  BEVERAGE_REFRIGERATED: { icon: '🥤', color: '#E1F5FE' },
  BEVERAGE_SHELF_STABLE: { icon: '🥤', color: '#E3F2FD' },
  SNACKS: { icon: '🍪', color: '#FBE9E7' },
  GRAINS_RICE: { icon: '🌾', color: '#FBE9E7' },
  SAUCES_SEASONINGS: { icon: '🧂', color: '#ECEFF1' },
  PICKLED_VEGETABLES: { icon: '🥗', color: '#E8F5E9' },
  CANNED_DRY_GOODS: { icon: '🥫', color: '#F5F5F5' },
  READY_MEALS_REFRIGERATED: { icon: '🍽️', color: '#FFF3E0' },
  READY_MEALS_FROZEN: { icon: '🍽️', color: '#E1F5FE' },
  ETC: { icon: '📦', color: '#F5F5F5' },
};

// 캐시 및 상태 관리
let categoriesMap: Map<number, Category> = new Map();
let categoriesPromise: Promise<void> | null = null;

// DB에서 카테고리를 로드하고 매핑하는 함수
async function loadCategories() {
  if (categoriesMap.size > 0) {
    return;
  }

  console.log('[Categories] DB에서 카테고리 정보를 로드합니다...');
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, category_code, category_name_kr');

    if (error) throw error;

    const newMap = new Map<number, Category>();
    data.forEach(cat => {
      const visuals = categoryVisuals[cat.category_code] || { icon: '📦', color: '#F5F5F5' };
      newMap.set(cat.id, {
        id: cat.id,
        name: cat.category_name_kr,
        ...visuals,
      });
    });
    categoriesMap = newMap;
    console.log(`[Categories] 성공: ${categoriesMap.size}개의 카테고리를 로드했습니다.`);
  } catch (error) {
    console.error('[Categories] 카테고리 로드 실패:', error);
    // 실패 시 비워둠
    categoriesMap = new Map();
  }
}

// 카테고리 로드를 보장하는 함수
async function ensureCategoriesLoaded() {
  if (!categoriesPromise) {
    categoriesPromise = loadCategories();
  }
  await categoriesPromise;
}

// 컴포넌트에서 사용할 함수
export async function getCategoryInfo(id: number): Promise<Category> {
  await ensureCategoriesLoaded();
  return categoriesMap.get(id) || { id, name: '기타', icon: '📦', color: '#F5F5F5' };
}

// 모든 카테고리 목록을 가져오는 함수 (예: Picker용)
export async function getAllCategories(): Promise<Category[]> {
  await ensureCategoriesLoaded();
  return Array.from(categoriesMap.values());
}

// 앱 시작 시 카테고리 로드 실행
ensureCategoriesLoaded();

