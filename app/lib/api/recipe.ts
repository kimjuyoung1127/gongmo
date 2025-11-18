import { supabase } from '../lib/supabase';

export interface Recipe {
  id: string;
  menu_name: string;
  recipe_data: any;
  created_at: string;
  updated_at: string;
  match_percentage: number;
  missing_ingredients: string[];
}

export interface RecipeDetail {
  id: string;
  menu_name: string;
  recipe_data: any;
  created_at: string;
  updated_at: string;
}

export interface CompleteRecipePayload {
  recipe_id: string;
  user_id: string;
  ingredients_used: Array<{
    name: string;
    quantity_used: number;
  }>;
}

// 레시피 추천 가져오기
export const fetchRecommendRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
  // 너무 많은 재료가 있는 경우 성능을 위해 상위 10개만 사용
  const limitedIngredients = ingredients.slice(0, 10);

  // 재료가 없으면 API 호출하지 않음
  if (limitedIngredients.length === 0) {
    return [];
  }

  try {
    // 백엔드 서버 URL은 환경변수나 상수로 관리하는 것이 좋습니다
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/recipe/search?ingredients=${encodeURIComponent(limitedIngredients.join(','))}`
    );

    // 응답이 JSON인지 확인한 후 파싱
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // JSON이 아닌 경우 빈 객체로 처리
      data = {};
    }

    if (!response.ok) {
      // 사용자 친화적인 오류 메시지 처리
      if (response.status === 404) {
        console.log('레시피 검색 결과 없음:', data.message || '제공된 재료로 가능한 레시피를 찾지 못했어요.');
        return []; // 레시피가 없어도 오류가 아니라 빈 배열 반환
      } else {
        // 서버에서 받은 메시지가 있으면 사용, 없으면 기본 메시지
        const errorMessage = data?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
    }

    return data.recipes || [];
  } catch (error: any) {
    // JSON 파싱 오류나 다른 오류에 대해 적절히 처리
    if (error instanceof SyntaxError) {
      console.error('JSON 파싱 오류:', error.message);
      return []; // 파싱 오류 발생 시 빈 배열 반환
    }

    console.error('레시피 추천 가져오기 오류:', error.message || error);
    // 네트워크 오류 등에 대비해 빈 배열 반환
    return [];
  }
};

// 레시피 상세 정보 가져오기
export const fetchRecipeDetail = async (menuName: string): Promise<RecipeDetail> => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/recipe/detail/${encodeURIComponent(menuName)}`
    );

    // 응답이 JSON인지 확인한 후 파싱
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // JSON이 아닌 경우 빈 객체로 처리
      data = {};
    }

    if (!response.ok) {
      if (response.status === 404) {
        // 레시피를 찾을 수 없는 경우
        const errorMessage = data?.message || '해당 레시피를 찾을 수 없습니다.';
        throw new Error(errorMessage);
      } else {
        // 기타 오류
        const errorMessage = data?.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
    }

    return data;
  } catch (error: any) {
    // JSON 파싱 오류나 다른 오류에 대해 적절히 처리
    if (error instanceof SyntaxError) {
      console.error('레시피 상세 정보 JSON 파싱 오류:', error.message);
      throw new Error('서버 응답을 처리하는 중 오류가 발생했습니다.');
    }

    console.error('레시피 상세 정보 가져오기 오류:', error.message || error);
    throw error;
  }
};

// 레시피 완료 처리
export const postCompleteRecipe = async (payload: CompleteRecipePayload): Promise<any> => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/recipe/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('레시피 완료 처리 오류:', error);
    throw error;
  }
};