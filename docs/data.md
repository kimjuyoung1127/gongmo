
# 🗂️ **① Category Master (표준 카테고리 테이블)**

> ✅ 정제된 영어 코드(`category_code`)
> ✅ 한글 이름(`category_name_kr`)
> ✅ 기본 유통기한(`default_expiry_days`)
> ✅ 설명 / 예시 포함
>
> 이 테이블은 `categories.csv` 혹은 Supabase의 `categories` 테이블로 바로 사용 가능합니다.

| id | category_code     | category_name_kr | default_expiry_days | description / examples                                |
| -: | ----------------- | ---------------- | ------------------: | ----------------------------------------------------- |
|  1 | dairy_fresh       | 유제품(신선)          |                   7 | Milk, yogurt, cream, fresh cheese                     |
|  2 | dairy_longlife    | 유제품(가공/롱라이프)     |                  30 | Butter, margarine, condensed milk, UHT milk           |
|  3 | cheese_soft       | 연질치즈             |                  14 | Mozzarella, ricotta, camembert                        |
|  4 | cheese_hard       | 경성치즈             |                  30 | Cheddar, parmesan, gouda                              |
|  5 | meat_fresh        | 육류(신선)           |                   3 | Beef, pork, chicken, duck                             |
|  6 | processed_meat    | 가공육              |                  14 | Ham, sausage, bacon                                   |
|  7 | eggs              | 난류               |                  30 | Egg, quail egg                                        |
|  8 | leafy_veg         | 잎채소              |                   3 | Lettuce, cabbage, spinach, kale                       |
|  9 | stem_veg          | 줄기채소             |                   3 | Green onion, leek, celery, asparagus                  |
| 10 | root_veg          | 뿌리채소(저온)         |                  21 | Potato, carrot, onion, garlic, ginger                 |
| 11 | sprout_veg        | 발아채소             |                   2 | Bean sprout, mung bean sprout                         |
| 12 | fruit_veg         | 열매채소             |                   5 | Cucumber, zucchini, tomato, paprika, bell pepper      |
| 13 | mushroom          | 버섯류              |                   5 | Oyster, enoki, shiitake, king oyster, button mushroom |
| 14 | fruit             | 과일(일반)           |                   7 | Apple, banana, grape, pear, citrus, peach             |
| 15 | berry_fruit       | 베리류              |                   3 | Strawberry, blueberry, raspberry, cherry              |
| 16 | citrus_fruit      | 감귤류              |                  14 | Orange, tangerine, grapefruit, lemon                  |
| 17 | tropical_fruit    | 열대과일             |                   5 | Mango, pineapple, kiwi, avocado                       |
| 18 | fish              | 어류(신선)           |                   2 | Mackerel, pollock, flounder, croaker, etc.            |
| 19 | shellfish         | 패류               |                   2 | Clam, oyster, mussel, scallop                         |
| 20 | cephalopod        | 연체/갑각류           |                   2 | Squid, octopus, shrimp, crab                          |
| 21 | seaweed           | 해조류(생)           |                   3 | Seaweed, kelp, sea mustard                            |
| 22 | seaweed_dried     | 해조류(건조)          |                 365 | Dried kelp, dried laver                               |
| 23 | frozen_food       | 냉동식품             |                 365 | Frozen dumpling, pizza, chicken, shrimp               |
| 24 | noodle_dry        | 건면               |                 180 | Ramen, pasta, somen, glass noodle                     |
| 25 | noodle_fresh      | 생/냉장면            |                   7 | Fresh udon, refrigerated noodles                      |
| 26 | bread             | 빵(일반)            |                   5 | Loaf, baguette, croissant, bagel                      |
| 27 | bakery_creamy     | 베이커리(크림/샌드)      |                   2 | Cake, sandwich, cream bread                           |
| 28 | beverage          | 음료(냉장)           |                   7 | Juice, milk drink, tea, soda                          |
| 29 | beverage_longlife | 음료(멸균/캔)         |                  90 | UHT drinks, canned beverage                           |
| 30 | snack             | 과자/스낵            |                  90 | Cookies, crackers, chips, candy                       |
| 31 | grain             | 곡류/쌀             |                 180 | Rice, barley, corn, oats                              |
| 32 | sauce_condiment   | 소스/조미료           |                 180 | Ketchup, soy sauce, vinegar                           |
| 33 | kimchi_fermented  | 김치/절임류           |                  30 | Kimchi, pickles                                       |
| 34 | pantry_item       | 통조림/건식품          |                 365 | Canned tuna, dried anchovy, instant soup              |
| 35 | hmr_refrigerated  | 반조리/냉장 HMR       |                   5 | Ready meals, side dishes, marinated meat              |
| 36 | hmr_frozen        | 반조리/냉동 HMR       |                 180 | Frozen meal kits, frozen fried rice                   |

> 💡 **Tip:** `category_code`는 모델 학습 시 label, API 필터, Supabase 컬럼 값으로 통일 사용하세요.

---

# 🧩 **② Expiry Rules (예외 규칙 테이블)**

> ✅ 정규식(`regex`) 혹은 정확 일치(`exact`) 기반
> ✅ `override_days` 로 기본 유통기한 보정
> ✅ `notes`로 사유 기록
>
> Supabase에서는 `expiry_rules` 테이블로 두고, 카테고리보다 먼저 매칭 → 오버라이드하는 구조로 사용하세요.

| id | match_type | pattern   | override_days | notes            |                                       |                             |                                |                        |                           |                             |
| -: | ---------- | --------- | ------------: | ---------------- | ------------------------------------- | --------------------------- | ------------------------------ | ---------------------- | ------------------------- | --------------------------- |
|  1 | regex      | `딸기       |    strawberry | blueberry        | cherry                                | raspberry`                  | 3                              | Berries perish quickly |                           |                             |
|  2 | regex      | `귤        |     tangerine | orange           | lemon                                 | grapefruit                  | 자몽`                            | 14                     | Citrus fruits keep longer |                             |
|  3 | exact      | `사과       |        apple` | 30               | Apples store well refrigerated        |                             |                                |                        |                           |                             |
|  4 | exact      | `배        |         pear` | 21               |                                       |                             |                                |                        |                           |                             |
|  5 | regex      | `바나나      |       banana` | 5                | Short shelf life, room temp sensitive |                             |                                |                        |                           |                             |
|  6 | regex      | `감자       |            당근 | 양파               | 마늘`                                   | 30                          | Hardy root vegetables          |                        |                           |                             |
|  7 | regex      | `콩나물      |            숙주 | bean sprout      | mung`                                 | 2                           | Sprouted vegetables short life |                        |                           |                             |
|  8 | regex      | `샌드위치     |      sandwich | 생크림              | cream                                 | 커스터드`                       | 2                              | Contains dairy/cream   |                           |                             |
|  9 | regex      | `면        |            우동 | 냉면               | 냉장면                                   | 생면`                         | 7                              | Fresh noodles          |                           |                             |
| 10 | regex      | `굴        |           바지락 | 조개               | 홍합                                    | clam                        | oyster                         | mussel`                | 2                         | Shellfish highly perishable |
| 11 | regex      | `서울우유.*멸균 |      UHT milk | sterilized milk` | 60                                    | Long shelf life dairy       |                                |                        |                           |                             |
| 12 | regex      | `햄        |           소시지 | sausage          | ham                                   | bacon`                      | 14                             | Processed meat         |                           |                             |
| 13 | regex      | `피자       |         pizza | 만두               | dumpling                              | 돈까스`                        | 365                            | Frozen prepared foods  |                           |                             |
| 14 | regex      | `라면       |         ramen | 파스타              | pasta`                                | 180                         | Dry noodles                    |                        |                           |                             |
| 15 | regex      | `김치       |       pickles | fermented`       | 90                                    | Fermented food longer shelf |                                |                        |                           |                             |
| 16 | regex      | `두부       |         tofu` | 5                | Refrigerated soy product              |                             |                                |                        |                           |                             |
| 17 | regex      | `생선회      |      sashimi` | 1                | Raw fish immediate consumption        |                             |                                |                        |                           |                             |
| 18 | regex      | `과자       |            스낵 | cookies          | chips`                                | 180                         | Dry snacks                     |                        |                           |                             |
| 19 | regex      | `통조림      |             캔 | canned`          | 365                                   | Unopened canned goods       |                                |                        |                           |                             |
| 20 | regex      | `커피       |           tea | 음료               | drink`                                | 30                          | Long-life beverages            |                        |                           |                             |
| 21 | regex      | `김        |       seaweed | laver`           | 365                                   | Dried seaweed               |                                |                        |                           |                             |
| 22 | regex      | `냉동       |       frozen` | 365              | Catch-all frozen foods                |                             |                                |                        |                           |                             |
| 23 | regex      | `계란       |          egg` | 30               | Eggs under refrigeration              |                             |                                |                        |                           |                             |
| 24 | regex      | `오징어      |            문어 | 낙지               | 새우                                    | 게`                          | 2                              | Cephalopod/crustacean  |                           |                             |
| 25 | regex      | `딤섬       |            만두 | dumpling`        | 365                                   | Frozen dumplings            |                                |                        |                           |                             |
| 26 | regex      | `소스       |            케첩 | 간장               | 양념                                    | sauce                       | seasoning`                     | 180                    | Condiments                |                             |
| 27 | regex      | `우엉       |            연근 | burdock          | lotus`                                | 14                          | Mid-life roots                 |                        |                           |                             |
| 28 | regex      | `식빵       |      baguette | loaf             | bread`                                | 5                           | Regular bread                  |                        |                           |                             |
| 29 | regex      | `케이크      |          cake | 빵`               | 2                                     | Cream-based bakery          |                                |                        |                           |                             |
| 30 | regex      | `김치       |       kimchi` | 30               | Fermented side dish                   |                             |                                |                        |                           |                             |
| 31 | regex      | `냉장       | refrigerated` | 7                | Generic refrigerated item             |                             |                                |                        |                           |                             |
| 32 | regex      | `냉동       |       frozen` | 365              | Generic frozen item                   |                             |                                |                        |                           |                             |

> 💡 정규식으로 **한글 + 영어 동시 매칭**을 걸면 OCR 인식결과(한글/영문 혼합)에 모두 대응 가능.

---

# 🧱 **파일 구조 제안**

```
/backend/data/
 ├── categories.csv
 ├── expiry_rules.csv
 ├── food_dataset_v2.csv   # 학습용 라벨 데이터
 └── clean_text.py          # 정제 스크립트
```

---

# 🧠 **Supabase 스키마 예시**

```sql
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  category_code TEXT UNIQUE NOT NULL,
  category_name_kr TEXT,
  default_expiry_days INT NOT NULL,
  description TEXT
);

CREATE TABLE expiry_rules (
  id BIGSERIAL PRIMARY KEY,
  match_type TEXT CHECK (match_type IN ('exact', 'regex')),
  pattern TEXT NOT NULL,
  override_days INT NOT NULL,
  notes TEXT
);
```

---

# 📦 **활용 예시**

```python
# rule-based expiry override example
import re

def apply_expiry_rules(item_name: str, base_expiry: int, rules: list[dict]) -> int:
    for rule in rules:
        if rule["match_type"] == "regex" and re.search(rule["pattern"], item_name, re.IGNORECASE):
            return rule["override_days"]
        if rule["match_type"] == "exact" and rule["pattern"] == item_name:
            return rule["override_days"]
    return base_expiry
```

---

# ✅ **정리 요약**

| 항목          | 설명                                                              |
| ----------- | --------------------------------------------------------------- |
| **언어 표준화**  | 모든 `category_code`, `match_type`, `pattern`을 영어/영문 혼합 regex로 관리 |
| **한글 병기**   | `category_name_kr` 컬럼으로 UI용 한글 표시 가능                            |
| **유통기한 계산** | 기본값(`default_expiry_days`) + 예외 규칙(`expiry_rules`)              |
| **AI 학습용**  | 모델 라벨은 영어 코드 사용 (e.g., `meat_fresh`, `dairy_fresh`)             |
| **데이터 확장성** | 음식 추가 시 `categories`에는 기본값만, `expiry_rules`로 품목 세부 보정           |

-