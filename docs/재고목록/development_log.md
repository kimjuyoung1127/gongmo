# 개발 로그

## 2025-11-13 (수요일)

### ✅ 1. 실시간 재고 목록 표시 구현 (Phase 1 완료)

#### 목적
- 사용자가 추가한 재고를 즉시 확인할 수 있도록 실시간 목록 구현
- D-Day 기반 시각화로 유통기한 관리 용이
- 바코드/영수증으로 추가한 품목의 통합 관리

#### 구현 내용
1. **데이터 관리**
   - `loadActiveInventory`: categories 테이블 JOIN으로 활성 재고 로드
   - `updateInventoryStatus`: 소비/폐기 상태 변경
   - `subscribeToInventoryChanges`: 사용자별 Realtime 구독

2. **유틸리티 함수**
   - `calculateDDay`: 기본 D-Day 계산
   - `calculateDdayStable`: 안정적인 날짜 계산 (setHours 오류 방지)
   - `CATEGORIES`: 32개 카테고리 아이콘/색상 정의

3. **UI 컴포넌트**
   - `InventoryCard`: D-Day 중심 시각화
   - `dDayText`: D-3이내일 때 긴급성 표시
   - `categoryIcon`: 카테고리별 아이콘/색상 구분

4. **메인 화면**
   - 필터링 (전체/D-7이내)
   - D-Day 기반 정렬 (가장 가까운 순)
   - 실시간 업데이트 (재고 추가/삭제 즉시 반영)

#### 기술적 해결 과정
1. **useEffect 오류 해결**
   - async 함수를 내부에서 호출하도록 분리
   - Hooks 호출 순서 일치 유지

2. **setHours 체이닝 오류 해결**
   - `new Date(년, 월, 일)`로 날짜 생성
   - `calculateDdayStable` 함수로 안정성 확보

3. **데이터 JOIN 구현**
   - inventory 테이블과 categories 테이블 JOIN
   - `category_name_kr` 필드로 카테고리 표시

#### 테스트 결과
- **실시간 동작**: 바코드 스캔 시 목록 즉시 업데이트 ✅
- **D-Day 정렬**: 가장 임박한 순으로 정렬 ✅
- **상태 변경**: 소비/폐기 버튼 정상 동작 ✅

### 📋 관련 파일 생성/수정 내역

1. **새로 생성된 파일**
   - `app/lib/utils.ts`: D-Day 계산 함수
   - `app/lib/categories.ts`: 카테고리 상수 정의
   - `app/components/InventoryCard.tsx`: 재고 카드 컴포넌트

2. **수정된 파일**
   - `app/lib/supabase.ts`: 데이터 로드/업데이트 함수 추가
   - `app/app/(tabs)/index.tsx`: 전체 재고 목록 화면

3. **문서 업데이트**
   - `docs/progress.md`: 완료 항목 체크
   - `docs/frontend_plan.md`: Phase 2 완료 표시

### 🎯 예상 효과
- 사용자 경험: 재고 현황 즉시 파악 가능
- D-Day 관리: 유통기한 임박 품목 시각적 경고
- 실시간성: 모든 재고 변화 즉시 반영

### 📋 실제 사용자 경험
```
🔴 D-2   삼각김밥
  🥛 유탕면 | 수량: 2 | 유통기한: 2025-11-15
  [소비 완료] [폐기]

🟡 D-5   서울우유  
  🥛 유제품(신선) | 수량: 1 | 유통기한: 2025-11-18
  [소비 완료] [폐기]
```

### 📱 사용자 경험 개선
```
🔴 D-2   삼각김밥
  🥛 유탕면 | 수량: 2 | 유통기한: 2025-11-15
  [소비 완료] [폐기]

🟡 D-5   서울우유  
  🥛 유제품(신선) | 수량: 1 | 유통기한: 2025-11-18
  [소비 완료] [폐기]
```
