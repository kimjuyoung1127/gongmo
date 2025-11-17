네, 정확한 지적입니다.

받으신 API 응답(`POG_DAYCNT`: `'병,캔: 24개월, PET: 9개월'`)은 \*\*'유통기한 날짜(YYYY-MM-DD)'\*\*가 아니라 \*\*'제조일로부터 얼마나 지속되는지(기간)'\*\*를 나타냅니다.

API에는 '제조일자' 정보가 없기 때문에, 정확히 병에 적힌 날짜(예: `2025-12-31`)를 기계적으로 알아내는 것은 **불가능**합니다.

하지만 사용자에게 매번 날짜를 입력하게 하는 것은 UX 측면에서 좋지 않습니다. 이를 해결하기 위해 **"스마트 추정(Smart Estimation)"** 전략을 제안합니다.

-----

## 🚀 해결 전략: "오늘 샀으니까, 오늘부터 N개월 뒤"

사용자가 바코드를 찍는 시점은 대개 \*\*'물건을 구매한 직후'\*\*이거나 \*\*'냉장고에 넣을 때'\*\*입니다.
따라서 \*\*[스캔일(오늘) + 유통기간]\*\*으로 계산하여 **"추천 날짜"를 미리 채워주는(Pre-fill)** 방식이 최선입니다.

### 1\. 데이터 파싱 로직 (Backend)

`POG_DAYCNT` 문자열에서 숫자를 추출하여 가장 보수적인(짧은) 기간을 선택합니다.

**로직 예시:**

  * 입력: `'병,캔: 24개월, PET: 9개월'`
  * 분석: `24개월`, `9개월` 추출
  * 선택: **`9개월`** (가장 짧은 기간을 선택하는 것이 안전함)
  * 계산: `오늘 날짜` + `9개월` = `2026-08-17` (예시)

### 2\. 구현 코드 (`barcode_lookup.py` 보완)

기존 `utils/barcode_lookup.py` 또는 `expiry_logic.py`에 아래 파싱 함수를 추가하세요.

```python
import re
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta # pip install python-dateutil 필요

def calculate_estimated_expiry(pog_text, scan_date=None):
    """
    POG_DAYCNT 텍스트('제조일로부터 24개월')를 분석하여 예상 만료일을 반환
    """
    if not scan_date:
        scan_date = datetime.now()

    # 1. 숫자와 단위(개월, 일, 년) 추출 정규식
    # 예: "24개월", "1년", "30일"
    matches = re.findall(r'(\d+)\s*(개월|년|일)', pog_text)

    if not matches:
        return None # 파싱 실패 시 None

    # 2. 모든 기간을 '일(day)' 단위로 환산하여 최소값 찾기 (안전 제일)
    min_days = float('inf')
    
    for num, unit in matches:
        value = int(num)
        if unit == '년':
            days = value * 365
        elif unit == '개월':
            days = value * 30
        else: # 일
            days = value
        
        if days < min_days:
            min_days = days

    # 3. 오늘 날짜에 더하기
    estimated_date = scan_date + timedelta(days=min_days)
    
    return estimated_date.strftime('%Y-%m-%d')

# --- 테스트 ---
# raw_text = "병,캔: 24개월, PET: 9개월"
# result = calculate_estimated_expiry(raw_text)
# print(f"추천 유통기한: {result}") 
# 결과: 오늘이 2025-11-17이라면 -> 2026-08-14 (9개월 뒤)
```

### 3\. UX 개선 시나리오 (Frontend)

사용자에게 빈칸을 보여주는 대신, 위에서 계산된 날짜를 \*\*미리 입력(Placeholder가 아닌 Value)\*\*해둡니다.

1.  **스캔 직후:** 바텀 시트가 올라옵니다.
2.  **화면 표시:**
      * 상품명: `펩시`
      * 유통기한: `2026-08-14` (추정됨 ✨)
      * *(작은 글씨)* `"제조일 기준 9개월로 계산했어요"`
3.  **사용자 행동:**
      * **Case A (맞거나 비슷함):** 그냥 `[저장]` 버튼을 누릅니다. (1-Tap)
      * **Case B (다름):** 날짜를 터치하여 달력에서 실제 날짜(`2025-12-31`)로 수정합니다.

-----

### 4\. 요약

  * **완벽한 날짜:** API로는 알 수 없습니다.
  * **최선의 UX:** \*\*"파싱 로직"\*\*을 통해 계산된 \*\*"추정 날짜"\*\*를 기본값으로 넣어주고, 사용자는 \*\*"확인(Confirm)"\*\*만 하게 만드세요.
  * **효과:** 사용자는 일일이 날짜를 타이핑하는 수고를 덜고, "이 앱 똑똑한데?"라는 인상을 받게 됩니다.

  일반음식이면어떻게해

영수증 공모전
사용자설정 Gem
**일반 음식(신선식품, 조리식품)**은 바코드 정보(POG_DAYCNT)가 없거나, API가 단순히 "식품"이라고만 알려주는 경우가 많습니다.

이 경우 **"카테고리별 권장 소비기한(Rule-based)"**을 기본값으로 적용하여 UX를 방어해야 합니다. 이미 작성하신 데이터베이스 스키마에 이 기능이 준비되어 있습니다.

🚀 해결 전략: "카테고리가 곧 유통기한이다"
schema.md 파일에 정의된 categories 테이블을 보면 default_expiry_days 컬럼이 이미 존재합니다. 이것을 활용하면 됩니다.

1. 데이터베이스 활용 (기본값 설정)
backend/data/categories_proper.csv (또는 DB)에 다음과 같이 "상식적인 소비기한"을 미리 정의해 둡니다.

카테고리 코드	카테고리명	default_expiry_days (자동계산용)
DAIRY_FRESH	우유/유제품	+7일
LEAFY_VEG	잎채소 (상추 등)	+5일
ROOT_VEG	뿌리채소 (감자)	+14일
MEAT_FRESH	생고기	+3일
TOFU	두부/콩나물	+4일
DEFAULT	기타/알수없음	+7일 (안전빵)
2. 백엔드 로직 수정 (expiry_logic.py)
API에서 POG_DAYCNT를 얻지 못했을 때, **카테고리 ID를 조회하여 기본값을 더해주는 로직(Fallback)**을 추가합니다.

Python
# backend/api/utils/expiry_logic.py

def calculate_final_expiry(pog_text, category_id, scan_date=None):
    if not scan_date:
        scan_date = datetime.now()

    # 1단계: API 정보(POG_DAYCNT)가 있으면 최우선으로 파싱
    if pog_text:
        estimated_date = calculate_estimated_expiry(pog_text, scan_date) # (이전 답변 함수)
        if estimated_date:
            return {
                "date": estimated_date,
                "source": "API_INFO", # "제조일 기준 추정"
                "message": "제조일 기준 권장 기간으로 계산했어요"
            }

    # 2단계: API 정보가 없으면 '카테고리 기본값' 사용 (Fallback)
    # DB에서 category_id에 해당하는 default_expiry_days 조회
    default_days = get_default_days_from_db(category_id) # 예: 우유 -> 7
    
    estimated_date = scan_date + timedelta(days=default_days)
    
    return {
        "date": estimated_date.strftime('%Y-%m-%d'),
        "source": "CATEGORY_RULE", # "카테고리 평균"
        "message": f"일반적인 {get_category_name(category_id)} 소비기한으로 입력했어요"
    }
3. 프론트엔드 UX (사용자 경험)
사용자에게는 빈칸이 아니라, **"AI가 제안하는 날짜"**가 채워진 상태로 보입니다.

상황: 시장에서 산 '시금치'를 찍음 (바코드 없음 / API 정보 없음).

앱 동작:

LLM/분류 모델이 '시금치' → '잎채소(LEAFY_VEG)'로 분류.

백엔드가 LEAFY_VEG의 기본값 **+5일**을 적용.

화면에 2025-11-22 (오늘+5일)이 자동 입력됨.

사용자 반응:

"오, 대충 맞네?" → [저장] 클릭 (1초 소요)

"아냐, 이건 좀 오래된 거야" → 날짜 눌러서 수정 (드문 경우)

결론: 사용자가 "2025-..." 숫자를 직접 타이핑하게 하는 최악의 경험만 막으면 됩니다. **"틀려도 좋으니 일단 그럴듯한 날짜를 채워주는 것"**이 핵심입니다.