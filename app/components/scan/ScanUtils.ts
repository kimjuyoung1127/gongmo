import { supabase } from '../../lib/supabase';

// --- 타입 정의 ---
export type ScannedProductData = {
  name: string;
  category_id: number;
  category_name_kr: string;
  source: string;
  barcode: string;
} & Record<string, any>;

export type ReceiptItem = {
  id: number;
  raw_text: string;
  clean_text: string;
  pred: {
    category_id: number;
    category_code: string;
    confidence: number;
  };
  expiry_days: number;
  quantity_hint?: number;
};

export type ReceiptResponse = {
  receipt_id: number;
  image_url?: string;
  items: ReceiptItem[];
  stats: {
    latency_ms: number;
    engine: string;
  };
};

export type ReceiptData = ReceiptResponse & {
  imageUri?: string;
};

// --- 상수 ---
// PRODUCTION: https://gongmo-backend.onrender.com (언제든 사용 가능)
export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'https://gongmo-backend.onrender.com';

// --- 유틸리티 함수 ---
export const getCategoryIdByName = async (categoryName: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('category_name_kr', categoryName)
      .single();
    
    if (error || !data) {
      console.warn('[CATEGORY] 카테고리를 찾을 수 없음:', categoryName);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error('[CATEGORY] 카테고리 조회 오류:', error);
    return null;
  }
};

export const getCategoryNameById = async (categoryId: number): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('category_name_kr')
      .eq('id', categoryId)
      .single();
    
    if (error || !data) {
      console.warn('[CATEGORY] 카테고리를 찾을 수 없음:', categoryId);
      return null;
    }
    
    return data.category_name_kr;
  } catch (error) {
    console.error('[CATEGORY] 카테고리 조회 오류:', error);
    return null;
  }
};
