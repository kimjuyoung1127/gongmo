import { useMemo } from 'react'

// 데모용 재고 항목 인터페이스 정의
export interface DemoInventoryItem {
  id: number
  name: string
  expiry_date: string
  category_name_kr: string
  d_day: string
  storage_location: '냉장' | '냉동' | '실온'
}

// 데모 데이터를 제공하는 훅 - 사용자가 로그인하지 않은 상태에서 앱의 기능을 미리 체험할 수 있도록 함
export const useDemoData = () => {
  // 데모 재고 데이터
  const demoInventory: DemoInventoryItem[] = useMemo(() => [
    {
      id: 1,
      name: "신선한 계란 30구",
      expiry_date: "2025-11-20",
      category_name_kr: "계란류",
      d_day: "D-3",
      storage_location: "냉장"
    },
    {
      id: 2,
      name: "서울우유 1L",
      expiry_date: "2025-11-22",
      category_name_kr: "유제품",
      d_day: "D-5",
      storage_location: "냉장"
    },
    {
      id: 3,
      name: "빙그레 바나나우유",
      expiry_date: "2025-11-21",
      category_name_kr: "유제품",
      d_day: "D-4",
      storage_location: "냉장"
    },
    {
      id: 4,
      name: "동원 참치캔",
      expiry_date: "2025-12-15",
      category_name_kr: "수산물",
      d_day: "D-28",
      storage_location: "실온"
    },
    {
      id: 5,
      name: "베지밀 귀리",
      expiry_date: "2025-11-25",
      category_name_kr: "음료",
      d_day: "D-8",
      storage_location: "실온"
    },
    {
      id: 6,
      name: "하나노래",
      expiry_date: "2025-11-19",
      category_name_kr: "채소",
      d_day: "D-2",
      storage_location: "냉장"
    },
    {
      id: 7,
      name: "오뚜기 옥수수통조림",
      expiry_date: "2025-12-01",
      category_name_kr: "농산물",
      d_day: "D-14",
      storage_location: "실온"
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

  return { demoInventory, stats }
}