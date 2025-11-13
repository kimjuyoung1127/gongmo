import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL 또는 Anon Key가 .env 파일에 설정되지 않았습니다.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// 재고 타입 정의 (추후 database.types.ts 생성 시 대비)
export type InventoryItem = {
  id: number;
  user_id: string;
  name: string;
  category_id: number;
  category_name_kr?: string; // JOIN으로 가져올 카테고리 이름
  barcode: string | null;
  quantity: number;
  expiry_date: string;
  status: 'active' | 'consumed' | 'expired';
  created_at: string;
  updated_at: string;
};

// 활성 재고 목록 로드 (categories 테이블 JOIN)
export const loadActiveInventory = async (userId: string): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      categories(category_name_kr)
    `)
    .eq('user_id', userId)
    .eq('status', 'active') // 오직 활성 재고만
    .order('expiry_date', { ascending: true });
  
  if (error) {
    console.error('재고 목록 로드 오류:', error);
    throw error;
  }
  
  return data || [];
};

// 재고 상태 업데이트
export const updateInventoryStatus = async (
  itemId: number, 
  status: 'active' | 'consumed' | 'expired'
): Promise<void> => {
  const { error } = await supabase
    .from('inventory')
    .update({ status }) // updated_at은 트리거에서 자동 업데이트
    .eq('id', itemId);
  
  if (error) {
    console.error('재고 상태 업데이트 오류:', error);
    throw error;
  }
};

// Realtime 구독 (사용자별)
export const subscribeToInventoryChanges = async (
  userId: string,
  callback: () => void
) => {
  // 1. 사용자 정보를 먼저 가져옴
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("사용자가 로그인되어 있지 않습니다.");

  // 2. 사용자별 고유 채널로 구독
  const channel = supabase
    .channel(`inventory_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'inventory',
        filter: `user_id=eq.${user.id}`
      },
      callback
    )
    .subscribe();
  
  return channel;
};
