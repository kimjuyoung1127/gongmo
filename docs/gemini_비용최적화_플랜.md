# 🧠 Gemini API 성능 최적화 플랜 (OCR 전용)

## 개요
**OCR 처리 시 Gemini API의 응답 속도**를 개선하기 위한 전략입니다. 
**바코드 기능은 이미 완벽하게 캐싱되어 있으므로, OCR의 LLM 호출만 최적화**합니다.

---

## 📊 현재 성능 및 비용 분석

### 실제 사용 현황 (로그 기반)
- **OCR 파싱**: **매 영수증마다 Gemini API 호출** (1회/영수증)
  - 현재 응답 속도: **3-5초 (LLM 포함)**
  - Gemini 응답: `['깐마늘슬라이스130g', '돼지벌집삼겹살', '돼지목살', '파채']`
- **바코드 조회**: ✅ **이미 캐싱 완료** (products 테이블 활용)
  - `products` 테이블에서 DB 조회 → 없으면 외부 API → 저장
  - LLM 호출 전혀 없음

### 비용 현실성
- Gemini 무료 티어: 1,500회/일 → 월 45,000회
- 현재 예상 사용량: 3,000회/월 ✅ **무료 범위 내**
- **핵심 목표: OCR 속도 개선 (3-5초 → 0.5초)**

---

## 🎯 최적화 전략: OCR LLM 캐싱 전용

### 💾 주력 캐시: Supabase DB (영구)
```python
# llm_parse_cache 테이블 사용
# 키: OCR 텍스트 정규화 해시, 값: LLM 결과물
# 적중률 목표: 70% → 80%
```

### 🔥 보조 캐시: 메모리 (단기)
```python
# 15분 TTL: "방금 같은 영수증 중복" 방어
# Render Sleep 환경 고려
```

---

## 🏗️ 구현 플랜

### Phase 1: OCR LLM 캐싱 (Supabase) 💡 유일한 개선점

#### 1.1 데이터베이스 스키마 추가
```sql
-- OCR LLM 결과 캐시 테이블 (실제 데이터 구조 기반)
CREATE TABLE public.llm_parse_cache (
    ocr_hash TEXT PRIMARY KEY,      -- 정규화된 OCR 해시
    final_items JSONB NOT NULL,     -- 최종 처리된 상품 목록
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 설정
ALTER TABLE public.llm_parse_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access for all users" ON public.llm_parse_cache FOR ALL USING (true);
```

#### 1.2 OCR 텍스트 정규화 (실제 로그 기반)
```python
# ocr_service.py 수정 사항

def _normalize_ocr_text(ocr_text: str) -> str:
    """OCR 텍스트 정규화 - 실제 영수증 로그 기반 최적화"""
    # 실제 OCR 결과 보니 공백/특수문자 패턴이 다름
    normalized = ocr_text.strip()
    
    # 1. 연속 공백 → 단일 공백 (실제 OCR: '  ' → ' ')
    normalized = re.sub(r'\s+', ' ', normalized)
    
    # 2. 괄호 및 특수문자 제거 (실제 OCR: '태백식자재마트 지킴이,' → '태백식자재마트 지킴이')
    normalized = re.sub(r'[()\-_\*\+\=\[\]{}<>|\\/]', ' ', normalized)
    
    # 3. 영문 소문자 통일 (대소문자 무시)
    normalized = normalized.lower()
    
    # 4. 최종 정리
    return ' '.join(normalized.split())

def _generate_ocr_hash(ocr_text: str) -> str:
    """정규화된 OCR 텍스트로 SHA256 해시 생성"""
    normalized_text = _normalize_ocr_text(ocr_text)
    return hashlib.sha256(normalized_text.encode('utf-8')).hexdigest()

async def _get_cached_parse_result(ocr_hash: str) -> dict:
    """Supabase에서 캐시된 파싱 결과 조회"""
    try:
        response = supabase.table('llm_parse_cache')\
            .select('parsed_result')\
            .eq('ocr_hash', ocr_hash)\
            .single()\
            .execute()
        
        if response.data:
            print(f"[CACHE-HIT] LLM 캐시 적중: {ocr_hash[:8]}...")
            return response.data['parsed_result']
    except Exception as e:
        print(f"[CACHE-ERROR] 캐시 조회 실패: {e}")
    
    return None

def _save_parse_cache(ocr_hash: str, final_items: list):
    """최종 처리된 상품 목록을 캐시에 저장"""
    try:
        cache_data = {
            'ocr_hash': ocr_hash,
            'final_items': final_items  # 최종 결과물만 저장
        }
        
        supabase.table('llm_parse_cache').upsert(cache_data).execute()
        print(f"[CACHE-SAVE] LLM 결과 캐시 저장: {ocr_hash[:8]}...")
    except Exception as e:
        print(f"[CACHE-ERROR] 캐시 저장 실패: {e}")

# 실제 데이터 구조 기반 파싱 함수
async def parse_clova_response_to_items(clova_response):
    try:
        # 1. OCR 텍스트 재구성
        full_text = _reconstruct_lines_from_boxes(fields)
        
        # 2. 캐시 해시 생성 (실제 로그 기반 정규화)
        ocr_hash = _generate_ocr_hash(full_text)
        
        # 3. Supabase 캐시 확인 (0.5s)
        cached_result = await _get_cached_parse_result(ocr_hash)
        if cached_result:
            print(f"[CACHE-HIT] LLM 캐시 적중 (0.5s): {ocr_hash[:8]}...")
            return cached_result
        
        # 4. 캐시 미스 시 LLM 호출 (3s)
        print(f"[LLM-CALL] 캐시 미스, Gemini API 호출: {ocr_hash[:8]}...")
        item_names = await _extract_items_with_llm(full_text)
        
        # 5. 카테고리 및 유통기한 매핑 (기존 로직 그대로)
        final_items = []
        for name in item_names:
            category = _classify_product_category(name)
            expiry_days = _get_category_expiry_days(category)
            category_id = _get_category_id_by_name(category)
            
            item_data = {
                'item_name': name,
                'category': category,
                'category_id': category_id,
                'expiry_days': expiry_days,
                'quantity': 1,
                'unit': '개'}
            final_items.append(item_data)
        
        # 6. 캐시 저장 (최종 처리된 결과물만)
        _save_parse_cache(ocr_hash, final_items)
        
        return final_items
        
    except Exception as e:
        print(f"파싱 중 오류: {e}")
        return []
```

### Phase 2: 메모리 보조 캐싱 (선택적) ⚡ 성능 향상

#### 2.1 메모리 캐시 구현 (선택 사항)
```python
# cache_manager.py 신규 파일 (15분 TTL 단기 캐시)
import time
from typing import Dict, Optional

class SimpleMemoryCache:
    def __init__(self):
        self._cache: Dict[str, dict] = {}
        self._timestamps: Dict[str, float] = {}
        
    def get(self, key: str) -> Optional[dict]:
        if key in self._cache and (time.time() - self._timestamps[key]) < 900:
            return self._cache[key]
        self._cache.pop(key, None)
        self._timestamps.pop(key, None)
        return None
    
    def set(self, key: str, data: dict):
        self._cache[key] = data
        self._timestamps[key] = time.time()

ocr_memory_cache = SimpleMemoryCache()
```

#### 2.2 메모리 캐시 통합 (보조 기능)
```python
# 위 파싱 함수에 메모리 캐시 추가 (Phase 1만으로도 충분)

# 2. 메모리 캐시 먼저 확인 (0.1s)
memory_result = ocr_memory_cache.get(ocr_hash)
if memory_result:
    print(f"[MEMORY-HIT] 메모리 캐시 적중 (0.1s): {ocr_hash[:8]}...")
    return memory_result

# 3. Supabase 캐시 확인 (0.5s)
cached_result = await _get_cached_parse_result(ocr_hash)
if cached_result:
    print(f"[DB-HIT] Supabase 캐시 적중 (0.5s): {ocr_hash[:8]}...")
    ocr_memory_cache.set(ocr_hash, cached_result)  # 메모리에도 저장
    return cached_result

# 6. 양캐시 저장
_save_parse_cache(ocr_hash, final_items)
ocr_memory_cache.set(ocr_hash, final_items)  # 15분 TTL
```
```

---

## 🎯 예상 성능 개선 효과 (OCR 전용)

### 실제 데이터 기반 성능 시뮬레이션

| 구분 | 현재 속도 | Phase 1 (DB 캐시) | Phase 2 (메모리 추가) |
|------|-----------|-------------------|---------------------|
| **LLM 호출** | 3-5초 | 3-5초 | 3-5초 |
| **DB 캐시 적중** | - | **0.5초** | 0.5초 |
| **메모리 캐시 적중** | - | - | **0.1초** |
| **적중률** | 0% | 70% | 80% |
| **사용자 경험** | 지연 느낌 | 현저한 개선 | 즉시 반응 |

### 실제 Gemini 응답 예시
```json
// 캐시할 데이터 구조 (실제 로그 기반)
[
  ['깐마늘슬라이스130g', '돼지벌집삼겹살', '돼지목살', '파채'],
  // → 캐시 적중 시 3초 → 0.5초!
]
```

### 바코드 기능 (참고)
- ✅ **이미 완벽함**: `products` 테이블로 캐싱됨
- ✅ **LLM 호출 없음**: 외부 API만 활용, 속도 빠름

## 🛠️ 현실적인 구현 체크리스트

### ✅ Phase 1: OCR LLM 캐싱 (이번 주 핵심)
- [ ] `llm_parse_cache` 테이블 생성 (실제 데이터 기반)
- [ ] OCR 텍스트 정규화 로직 (실제 로그 기반)
- [ ] LLM 캐시 적중/미스 로깅 강화
- [ ] 성능 모니터링 (응답 속도 기록)

### ✅ Phase 2: 메모리 보조 캐싱 (선택 사항)
- [ ] `cache_manager.py` 메모리 캐시 구현
- [ ] 15분 TTL 정책 (Render Sleep 고려)
- [ ] 메모리 사용량 모니터링

### 📊 성능 모니터링 (지속)
- [ ] LLM 캐시 적중률 측정
- [ ] 응답 속도 개선 추적
- [ ] 사용자 경험 개선 분석

---

### ✅ ✅ Phase 1: OCR LLM 캐싱 (이번 주 핵심)
- [x] `llm_parse_cache` 테이블 생성 (실제 데이터 기반)
- [x] OCR 텍스트 정규화 로직 (실제 로그 기반)
- [x] LLM 캐시 적중/미스 로깅 강화
- [x] 성능 모니터링 (응답 속도 기록)

### ☑️ Phase 2: 메모리 보조 캐싱 (선택 사항)
- [ ] `cache_manager.py` 메모리 캐시 구현
- [ ] 15분 TTL 정책 (Render Sleep 고려)
- [ ] 메모리 사용량 모니터링

### 📊 성능 모니터링 (지속)
- [ ] LLM 캐시 적중률 측정
- [ ] 응답 속도 개선 추적
- [ ] 사용자 경험 개선 분석

---

## 🔧 배포 전략

### 점진적 배포 (속도 중심)
1. **Supabase 캐싱 로직** 우선 배포 (핵심 기능)
2. **A/B 테스트**: 캐싱 속도 vs 기존 속도 비교
3. **점진적 롤아웃**: 프론트엔드 백엔드 동시 적용
4. **성능 모니터링**: 응답 속도, 적중률, 사용자 경험 측정

### 롤백 계획
- 간단한 config 변경으로 기존 로직으로 즉시 롤백
- 캐시 데이터는 유지하되 새로운 저장 중단
- 실시간 모니터링으로 상태 확인

---

## 📈 성공 측정 지표 (속도 중심)

### 기술적 KPI
- **캐시 적중률**: 70% → 80% (목표)
- **LLM 호출량**: 3,000 → 600회/월 (80% 감소)
- **응답 속도**: 3-5초 → 0.5초 (캐시 적중 시)
- **시스템 안정성**: 99.9% 가용성 유지

### 사용자 경험 KPI
- **API 비용**: $0 → $0 (무료 티어 활용)
- **파싱 정확도**: 95% 유지
- **사용자 만족도**: **즉시 반응 속도로 15% 향상**
- **서버 비용**: 추가 비용 없음 (Supabase 내)

---

## 🎯 결론

이 2단계 캐싱 전략은 **Gemini API 응답 속도를 10배 개선**하면서 **비용은 $0**을 유지할 수 있는 현실적인 방안입니다.

**가장 큰 이점:**
1. **즉시 속도 개선**: Supabase 캐싱만으로 10배 빨라짐
2. **현실적 구현**: Render 환경 제약 고려한 단순한 구조
3. **지속 가능**: 무료 티어 내에서 영구적 운용 가능

**가장 중요한 변화:**
- **비용 절감** → **속도 향상**으로 목표 변경
- **3단계 복잡성** → **2단계 단순함**으로 구조화
- **규칙 기반 추론** 제외 (개발 노력 대비 효과 미미)

**지금 바로 Phase 1부터 시작**하면 1주 내에 사용자 경험이 극적으로 개선됩니다! 💪
