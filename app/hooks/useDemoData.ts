import { useMemo } from 'react'

// 데모용 재고 항목 인터페이스 정의
export interface DemoInventoryItem {
  id: number
  name: string
  expiry_date: string
  category_name_kr: string
  d_day: string
  storage_location: '냉장' | '냉동' | '실온'
  is_highlight?: boolean // 하이라이트 표시 여부 (스토리텔링용)
  story_group?: string // 스토리 그룹 (예: 김치찌개 세트)
}

// 데모 데이터를 제공하는 훅 - 사용자가 로그인하지 않은 상태에서 앱의 기능을 미리 체험할 수 있도록 함
export const useDemoData = () => {
  // 데모 재고 데이터 - 스토리텔링 기반으로 구성 (김치찌개 세트, 아침 식사 세트 등)
  const demoInventory: DemoInventoryItem[] = useMemo(() => [
    {
      id: 1,
      name: "김치 500g",
      expiry_date: "2025-11-20",
      category_name_kr: "김치/젓갈",
      d_day: "D-3",
      storage_location: "냉장",
      is_highlight: true,
      story_group: "김치찌개 세트"
    },
    {
      id: 2,
      name: "돼지고기 (목살) 300g",
      expiry_date: "2025-11-19",
      category_name_kr: "축산물",
      d_day: "D-2",
      storage_location: "냉장",
      story_group: "김치찌개 세트"
    },
    {
      id: 3,
      name: "두부 1모",
      expiry_date: "2025-11-21",
      category_name_kr: "콩/두부",
      d_day: "D-4",
      storage_location: "냉장",
      story_group: "김치찌개 세트"
    },
    {
      id: 4,
      name: "들기름 500ml",
      expiry_date: "2025-12-15",
      category_name_kr: "기름/조미료",
      d_day: "D-28",
      storage_location: "실온",
      story_group: "김치찌개 세트"
    },
    {
      id: 5,
      name: "D-1 우유 1L",
      expiry_date: "2025-11-18",
      category_name_kr: "유제품",
      d_day: "D-1",
      storage_location: "냉장",
      story_group: "아침 식사 세트"
    },
    {
      id: 6,
      name: "시리얼 (콘치즈) 350g",
      expiry_date: "2025-11-25",
      category_name_kr: "곡류",
      d_day: "D-8",
      storage_location: "실온",
      story_group: "아침 식사 세트"
    },
    {
      id: 7,
      name: "삼겹살 400g",
      expiry_date: "2025-11-19",
      category_name_kr: "축산물",
      d_day: "D-2",
      storage_location: "냉장",
      story_group: "삼겹살 파티 세트"
    },
    {
      id: 8,
      name: "상추 1단",
      expiry_date: "2025-11-20",
      category_name_kr: "채소",
      d_day: "D-3",
      storage_location: "냉장",
      story_group: "삼겹살 파티 세트"
    },
    {
      id: 9,
      name: "쌈장 200g",
      expiry_date: "2025-12-01",
      category_name_kr: "김치/젓갈",
      d_day: "D-14",
      storage_location: "냉장",
      story_group: "삼겹살 파티 세트"
    }
  ], [])

  // 데모 모드 통계 계산
  const stats = useMemo(() => {
    const refrigerated = demoInventory.filter(item => item.storage_location === '냉장').length
    const frozen = demoInventory.filter(item => item.storage_location === '냉동').length
    const room_temp = demoInventory.filter(item => item.storage_location === '실온').length
    const expiring = demoInventory.filter(item => {
      const days = parseInt(item.d_day.replace('D-', ''))
      return days <= 7 && days > 0
    }).length

    return { refrigerated, frozen, room_temp, expiring }
  }, [demoInventory])

  // 스토리 그룹 목록 반환
  const storyGroups = useMemo(() => {
    const groups = [...new Set(demoInventory.map(item => item.story_group).filter(Boolean) as string[])];
    return groups;
  }, [demoInventory]);

  return { demoInventory, stats, storyGroups }
}