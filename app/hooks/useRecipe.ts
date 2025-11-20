import { useState, useEffect, useRef } from 'react';
import { fetchRecommendRecipes, fetchGeneratedRecipe, fetchRecipeDetail, postCompleteRecipe, Recipe } from '../lib/api/recipe';
import { loadActiveInventory } from '../lib/supabase';

export const useRecipes = (userId?: string) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 캐시 변수: 재고 변경 전후를 확인하기 위해 사용
  const prevInventoryRef = useRef<string[]>([]);
  const lastFetchTimeRef = useRef<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시

  const loadRecipes = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // 캐시 확인: 5분 이내에 가져온 데이터면 재사용
    const now = Date.now();
    if (lastFetchTimeRef.current && (now - lastFetchTimeRef.current) < CACHE_DURATION) {
      console.log('레시피 캐시 사용');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 사용자 재고 가져오기
      const inventory = await loadActiveInventory(userId);

      // 재고 변경 확인 (정렬 후 비교하여 순서에 무관하게)
      const currentIngredients = inventory.map(item => item.name).sort();
      const ingredientsChanged = JSON.stringify(prevInventoryRef.current) !== JSON.stringify(currentIngredients);

      // 재고가 변경되지 않았고 캐시가 있으면 재사용
      if (!ingredientsChanged && recipes.length > 0) {
        console.log('재고 변경 없음 - 캐시 재사용');
        setLoading(false);
        return;
      }

      // 정렬된 재료 목록을 ref에 저장
      prevInventoryRef.current = currentIngredients;

      // 재고가 없으면 API 호출하지 않음
      if (currentIngredients.length === 0) {
        setRecipes([]);
        setLoading(false);
        return;
      }

      console.log('레시피 API 호출 - 재고 변경 감지');

      // 재료 기반 레시피 추천 가져오기
      let recommendedRecipes = await fetchRecommendRecipes(currentIngredients);

      // 최신순 정렬 (created_at 기준 내림차순)
      recommendedRecipes.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setRecipes(recommendedRecipes);
      lastFetchTimeRef.current = now;
    } catch (err: any) {
      setError(err.message || '레시피를 불러오는데 실패했습니다');
      console.error('레시피 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [userId]);

  return {
    recipes,
    loading,
    error,
    refetch: loadRecipes,
    generateNewRecipe: async () => {
      if (!userId) return;

      try {
        setLoading(true);
        // 1. 최신 재고 가져오기
        const inventory = await loadActiveInventory(userId);
        const currentIngredients = inventory.map(item => item.name);

        if (currentIngredients.length === 0) {
          throw new Error('재고가 없어 레시피를 생성할 수 없습니다.');
        }

        console.log('사용자 요청으로 새 레시피 생성 시작...');

        // 2. Gemini API 호출
        const newRecipes = await fetchGeneratedRecipe(currentIngredients);

        if (newRecipes.length === 0) {
          throw new Error('새로운 레시피를 생성하지 못했습니다.');
        }

        // 3. 기존 레시피 목록의 최상단에 추가
        setRecipes(prev => [...newRecipes, ...prev]);

        return newRecipes;
      } catch (err: any) {
        console.error('레시피 생성 실패:', err);
        setError(err.message || '레시피 생성 중 오류가 발생했습니다.');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };
};

export const useRecipeDetail = (menuName?: string) => {
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecipeDetail = async () => {
    if (!menuName) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const recipeDetail = await fetchRecipeDetail(menuName);
      setRecipe(recipeDetail);
    } catch (err: any) {
      setError(err.message || '레시피 상세 정보를 불러오는데 실패했습니다');
      console.error('레시피 상세 로드 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipeDetail();
  }, [menuName]);

  return {
    recipe,
    loading,
    error,
    refetch: loadRecipeDetail,
  };
};

export const completeRecipe = async (recipe: any, userId: string) => {
  try {
    // 레시피에 사용된 재료 추출
    const ingredientsUsed = recipe.recipe_data?.ingredients?.map((ingredient: any) => ({
      name: ingredient.name,
      quantity_used: 1, // 실제 사용 수량은 후속 개선에서 반영 가능
    })) || [];

    const payload: any = {
      recipe_id: recipe.id,
      user_id: userId,
      ingredients_used: ingredientsUsed,
    };

    // ID가 없는 경우 (AI 생성 레시피) 데이터 포함
    if (!recipe.id) {
      payload.menu_name = recipe.menu_name;
      payload.recipe_data = recipe.recipe_data;
    }

    const result = await postCompleteRecipe(payload);

    // 성공적으로 처리됨
    return result;
  } catch (error) {
    console.error('레시피 완료 처리 오류:', error);
    throw error;
  }
};