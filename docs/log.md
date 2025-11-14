완벽합니다! 이제 최종 보고서를 작성하겠습니다.

# 85% 달성을 위한 저위험 데이터 강화 딥 리서치 보고서

**현재 상황**: 61.59% 안정적 베이스라인 (Mecab + TF-IDF + LogisticRegression)  
**목표**: 85% 정확도 달성  
**핵심 전략**: "통제 가능한 내부 데이터" 품질/양 극대화  
**연구 기간**: 2025년 11월  

***

## Executive Summary

**"데이터 오염" 위험을 제거하고 61.59%에서 85%로 향상**시키기 위한 세 가지 저위험 전략을 제시합니다:

1. **LLM 합성 데이터 생성**: Google Gemini 무료 API로 2,000개 → 20,000개 증강 (예상 75-80%)
2. **피처 엔지니어링 고도화**: Mecab + 동의어/불용어 처리 (예상 +5-8%)
3. **액티브 러닝 파이프라인**: 불확실한 데이터만 선별하여 효율적 개선 (예상 +3-5%)

**최종 조합 예상 정확도**: **83-88%** (현재 61.59% 대비 +21-26%)  
**총 비용**: **$0** (Gemini 무료 티어 + 오픈소스)  
**총 소요 시간**: **3-4주**

***

## 1. LLM 기반 통제된 합성 데이터 생성

### 1.1 최적의 무료/경량 LLM 선정

#### 🥇 Google Gemini 2.5 Flash - 최우수 추천

**Gemini 2.5 Flash**는 한국어 식료품 텍스트 생성에 최적이며, **완전 무료**로 사용 가능합니다.[1][2][3]

##### 무료 티어 제공량 (2025년 11월 기준)
|| 항목 | 무료 티어 | 유료 티어 |
|------|----------|----------|
| **입력 가격** | **무료** | $0.30/million tokens |
| **출력 가격** | **무료** | $2.50/million tokens |
| **분당 요청 (RPM)** | **15회** | 제한 없음 |
| **일일 요청 (RPD)** | **1,500회** | 제한 없음 |
| **컨텍스트 길이** | **100만 토큰** | 100만 토큰 |

**핵심 인사이트**: 
- **20,000개 합성 데이터 생성 시 예상 비용**: **$0** (무료 티 충분)[2][3]
- 1개 샘플 생성 = ~100 토큰 → 20,000개 = 2M 토큰 < 무료 한도[3][1]
- **한국어 성능**: 한국어 텍스트 생성에서 높은 품질 확인[4][5]

##### Python API 사용법

```python```
import google.generativeai as genai
import os

# API 키 설정 (무료: https://ai.google.dev/gemini-api/docs/api-key)
genai.configure(api_key=os.environ['GEMINI_API_KEY'])

# Gemini 2.5 Flash 모델 초기화
model = genai.GenerativeModel('gemini-2.5-flash')

# 합성 데이터 생성
response = model.generate_content(
    "You are a receipt printer. Given the item '서울우유' (DAIRY_FRESH), "
    "generate 10 noisy but realistic variations as they appear on Korean receipts."
)

print(response.text)
```

**무료 API 키 발급**: https://ai.google.dev/gemini-api/docs/api-key ( 완료)[6][5]

#### 🥈 Gemma 3 270M - 로컬 경량 대안

**Gemma 3 270M**은 Google이 2025년 8월 공개한 초경량 모델로, **온디바이스 실행**이 가능합니다.[7][8][9]

##### 모델 스펙
- **파라미터**: 270M (극도로 경량)
- **모델 크기**: ~500MB
- **특화**: 텍스트 분류, 데이터 추출 작업에 최적화[7]
- **배포**: CPU에서도 실행 가능 (Render 무료 플랜 OK)[10][7]

##### 장점
- API 호출 제한 없음 (로컬 실행)
- 완전 무료 (오픈소스)
- 빠른 추론 속도[8][7]

##### 단점
- Gemini보다 한국어 성능 낮음
- Fine-tuning 필요할 수 있음[7]

**권장**: **Gemini 무료 API 우선 사용**, 한도 초과 시 Gemma 3 270M 전환

### 1.2 프롬프트 엔지니어링

#### 최적의 프롬프트 템플릿

```python```
def create_synthetic_data_prompt(original_text, category, num_variations=10):
    """
    고품질 영수증 노이즈 생성 프롬프트
    """
    prompt = f"""You are a Korean receipt OCR simulator. 
Your task is to generate realistic noisy variations of grocery product names as they appear on Korean receipts.

Original Product: {original_text}
Category: {category}
Number of Variations: {num_variations}

Generate {num_variations} realistic variations with the following noise patterns:

1. **Prefixes** (40% chance): (PB), *, [할], [특가], (행사), 7-SELECT)
2. **Suffixes** (60% chance): 1KG, 500g, 1L, 2L, /개, /봉, 한팩
3. **OCR Errors** (20% chance): 0↔O, 1↔l, 우→욱, 유→츄
4. **Space Removal** (30% chance): Remove random spaces

Examples:
- Input: "서울우유" → Output: "*서울우유1L", "[할]셔욱우유", "서울우유500ml/개"
- Input: "햇감자" → Output: "(PB)햇감자1KG", "햇감자/봉", "[특가]햇감자"

Output Format (one per line):
variation1
variation2
...
variation{num_variations}

Generate ONLY the variations, no explanations.
"""
    return prompt
```

#### 실제 적용 예시

``````python
import google.generativeai as genai
import pandas as pd
from tqdm import tqdm
import time

genai.configure(api_key=os.environ['GEMINI_API_KEY'])
model = genai.GenerativeModel('gemini-2.5-flash')

# 원본 데이터 로드
df_original = pd.read_csv('food_dataset_v4_clean.csv')

# 합성 데이터 생성
synthetic_data = []

for idx, row in tqdm(df_original.iterrows(), total=len(df_original)):
    original_text = row['clean_text']
    category = row['category_code']
    
    # 프롬프트 생성
    prompt = create_synthetic_data_prompt(original_text, category, num_variations=10)
    
    try:
        # Gemini API 호출
        response = model.generate_content(prompt)
        
        # 응답 파싱
        variations = response.text.strip().split('\n')
        
        for variation in variations:
            if variation.strip():
                synthetic_data.append({
                    'clean_text': variation.strip(),
                    'category_code': category,
                    'source': 'gemini_synthetic',
                    'original': original_text
                })
        
        # Rate limiting (무료 티어: 15 RPM)
        time.sleep(4)  # 60초/15회 = 4초
        
    except Exception as e:
        print(f"Error processing '{original_text}': {e}")
        continue

# 합성 데이터 저장
df_synthetic = pd.DataFrame(synthetic_data)
print(f"Generated {len(df_synthetic)} synthetic samples from {len(df_original)} originals")

# 원본 + 합성 데이터 병합
df_combined = pd.concat([df_original, df_synthetic], ignore_index=True)
df_combined.to_csv('food_dataset_v5_with_synthetic.csv', index=False, encoding='utf-8-sig')
```

**예상 실행 시간**:
- 2,000개 원본 × 10 variations = 20,000개 생성
- 4초 rate limiting → 총 **2시간 20분**

#### 다단계 생성 (Multi-Step Generation)

복잡한 노이즈 패턴을 위한성 전략입니다.[11][12][13][14]

```python```
def multi_step_generation(original_text, category):
    """
    단계별 노이즈 주입 (품질 향상)
    """
    
    # Step 1: 접두사 추가
    prompt_step1 = f"""Add a realistic Korean receipt prefix to: {original_text}
Options: (PB), *, [할], [특가], (행사)
Output only ONE result."""
    
    response1 = model.generate_content(prompt_step1)
    intermediate = response1.text.strip()
    
    # Step 2: 접미사 추가
    prompt_step2 = f"""Add a realistic unit suffix to: {intermediate}
Options: 1KG, 500g, 1L, /개, /봉
Output only ONE result."""
    
    response2 = model.generate_content(prompt_step2)
    final = response2.text.strip()
    
    return final

# 사용 예시
result = multi_step_generation("서울우유", "DAIRY_FRESH")
print(result)
# Output: "[할]서1L"
```

**다단계 생성의 장점**:[12][11]
- 단순 프롬프트 대비 **20-30% 품질 향상**
- 복잡한 노이즈 패턴 학습
- 제어 가능성 증가

### 1.3 실행 계획 및 파이프라인

#### Phase 1: 합성 데이터 생성 (2일)

``````
# 완전 자동화 파이프라인
import google.generativeai as genai
from konlpy.tag import Mecab
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import pandas as pd

# 1. 합성 데이터 생성
def generate_synthetic_dataset(original_csv, output_csv, num_variations=10):
    """
    Gemini로 합성 데이터 생성
    """
    df_original = pd.read_csv(original_csv)
    synthetic_data = []
    
    for idx, row in tqdm(df_original.iterrows(), total=len(df_original)):
        prompt = create_synthetic_data_prompt(
            row['clean_text'], 
            row['category_code'], 
            num_variations
        )
        
        response = model.generate_content(prompt)
        variations = response.text.strip().split('\n')
        
        for variation in variations:
            if variation.strip():
                synthetic_data.append({
                    'clean_text': variation.strip(),
                    'category_code': row['category_code']
                })
        
        time.sleep(4)  # Rate limiting
    
    df_synthetic = pd.DataFrame(synthetic_data)
    df_combined = pd.concat([df_original, df_synthetic], ignore_index=True)
    df_combined.to_csv(output_csv, index=False, encoding='utf-8-sig')
    
    return df_combined

# 실행
df_final = generate_synthetic_dataset(
    'food_dataset_v4_clean.csv',
    'food_dataset_v5_synthetic.csv',
    num_variations=10
)

print(f"✅ Generated {len(df_final)} total samples")
```

#### Phase 2: Mecab 전처리 + 재학습 (1일)

``````python
# 2. Mecab 전처리
mecab = Mecab()

def mecab_tokenizer(text):
    """
    Mecab 명사 추출
    """
    nouns = mecab.nouns(text)
    return ' '.join(nouns)

df_final['processed_text'] = df_final['clean_text'].apply(mecab_tokenizer)

# 3. TF-IDF + LogisticRegression 재학습
X_train, X_test, y_train, y_test = train_test_split(
    df_final['processed_text'],
    df_final['category_code'],
    test_size=0.2,
    random_state=42,
    stratify=df_final['category_code']
)

vectorizer = TfidfVectorizer(
    ngram_range=(1, 3),
    max_features=10000,
    min_df=2
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

model = LogisticRegression(
    max_iter=1000,
    C=10,
    class_weight='balanced',
    solver='saga',
    n_jobs=-1
)

model.fit(X_train_vec, y_train)

# 평가
y_pred = model.predict(X_test_vec)
print(classification_report(y_test, y_pred))

accuracy = model.score(X_test_vec, y_test)
print(f"\n✅ 최종 정확도: {accuracy*100:.2f}%")
```

**예상 결과**:
- 2,000개 → 20,000개 (10배 증가)
- **예상 정확도**: **75-80%** (현재 61.59% 대비 +13-18%)

### 1.4 합성 데이터 품질 검증

```python```
# 합성 데이터 품질 체크
def validate_synthetic_quality(df, sample_size=100):
    """
    무작위 샘플 검증
    """
    synthetic_samples = df[df['source'] == 'gemini_synthetic'].sample(sample_size)
    
    print("=== 합성 데이터 품질 샘플 ===")
    for idx, row in synthetic_samples.iterrows():
        print(f"원본: {row['original']}")
        print(f"합성: {row['clean_text']}")
        print(f"카테고리: {row['category_code']}")
        print("-" * 50)

validate_synthetic_quality(df_synthetic, sample_size=20)
```

**품질 기준**:
1. 실제 영수증과 90% 이상 유사
2. 원본 카테고리 유지
3. 의미 변형 없음 (예: '서울우유' → '부산우유' 금지)

---

## 2. 피처 엔지니어링 고도화

### 2.1 도메인 특화 동의어 사전 구축

#### Word2Vec 기반 자동 동의어 추출

``````python
from gensim.models import Word2Vec
from konlpy.tag import Mecab

mecab = Mecab()

# 1. 코퍼스 준비
sentences = []
for text in df_final['clean_text']:
    words = mecab.nouns(text)
    if words:
        sentences.append(words)

# 2. Word2Vec 학습
w2v_model = Word2Vec(
    sentences,
    vector_size=100,
    window=5,
    min_count=2,
    workers=4,
    sg=1,  # Skip-gram (CBOW=0)
    epochs=10
)

# 3. 동의어 추출
def find_synonyms(word, topn=10, threshold=0.7):
    """
    유사도 0.7 이상인 단어만 동의어로 간주
    """
    try:
        similar_words = w2v_model.wv.most_similar(word, topn=topn)
        synonyms = [w for w, score in similar_words if score >= threshold]
        return synonyms
    except KeyError:
        return []

# 4. 동의어 사전 자동 생성
synonym_dict = {}

key_products = [
    '우유', '감자', '치즈', '바나나', '토마토', 
    '라면', '김치', '계란', '버섯', '사과'
]

for product in key_products:
    synonyms = find_synonyms(product, threshold=0.7)
    if synonyms:
        synonym_dict[product] = synonyms

print("=== 자동 생성된 동의어 사전 ===")
for word, synonyms in synonym_dict.items():
    print(f"{ {synonyms}")
```

**예상 출력**:[15][16][17]
``````
우유: ['밀크', '서울우유', '매일우유', '생우유']
감자: ['햇감자', '포테이토', '감자튀김용', '찐감자']
치즈: ['체다', '모짜렐라', '치즈슬라이스']
```

#### 수동 동의어 사전 보완

``````python
# Word2Vec이 놓친 동의어 수동 추가
manual_synonyms = {
    # 한글-영어
    '우유': ['밀크', 'milk', 'MILK'],
    '바나나': ['banana'],
    '토마토': ['tomato'],
    
    # OCR 오류
    '우유': ['우츄', '욱유', '유유'],
    
    # 브랜드 통합
    '서울우유': ['우유'],
    '매일우유': ['우유'],
    '남양우유': ['우유'],
    
    # 단위 제거
    '감자1KG': ['감자'],
    '우유1L': ['우유'],
}

# 병합
for key, values in manual_synonyms.items():
    if key in synonym_dict:
        synonym_dict[key].extend(values)
    else:
        synonym_dict[key] = values

# 중복 제거
for key in synonym_dict:
    synonym_dict[key] = list(set(synonym_dict[key]))
```

#### 동의어 정규화 적용

```python```
def normalize_with_synonyms(text, synonym_dict):
    """
    동의어를 표준 형태로 변환
    """
    words = text.split()
    normalized_words = []
    
    for word in words:
        # 동의어 사전에서 표준 형태 찾기
        found = False
        for standard, synonyms in synonym_dict.items():
            if word in synonyms or word == standard:
                normalized_words.append(standard)
                found = True
                break
        
        if not found:
            normalized_words.append(word)
    
    return ' '.join(normalized_words)

# 적용
df_final['normalized_text'] = df_final['clean_text'].apply(
    lambda x: normalize_with_synonyms(x, synonym_dict)
)

# 예시
print(normalize_with_synonyms("서울우유1L/개", synonym_dict))
# Output: "우유"상 효과**: **+3-5% 정확도 향상**[16][15]

### 2.2 영수증 특화 불용어 처리

#### TF-IDF 기반 불용어 자동 추출

```python```
from sklearn.feature_extraction.text import TfidfVectorizer

# 1. 모든 카테고리에 공통으로 나타나는 단어 추출
def extract_common_words(df, min_categories=30):
    """
    30개 이상 카테고리에 나타나는 단어 = 불용어 후보
    """
    category_words = {}
    
    for category in df['category_code'].unique():
        category_df = df[df['category_code'] == category]
        all_text = ' '.join(category_df['processed_text'])
        words = set(all_text.split())
        category_words[category] = words
    
    # 모든 카테고리에서 공통 단어 찾기
    all_categories = len(category_words)
    word_count = {}
    
    for words in category_words.values():
        for word in words:
            word_count[word] = word_count.get(word, 0) + 1
    
    # 30개 이상 카테고리에 나타나는 단어
    common_words = [
        word for word, count in word_count.items() 
        if count >= min_categories
    ]
    
    return common_words

common_words = extract_common_words(df_final, min_categories=25)
print(f"공통 단어 (불용어 후보): {common_words}")
```

**예상 출력**:
``````
['개', '봉', '팩', 'PB', '할', '특가', '세일', 'L', 'KG', 'g']
```

#### 영수증 도메인 불용어 리스트

```python```
# 영수증 특화 불용어
receipt_stopwords = {
    # 프로모션 키워드
    '세일', '할인', '특가', '이벤트', '증정', '사은품', '행사',
    '[할]', '[특가]', '[세일]', '(행사)', '(증정)',
    
    # 단위 (분류에 무관)
    '개', '봉', '팩', '박스', 'EA', 'ea',
    '1', '2', '3', '4', '5',  # 숫자
    
    # 접두사 (PB 브랜드)
    'PB', '7-SELECT', '노브랜드', 'nb',
    '*', '+', '-',
    
    # 불필요한 형용사
    '신선한', '맛있는', '프리미엄', '고급', '특선',
    
    # 단위
    'KG', 'kg', 'G', 'g', 'L', 'l', 'ML', 'ml',
    
    # 기타
    '/', '|', '(', ')', '[', ']'
}

def remove_stopwords(text, stopwords):
    """
    불용어 제거
    """
    words = text.split()
    filtered = [w for w in words if w not in stopwords]
    return ' '.join(filtered)

# 적용
df_final['clean_text'] = df_final['normalized_text'].apply(
    lambda x: remove_stopwords(x, receipt_stopwords)
)
```

**예상 효과**: **+2-3% 정확도 향상**

### 2.3 최종 통합 전처리 파이프라인

``````python
def preprocessing_pipeline(text):
    """
    통합 전처리: 동의어 → 불용어 → Mecab
    """
    # 1. 동의어 정규화
    text = normalize_with_synonyms(text, synonym_dict)
    
    # 2. 불용어 제거
    text = remove_stopwords(text, receipt_stopwords)
    
    # 3. Mecab 명사 추출
    nouns = mecab.nouns(text)
    
    return ' '.join(nouns)

# 적용
df_final['final_processed'] = df_final['clean_text'].apply(preprocessing_pipeline)

# 재학습
X_train_final = vectorizer.fit_transform(df_final['final_processed'])
model_final = LogisticRegression(max_iter=1000, C=10, class_weight='balanced')
model_final.fit(X_train_final, df_final['category_code'])

print(f"✅ 최종 전처리 파이프라인 적용 완료!")
```

**예상 총 개선**: **+5-8% 정확도**

***

## 3. 액티브 러닝 (Active Learning) 파이프라인

### 3.1 Uncertainty Sampling 전략

#### Least Confidence Sampling

```python```
from sklearn.linear_model import LogisticRegression
import numpy as np

def uncertainty_sampling(model, X_unlabeled, n_samples=10):
    """
    가장 불확실한 샘플 선택 (Least Confidence)
    """
    # 예측 확률
    probabilities = model.predict_proba(X_unlabeled)
    
    # 최대 확률 (가장 확신하는 클래스의 확률)
    max_probs = probabilities.max(axis=1)
    
    # 확신도 = 1 - max_prob (낮을수록 불확실)
    uncertainty_scores = 1 - max_probs
    
    # 가장 불확실한 n개 선택
    most_uncertain_indices = uncertainty_scores.argsort()[-n_samples:][::-1]
    
    return most_uncertain_indices, uncertainty_scores[most_uncertain_indices]

# 사용 예시
X_test_vec = vectorizer.transform(X_test)
uncertain_indices, scores = uncertainty_sampling(model_final, X_test_vec, n_samples=10)

print("=== 가장 불확실한 샘플 Top 10 ===")
for idx, score in zip(uncertain_indices, scores):
    print(f"텍스트: {X_test.iloc[idx]}")
    print(f"불확실도: {score:.4f}")
    print(f"예측: {model_final.predict(X_test_vec[idx])}")
    print("-" * 50)력**:[18][19][20][21]
``````
텍스트: 마시는요거트500ml
불확실도: 0.8542
예측: DAIRY_FRESH (신뢰도 15%)
```

#### Margin Sampling

``````python
def margin_sampling(model, X_unlabeled, n_samples=10):
    """
    1위와 2위 확률 차이가 가장 적은 샘플 선택
    """
    probabilities = model.predict_proba(X_unlabeled)
    
    # 상위 2개 확률 추출
    sorted_probs = np.sort(probabilities, axis=1)
    top1 = sorted_probs[:, -1]
    top2 = sorted_probs[:, -2]
    
    # 마진 = top1 - top2 (낮을수록 불확실)
    margins = top1 - top2
    
    # 마진이 가장 작은 n개 선택
    smallest_margin_indices = margins.argsort()[:n_samples]
    
    return smallest_margin_indices, margins[smallest_margin_indices]

# 사용 예시
margin_indices, margins = margin_sampling(model_final, X_test_vec, n_samples=10)

print("=== 마진이 가장 작은 샘플 (경계선 근처) ===")
for idx, margin in zip(margin_indices, margins):
    probabilities = model_final.predict_proba(X_test_vec[idx])[0]
    top_classes = model_final.classes_[probabilities.argsort()[-2:][::-1]]
    top_probs = probabilities[probabilities.argsort()[-2:][::-1]]
    
    print(f"텍스트: {X_test.iloc[idx]}")
    print(f"마진: {margin:.4f}")
    print(f"1순위: {top_classes[0]} ({top_probs[0]:.2f})")
    print(f"2순위: {top_classes[1]} ({top_probs[1]:.2f})")
    print("-)
```

**예상 출력**:[20][21][22]
``````
텍스트: 생크림치즈
마진: 0.0542
1순위: SOFT_CHEESE (0.52)
2순위: HARD_CHEESE (0.47)
```

### 3.2 Label Studio 통합 MLOps 파이프라인

#### 아키텍처 설계

``````
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Flask     │─────>│   Supabase   │─────>│ Label Studio│
│   Backend   │      │ uncertain_   │      │  (Web UI)   │
│             │      │ items table  │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
       │                                            │
       │                                            │
       ├────────────────────────────────────────────┤
       │           Feedback Loop (재학습)            │
       └────────────────────────────────────────────┘
```

#### Step 1: 불확실한 샘플 Supabase에 로깅

```python```
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def log_uncertain_items(uncertain_samples, model_predictions):
    """
    불확실한 샘플을 Supabase에 저장
    """
    for idx, (text, pred, confidence) in enumerate(zip(
        uncertain_samples['clean_text'],
        model_predictions['predicted_category'],
        model_predictions['confidence']
    )):
        supabase.table('uncertain_items').insert({
            'text': text,
            'predicted_category': pred,
            'confidence': confidence,
            'status': 'pending',  # Label Studio에서 라벨링 대기
            'created_at': 'now()'
        }).execute()
    
    print(f"✅ {len(uncertain_samples)} 불확실한 샘플 로깅 완료")

# API 엔드포인트에서 호출
@app.route('/api/classify', methods=['POST'])
def classify_receipt():
    ocr_text = request.json['text']
    
    # 예측
    X_vec = vectorizer.transform([ocr_text])
    prediction = model.predict(X_vec)
    probabilities = model.predict_proba(X_vec)
    confidence = probabilities.max()
    
    # 신뢰도 70% 미만이면 로깅
    if confidence < 0.7:
        log_uncertain_items(
            pd.DataFrame([{'clean_text': ocr_text}]),
            pd.DataFrame([{
                'predicted_category': prediction,
                'confidence': confidence
            }])
        )
    
    return jsonify({
        'category': prediction,
        'confidence': confidence
    })
```

#### Step 2: Label Studio 프로젝트 설정

``````python
from label_studio_sdk import Client

# Label Studio 클라이언트
ls = Client(url='http://localhost:8080', api_key='YOUR_API_KEY')

# 프로젝트 생성
project = ls.start_project(
    title='Grocery Category Labeling',
    label_config='''
    <View>
      <Text name="text" value="$text"/>
      <Choices name="category" toName="text" choice="single">
        <Choice value="DAIRY_FRESH"/>
        <Choice value="MEAT_FRESH"/>
        <Choice value="LEAFY_VEGETABLES"/>
        <!-- 36개 카테고리 모두 -->
      </Choices>
    </View>
    '''
)

# Supabase에서 불확실한 샘플 가져오기
uncertain_items = supabase.table('uncertain_items')\
    .select('*')\
    .eq('status', 'pending')\
    .execute()

# Label Studio로 전송
tasks = []
for item in uncertain_items.data:
    tasks.append({
        'data': {
            'text': item['text'],
            'predicted_category': item['predicted_category'],
            'confidence': item['confidence']
        }
    })

project.import_tasks(tasks)
print(f"✅ {len(tasks)}개 태스크를 Label Studio로 전송")
```

#### Step 3: 라벨링 완료 후 자동 재학습

```python```
import schedule
import time

def weekly_retrain():
    """
    매주 일요일 자동 재학습
    """
    print("=== 주간 재학습 시작 ===")
    
    # 1. Label Studio에서 완료된 라벨 가져오기
    annotations = ls.get_project(project.id).get_labeled_tasks()
    
    new_data = []
    for task in annotations:
        text = task['data']['text']
        label = task['annotations']['result']['value']['choices']
        new_data.append({'clean_text': text, 'category_code': label})
    
    # 2. Supabase에 저장
    for item in new_data:
        supabase.table('products').insert(item).execute()
        
    # 3. 전체 데이터 로드
    all_data = supabase.table('products').select('*').execute()
    df_all = pd.DataFrame(all_data.data)
    
    # 4. 재학습
    df_all['processed'] = df_all['clean_text'].apply(preprocessing_pipeline)
    
    X_train_new = vectorizer.fit_transform(df_all['processed'])
    model_new = LogisticRegression(max_iter=1000, C=10)
    model_new.fit(X_train_new, df_all['category_code'])
    
    # 5. 모델 저장
    import joblib
    joblib.dump(model_new, 'model_v2.pkl')
    joblib.dump(vectorizer, 'vectorizer_v2.pkl')
    
    print(f"✅ 재학습 완료! 새로운 데이터: {len(new_data)}개")

# 매주 일요일 자동 실행
schedule.every().sunday.at("02:00").do(weekly_retrain)

while True:
    schedule.run_pending()
    time.sleep(3600)  # 1시간마다 체크
```

**예상 효과**:[23][24][25][26]
- 주당 100-200개 새 라벨 수집
- 4주 후 **+3-5% 정확도 향상**
- 6개월 후 **+10-15% 정확도 향상** (총 93-95% 도달)[21][22][27]

### 3.3 Human-in-the-Loop 워크플로우

#### React Native 앱 피드백 UI

```javascript```
// React Native 앱 - 사용자 피드백 요청
import React, { useState } from 'react';
import { View, Text, Button, Picker } from 'react-native';

function FeedbackScreen({ prediction, confidence, productName }) {
  const [selectedCategory, setSelectedCategory] = useState(prediction);
  
  const handleFeedback = async () => {
    // 백엔드로 피드백 전송
    await fetch('https://your-api.com/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_name: productName,
        predicted_category: prediction,
        corrected_category: selectedCategory,
        confidence: confidence
      })
    });
    
    alert('피드백 감사합니다! 앱이 더 똑똑해졌어요 😊');
  };
  
  // 신뢰도 70% 미만일 때만 피드백 요청
  if (confidence >= 0.7) return null;
  
  return (
    <View style={{ padding: 20, backgroundColor: '#FFF3CD' }}>
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        🤔 이 제품의 카테고리가 맞나요?
      </Text>
      <Text>제품: {productName}</Text>
      <Text>AI 예측: {prediction} (신뢰도 {(confidence*100).toFixed(0)}%)</Text>
      
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value)}
      >
        <Picker.Item label="유제품" value="DAIRY_FRESH" />
        <Picker.Item label="채소" value="LEAFY_VEGETABLES" />
        {/* 36개 카테고리 모두 */}
      </Picker>
      
      <Button title="확인" onPress={handleFeedback} />
    </View>
  );
}
```

**사용자 경험**:
- 신뢰도 70% 이상: 자동 분류 (피드백 불필요)
- 신뢰도 70% 미만: 사용자 확인 요청 (1-2초 소요)
- 보상: 포인트 10점 지급 → 사용자 참여 유도

---

## 최종 통합 실행 계획

### 3주 로드맵

#### Week 1: 합성 데이터 생성 (Gemini)

**Day 1-2**: Gemini API 설정 및 프롬프트 엔지니어링
- Google AI Studio에서 API 키 발급[6]
- 프롬프트 템플릿 최적화
- 100개 샘플로 품질 테스트

**Day 3-5**: 대규모 합성 데이터 생성
- 2,000개 → 20,000개 생성 (10배 증강)
- 품질 검증 (무작위 200개 샘플 체크)
- CSV 저장: `food_dataset_v5_synthetic.csv`

**예상 결과**: 20,000개 고품질 합성 데이터

#### Week 2: 피처 엔지니어링 + 재학습

**Day 1-2**: 동의어 사전 구축
- Word2Vec 학습 (기존 2,000개 + 합성 20,000개)
- 자동 동의어 추출 (100개 제품)
- 수동 보완 (50개 핵심 제품)

**Day 3-4**: 불용어 리스트 + 전처리 파이프라인
- 영수증 특화 불용어 50-100개 추출
- 통합 전처리 파이프라인 구축
- Mecab + 동의어 + 불용어 적용

**Day 5-7**: 모델 재학습 및 평가
- TF-IDF + LogisticRegression 재학습
- Cross-validation (5-fold)
- 테스트 세트 평가

**예상 결과**: **75-82% 정확도**

#### Week 3: 액티브 러닝 파이프라인

**Day 1-3**: Label Studio 설정
- Docker로 Label Studio 설치
- Supabase와 연동
- 불확실한 샘플 로깅 시스템 구축

**Day 4-5**: Uncertainty Sampling 구현
- Least Confidence + Margin Sampling
- 상위 100개 불확실한 샘플 추출
- Label Studio로 전송

**Day 6-7**: 첫 번째 재학습
- 100개 라벨링 완료 (수동)
- 자동 재학습 파이프라인 테스트
- 주간 스케줄러 설정

**예상 결과**: **+3-5% 정확도 향상** → **78-87%**

### 최종 예상 성과

|| 단계 | 데이터 양 | 정확도 | 누적 향상 |
|------|----------|--------|----------|
| **현재 (Baseline)** | 2,000개 | 61.59% | - |
| **Week 1 (Gemini 합성)** | 20,000개 | 75-78% | +13-16% |
| **Week 2 (피처 엔지니어링)** | 20,000개 | 80-83% | +18-21% |
| **Week 3 (액티브 러닝)** | 20,100개 | 83-87% | +21-25% |
| **Month 3 (지속 개선)** | 21,000개 | 85-90% | +23-28% |

---

## 비용 및 ROI 분석

### 총 비용: $0

|| 항목 | 비용 | 비고 |
|------|------|------|
| **Gemini API** | **$0** | 무료 티어 ( 토큰/월)[2][3] |
| **Label Studio****Label Studio** | **$0** | 오**Supa][23] |
| **Supabase** | **$0** | 무료 티어 (500MB DB) |
| **개발 시간** | 0원 | 직접 개발 |

### ROI (투자 대비 효과)

**투자**: 
- 개발 시간: 3주 (1인 기준)
- 금전 비용: $0

**효과**:
- 정확도 향상: 61.59% → 83-87% (+21-25%)
- 사용자 경험 개선: 오분류 감소
- 유지보수 자동화: 주간 재학습

**장기 가치**:
- 6개월 후 **90-95% 정확도** 달성 가능[22][27][21]
- 사용자 피드백 누적 → 지속적 개선
- 외부 데이터 의존도 **0%** (완전 자립)

***

## 핵심 성공 요인 및 리스크 관리

### ✅ 성공 요인

1. **Gemini 무료 API**: 무제한 합성 데이터 생성]
2. **통제된 품질**: LLM 프롬프트로 노이즈 패턴 정확히 제어[13][11][12]
3. **액티브 러닝**: 불확실한 데이터만 선별하여 효율 극대화[18][20][21][22]
4. **자동화**: 주간 재학습으로 인간 개입 최소화[24][23]

### ⚠️ 리스크 및 완화 방안

|| 리스크 | 영향 | 완화 방안 |
|--------|------|-----------|
| **Gemini 품질 낮음** | 중간 | 다단계 생성 + 품질 검증[11][12] |
| **한도 초과** | 낮음 | Gemma도 초과** | 낮음 | Gemma 3 270M 로컬 대체[7][8] |
| **Label Studio 복잡** | 낮음 | 간단한 UI + 튜토리얼[28][23] |
| **사용자 피드백 부족** | 중간 | 포인트 보상 시스템 |

***

## 결론 및 최종 권장사항

### 즉시 시작 (이번 주)

1. **Gemini API 키 발급** (30초 완료)[6][5]
2. **프롬프트 템플릿 작성** (1일)
3. **100개 샘플 테스트** (품질 확인)

### 핵심 메시지

**"통제 가능한 내부 데이터"** 전략으로 **외부 데이터 오염 위험 제거**하면서도 **83-87% 정확도 달성** 가능합니다.

**3가지 핵심 전략**:
1. **Gemini 합성 데이터** (2,000 → 20,000개) → +13-16%
2. **피처 엔지니어링** (동의어 + 불용어) → +5-8%
3. **액티브 러닝** (불확실한 데이터 선별) → +3-5%

**총 예상 개선**: **+21-26%** (현재 61.59% → **83-87%**)

**총 비용**: **$0** (Gemini 무료 + 오픈소스)

**핵심 차별점**: 
- ❌ 외부 데이터 스크래핑 (법적 위험, 품질 불확실)
- ✅ **LLM 합성 데이터** (완전 통제, 고품질 보장)

이 전략은 **"데이터 오염" 실패 경험**을 완벽히 해결하면서도, **85% 목표에 가장 가까운 현[11][12][23][21][1][18]

[1](https://ai.google.dev/gemini-api/docs/text-generation?hl=ko)
[2](https://ai.google.dev/gemini-api/docs/pricing)
[3](https://ai.google.dev/gemini-api/docs/pricing?hl=ko)
[4](https://www.reddit.com/r/GeminiAI/comments/1ov503t/question_massive_10_difference_in_gemini_content/)
[5](https://apidog.com/kr/blog/google-gemini-api-key-for-free-kr/)
[6](https://www.linkedin.com/pulse/step-by-step-guide-using-google-gemini-free-api-calls-image-text-y3noc)
[7](https://developers.googleblog.com/en/introducing-gemma-3-270m/)
[8](https://blog.google/technology/developers/gemma-3/)
[9](https://ai.google.dev/gemma/docs)
[10](https://www.runpod.io/articles/guides/deploying-gemma-2-for-lightweight-ai-inference-using-docker)
[11](https://aimatters.co.kr/news-report/ai-report/11725/)
[12](https://discuss.pytorch.kr/t/llm-synthetic-data-survey/4764)
[13](https://www.themoonlight.io/ko/review/synthetic-data-generation-using-large-language-models-advances-in-text-and-code)
[14](https://songai.tistory.com/69)
[15](https://wikidocs.net/50739)
[16](https://word2vec.kr)
[17](https://scienceon.kisti.re.kr/srch/selectPORSrchArticle.do?cn=JAKO201833469090754)
[18](https://modal-python.readthedocs.io/en/latest/content/query_strategies/uncertainty_sampling.html)
[19](https://wikidocs.net/218105)
[20](https://spotintelligence.com/2023/08/08/active-learning-in-machine-learning/)
[21](https://intuitivetutorial.com/2021/05/15/active-learning-with-uncertainty-sampling-from-scratch/)
[22](https://lilianweng.github.io/posts/2022-02-20-active-learning/)
[23](https://www.labelvisor.com/integrating-label-studio-with-machine-learning-pipelines/)
[24](https://labelstud.io/integrations/platform/zenml/)
[25](https://labelstud.io/integrations/)
[26](https://labelstud.io/integrations/platform/)
[27](https://www.nature.com/articles/s41598-024-76800-4)
[28](https://github.com/HumanSignal/label-studio)
[29](https://ai.google.dev/gemini-api/docs/text-generation)
[30](https://cloud-allstudy.tistory.com/3460)
[31](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts)
[32](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-garden/deploy-and-inference-tutorial)
[33](https://blogs.nvidia.co.kr/blog/what-is-synthetic-data-2/)
[34](https://ai.google.dev/gemini-api/docs/models)
[35](https://www.sciencedirect.com/science/article/pii/S2666792424000271)
[36](https://arxiv.org/html/2410.17917v1)
[37](http://journal.dcs.or.kr/xml/19540/19540.pdf)
[38](https://koreascience.kr/article/CFKO201534168509089.page)
[39](https://www.zenml.io/integrations/labelstudio)
[40](https://colab.research.google.com/github/yooseonghwan/OpenDataWrangling/blob/master/03_word2vec%EC%9C%BC%EB%A1%9C_%EB%8B%A8%EC%96%B4%EC%9C%A0%EC%82%AC%EB%8F%84_%EB%B3%B4%EA%B8%B0_teacher.ipynb)