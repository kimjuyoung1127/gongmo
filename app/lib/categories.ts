// 카테고리 아이콘, 색상, 이름 정의 (categories_proper.csv와 일치)
export const CATEGORIES = {
  1: { icon: '🥛', color: '#FFE4E1', name: '유제품(신선)' },
  2: { icon: '🧈', color: '#FFF3E0', name: '유제품(가공)' },
  3: { icon: '🍄', color: '#F3E5F5', name: '버섯류' },
  4: { icon: '🌿', color: '#E8F5E9', name: '산나물' },
  5: { icon: '🥬', color: '#F9E79F', name: '채소(신선)' },
  8: { icon: '🥚', color: '#FFEBEE', name: '난류' },
  9: { icon: '🥬', color: '#E8F5E9', name: '잎채소' },
  10: { icon: '🥒', color: '#E3F2FD', name: '뿌리채소' },
  12: { icon: '🍄', color: '#F3E5F5', name: '버섯류' },
  13: { icon: '🍎', color: '#FFE4E1', name: '과일(일반)' },
  15: { icon: '🍊', color: '#FFF3E0', name: '감귤류' },
  17: { icon: '🐟', color: '#FAFAFA', name: '어류(신선)' },
  20: { icon: '🐚', color: '#F5DEB3', name: '패류' },
  23: { icon: '🌿', color: '#E8F5E9', name: '해조류(생)' },
  25: { icon: '🧊', color: '#E1F5FE', name: '냉동식품' },
  29: { icon: '🥤', color: '#FF6F00', name: '음료(냉장)' },
  30: { icon: '🍪', color: '#D7CCC8', name: '과자/스낵' },
  31: { icon: '☕', color: '#6F4E37', name: '원두/차' },
  32: { icon: '🍶', color: '#FFD700', name: '소스' },
} as const;

// 카테고리 정보 타입
export type CategoryId = 1 | 2 | 3 | 4 | 5 | 8 | 9 | 10 | 12 | 13 | 15 | 17 | 20 | 23 | 25 | 29 | 30 | 31 | 32;
export type CategoryInfo = typeof CATEGORIES[CategoryId];
