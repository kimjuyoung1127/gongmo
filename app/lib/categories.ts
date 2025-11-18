// 카테고리 아이콘, 색상, 이름 정의 (categories_master.csv와 일치)
export const CATEGORIES = {
  // 고기 관련 카테고리 (우선 순위 높음)
  6: { icon: '🥩', color: '#FFCCBC', name: '육류' }, // MEAT_FRESH
  7: { icon: '🥓', color: '#FFAB91', name: '가공육' }, // MEAT_PROCESSED

  // 난류
  8: { icon: '🥚', color: '#FFF3E0', name: '난류' }, // EGGS

  // 유제품
  1: { icon: '🥛', color: '#E8F5E9', name: '유제품(신선)' }, // DAIRY_FRESH
  2: { icon: '🧈', color: '#E8F5E9', name: '유제품(가공)' }, // DAIRY_PROCESSED
  3: { icon: '🧀', color: '#FFECB3', name: '연질치즈' }, // SOFT_CHEESE
  4: { icon: '🧀', color: '#FFCC80', name: '경성치즈' }, // HARD_CHEESE

  // 채소류
  9: { icon: '🥬', color: '#E8F5E9', name: '잎채소' }, // LEAFY_VEGETABLES
  10: { icon: '🥒', color: '#F1F8E9', name: '줄기채소' }, // STEM_VEGETABLES
  11: { icon: '🍠', color: '#FFECB3', name: '뿌리채소(저온)' }, // ROOT_VEGETABLES
  12: { icon: '🌱', color: '#C8E6C9', name: '발아채소' }, // SPROUTS
  13: { icon: '🍅', color: '#FCE4EC', name: '열매채소' }, // FRUIT_VEGETABLES
  14: { icon: '🍄', color: '#F3E5F5', name: '버섯류' }, // MUSHROOMS

  // 과일류
  15: { icon: '🍎', color: '#FFE0E6', name: '과일(일반)' }, // FRUIT_GENERAL
  16: { icon: '🍓', color: '#FCE4EC', name: '베리류' }, // BERRIES
  17: { icon: '🍊', color: '#FFF3E0', name: '감귤류' }, // CITRUS
  18: { icon: '🥭', color: '#FFE0B2', name: '열대과일' }, // TROPICAL_FRUIT

  // 어류 및 해산물
  19: { icon: '🐟', color: '#E1F5FE', name: '어류(신선)' }, // FISH_FRESH
  20: { icon: '🦞', color: '#E0F2F1', name: '패류' }, // SHELLFISH
  21: { icon: '🦀', color: '#E0F2F1', name: '연체/갑각류' }, // MOLLUSCS_CRUSTACEANS
  22: { icon: '🥬', color: '#E8F5E9', name: '해조류(생)' }, // FRESH_SEAWEED
  23: { icon: '🥬', color: '#C8E6C9', name: '해조류(건조)' }, // DRY_SEAWEED

  // 냉동식품 및 면류
  24: { icon: '❄️', color: '#E1F5FE', name: '냉동식품' }, // FROZEN_FOOD
  25: { icon: '🍝', color: '#FFF8E1', name: '건면' }, // DRIED_NOODLES
  26: { icon: '🍜', color: '#FFF3E0', name: '생/냉장면' }, // FRESH_NOODLES

  // 빵류
  27: { icon: '🍞', color: '#FFF3E0', name: '빵(일반)' }, // BREAD_GENERAL
  28: { icon: '🥮', color: '#FFECB3', name: '베이커리(크림/샌드)' }, // BAKERY_CREAM_SANDWICH

  // 음료류
  29: { icon: '🥤', color: '#E1F5FE', name: '음료(냉장)' }, // BEVERAGE_REFRIGERATED
  30: { icon: '🥤', color: '#E3F2FD', name: '음료(멸균/캔)' }, // BEVERAGE_SHELF_STABLE

  // 간식류
  31: { icon: '🍪', color: '#FBE9E7', name: '과자/스낵' }, // SNACKS

  // 곡류 및 기타 식품
  32: { icon: '🌾', color: '#FBE9E7', name: '곡류/쌀' }, // GRAINS_RICE
  33: { icon: '🧂', color: '#ECEFF1', name: '소스/조미료' }, // SAUCES_SEASONINGS
  34: { icon: '🥗', color: '#E8F5E9', name: '김치/절임류' }, // PICKLED_VEGETABLES
  35: { icon: '🥫', color: '#F5F5F5', name: '통조림/건식품' }, // CANNED_DRY_GOODS

  // 반조리 식품
  36: { icon: '🍽️', color: '#FFF3E0', name: '반조리/냉장 HMR' }, // READY_MEALS_REFRIGERATED
  37: { icon: '🍽️', color: '#E1F5FE', name: '반조리/냉동 HMR' }, // READY_MEALS_FROZEN

  // 기타
  38: { icon: '📦', color: '#F5F5F5', name: '기타' }, // ETC
} as const;

// 카테고리 정보 타입
export type CategoryId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38;
export type CategoryInfo = typeof CATEGORIES[CategoryId];
