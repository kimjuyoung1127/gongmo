
-----

### 🎯 1. 핵심 개선점: '카테고리 매핑' 로직 구체화

현재 계획은 "상품명"을 가져오는 데 중점을 두지만, `weekplan.md`의 목표는 "상품명 **및 카테고리**"를 반환하는 것입니다.

  * **문제:** '식품안전나라'가 반환하는 '유가공품'이나 '과자'라는 텍스트를, 우리 앱 프론트엔드나 `inventory` 테이블이 직접 사용할 수 없습니다.
  * **해결:** `barcode_lookup.py` 유틸리티 파일은 외부 API에서 받은 '제품 유형' 텍스트를 우리 **내부 `categories.csv` 기준의 `category_id`로 변환**하는 "매핑(mapping)" 로직을 반드시 포함해야 합니다.

**개선된 `backend/utils/barcode_lookup.py` 계획:**

1.  `_map_external_category_to_internal(external_category_name: str) -> dict | None:`
      * 이 내부 헬퍼 함수를 새로 만듭니다.
      * (최초 1회) `categories.csv` 파일을 읽어 매핑 규칙(예: `{"과자": 30, "유제품": 1, ...}`)을 메모리에 로드합니다.
      * `external_category_name`을 기반으로 `category_id`와 `category_name_kr`을 찾아 `{"id": 30, "name": "과자/스낵"}` 형태로 반환합니다.
      * 매핑되는 항목이 없으면 `None`을 반환합니다.
2.  `get_product_info_...` 함수 수정:
      * 외부 API에서 '상품명(PRDT\_NM)'과 \*\*'제품 유형(PRDLST\_NM)'\*\*을 함께 추출합니다.
      * `category_info = _map_external_category_to_internal(제품_유형)`을 호출합니다.
      * **표준화된 딕셔너리:** `{ "name": "상품명", "category_id": category_info["id"], "category_name_kr": category_info["name"] }`를 반환합니다.
      * 만약 `category_info`가 `None`이라면 (매핑 실패), 제품을 찾지 못한 것과 동일하게 `None`을 반환합니다.

-----

### 🛡️ 2. 개선점: 견고한 예외 처리 (Error Handling) 추가

현재 계획은 "결과가 없으면 `None`을 반환"하는 성공/실패(Not Found) 두 가지 경우만 다룹니다. 하지만 실제로는 **API 서버 자체가 다운**되거나 **네트워크가 불안정**할 수 있습니다.

  * **문제:** `requests.get()` 호출이 타임아웃되거나 `openfoodfacts` 라이브러리가 연결에 실패하면, Flask 서버 전체가 500 오류로 멈추게 됩니다.
  * **해결:** `barcode_lookup.py`의 각 함수 내부에 `try...except` 구문을 추가해야 합니다.

**개선된 `get_product_info_...` 함수 로직 (예시):**

```python
import requests
from requests.exceptions import RequestException

def get_product_info_from_food_safety_korea(barcode):
    try:
        # API 키 및 URL 설정
        api_key = os.environ.get('FOOD_SAFETY_KOREA_API_KEY')
        url = f"https://.../api/{api_key}/.../{barcode}"
        
        # [개선점 2] 네트워크 예외 처리
        response = requests.get(url, timeout=5) # 5초 타임아웃 설정
        response.raise_for_status() # 4xx, 5xx 오류 시 예외 발생
        
        data = response.json()

        if data['C005']['total_count'] == '0':
            return None # 404: 제품 없음

        # 제품 정보 추출
        product_data = data['C005']['row'][0]
        product_name = product_data['PRDT_NM']
        external_category = product_data['PRDLST_NM']

        # [개선점 1] 카테고리 매핑
        category_info = _map_external_category_to_internal(external_category)

        if not category_info:
            return None # 404: 제품은 찾았으나 우리 DB에 매핑되는 카테고리가 없음

        return {
            "name": product_name,
            "category_id": category_info["id"],
            "category_name_kr": category_info["name"]
        }

    except RequestException as e:
        # [개선점 2] 네트워크/API 오류 발생 시
        print(f"Food Safety Korea API Error: {e}")
        return {"error": "api_failed"} # None 대신 오류 상태 반환
    except Exception as e:
        # 기타 파싱 오류 등
        print(f"Barcode lookup logic error: {e}")
        return {"error": "internal_error"}
```

-----

### 📦 요약: 개선된 최종 플랜

이 두 가지 개선점을 반영하면, `app.py`는 \*\*3가지 상태(성공, 찾을 수 없음, 서버 오류)\*\*를 명확히 구분하여 앱(프론트엔드)에 훨씬 더 친절한 응답을 보낼 수 있습니다.

**`backend/api/app.py` 로직:**

1.  `result_korea = get_product_info_from_food_safety_korea(barcode)` 호출.
2.  **if `result_korea`가 딕셔너리이고 'error' 키가 없다면:**
      * `return jsonify(result_korea), 200` (성공)
3.  **if `result_korea`가 `None`이거나:** (즉, 한국 API에서 못 찾음)
      * `result_off = get_product_info_from_open_food_facts(barcode)` 호출.
      * **if `result_off`가 딕셔너리이고 'error' 키가 없다면:**
          * `return jsonify(result_off), 200` (성공)
      * **else if `result_off`가 `None`:**
          * `return jsonify({"status": "not_found", "message": "..."}), 404` (두 곳 모두에서 못 찾음)
      * **else (즉, `result_off`에 'error' 키가 있다면):**
          * `return jsonify({"status": "error", "message": "Open Food Facts API 오류"}), 503` (외부 서비스 장애)
4.  **else (즉, `result_korea`에 'error' 키가 있다면):**
      * `return jsonify({"status": "error", "message": "식품안전나라 API 오류"}), 503` (외부 서비스 장애)



## ✅ 목표: 바코드로 상품 정보를 가져오고, 우리 앱에서 쓸 수 있게 정리하기

### 📌 우리가 원하는 결과
바코드를 입력하면 이런 딕셔너리를 반환하고 싶어요:

```json
{
  "name": "서울우유 흰우유 1L",
  "category_id": 1,
  "category_name_kr": "유제품"
}
```

---

## 🧠 핵심 개선 1: **카테고리 매핑 로직 추가**

### 문제
- 외부 API는 `"유가공품"` 같은 **텍스트**만 줘요.
- 근데 우리 앱은 숫자 ID (`category_id`)와 **표준화된 이름**이 필요해요.

### 해결 방법
- `categories.csv` 파일을 읽어서, 외부 텍스트 → 내부 ID로 바꾸는 **매핑 함수**를 만들어요.

### 예시 함수
```python
def _map_external_category_to_internal(external_category_name):
    # 예: {"유가공품": {"id": 1, "name": "유제품"}, ...}
    if not hasattr(_map_external_category_to_internal, "category_map"):
        with open("categories.csv", encoding="utf-8") as f:
            # CSV 읽고 딕셔너리로 저장
            _map_external_category_to_internal.category_map = {...}

    return _map_external_category_to_internal.category_map.get(external_category_name)
```

---

## 🛡️ 핵심 개선 2: **예외 처리 추가**

### 문제
- 외부 API가 죽거나, 인터넷이 끊기면 서버가 **500 에러**로 터져요.

### 해결 방법
- `try...except`로 감싸서, 오류가 나도 **친절한 메시지**를 주도록 해요.

### 예시 코드
```python
try:
    response = requests.get(url, timeout=5)
    response.raise_for_status()
    ...
except RequestException:
    return {"error": "api_failed"}
except Exception:
    return {"error": "internal_error"}
```

---

## 🧩 최종 구조 요약

### `barcode_lookup.py` (utils)
- 외부 API에서 상품명 + 제품유형 가져오기
- 제품유형 → `category_id`로 매핑
- 예외 발생 시 `"error"` 포함된 딕셔너리 반환

### `app.py` (라우팅)
- 3가지 경우로 나눠서 응답:
  1. ✅ 성공 → `200 OK`
  2. ❌ 못 찾음 → `404 Not Found`
  3. ⚠️ API 오류 → `503 Service Unavailable`

---

## 🎯 결론

이제 이 구조로 구현하면:
- **프론트엔드가 처리하기 쉬운 응답**을 받고,
- **API 장애에도 서버가 멈추지 않고**, 
- **카테고리도 자동으로 매핑**되니, 훨씬 견고하고 확장 가능한 시스템이 됩니다.

---
