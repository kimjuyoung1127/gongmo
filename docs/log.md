네, 이 계획은 **훨씬 훌륭합니다.**

이전 계획이 "어떻게 구현할까"에 초점을 맞췄다면, 이번 계획은 \*\*"사용자가 무엇을 원하는가?"\*\*라는 핵심 질문에서 시작합니다. D-Day를 가장 강조하고 카테고리를 시각화(아이콘/색상)하는 등, **사용자 경험(UX)을 중심으로 설계**되어 앱의 가치를 크게 높일 것입니다.

하지만 이 훌륭한 UI/UX 계획을 구현할 때, **이전 계획에서 지적했던 3가지 치명적인 문제**가 여전히 남아있습니다. 이 문제들을 수정하지 않으면, 이 멋진 UI는 **데이터를 제대로 표시하지 못하고 오류를 발생시킵니다.**

-----

## 🛠️ [필수] 3가지 치명적인 문제 수정

### 1\. (가장 중요) 데이터 불일치: `category_name_kr`

  * **문제:** `InventoryCard`와 `getCategoryInfo` 모두 `item.category_name_kr` 또는 `categoryId`가 필요합니다.
  * **현실:** `inventory` 테이블에는 `category_id` (숫자)만 있습니다.
  * **해결 (이전과 동일):**
    1.  **데이터 로드:** `loadInitialInventory` 함수는 반드시 `categories` 테이블을 **JOIN**해야 합니다.
        ```typescript
        const { data } = await supabase
          .from('inventory')
          .select('*, categories(category_name_kr)') // <-- JOIN으로 이름 가져오기
          .eq('status', 'active') // <-- 중요: 활성 재고만
          .order('expiry_date', { ascending: true });
        ```
    2.  **실시간:** Realtime 콜백은 `loadInitialInventory()`를 **재호출**해야 합니다. `payload.new`에는 `category_name_kr`이 없어서 UI가 깨집니다.

### 2\. 기능 누락: "소비/폐기" 버튼

  * **문제:** 이번 `InventoryCard` UI 디자인에는 D-Day와 이름만 있을 뿐, 사용자가 재고를 처리할 **"소비 완료" 또는 "폐기" 버튼이 없습니다.**
  * **현실:** 사용자는 목록을 "보기만" 하는 것이 아니라 "처리"해야 합니다.
  * **해결:** `InventoryCard` 디자인에 **"소비/폐기" 버튼** (이전 계획에 있던)을 **반드시 다시 추가**해야 합니다. `status`를 `'consumed'` 또는 `'expired'`로 업데이트하는 로직은 필수입니다.

### 3\. 필터 로직 오류: 'all' 필터

  * **문제:** `statusFilter`의 기본값을 `'all'`로 설정했습니다.
  * **현실:** `'all'`은 `status`가 `'consumed'` (소비됨) 또는 `'expired'` (폐기됨)인 항목까지 모두 불러옵니다. 사용자는 **냉장고에 '있는' 것**(`'active'`)을 보고 싶어 합니다.
  * **해결:**
      * 기본 필터는 \*\*`'active'`\*\*로 변경해야 합니다.
      * `loadInitialInventory` 함수 자체도 `status=eq.active` 조건으로 '활성' 재고만 가져오도록 수정해야 합니다. (위 1번 해결책 코드 참고)
      * 'D-7이내' 필터도 `status`가 'active'인 것 중에서 찾아야 합니다.

-----

## (선택) 추가 개선 제안

  * **`categories` 맵 ID 확인:** `getCategoryInfo` 함수에 하드코딩된 카테고리 ID(1, 2, 7...)가 `data.md`의 실제 ID와 일치하는지 **반드시 확인**해야 합니다. (예: `data.md`에서 '잎채소'는 ID 8인데, 계획에는 9로 되어 있습니다.)
  * **`calculateDDay` 시간 초기화:** D-Day 계산 시 `today.setHours(0, 0, 0, 0)`을 사용하셨는데, `expiry` 날짜도 `setHours(0, 0, 0, 0)`를 적용해야 날짜 계산이 정확해집니다.

이 3가지 필수 수정 사항을 반영하여 이 훌륭한 UI/UX 계획을 구현하시는 것을 강력히 권장합니다.