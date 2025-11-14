#!/usr/bin/env python3
"""
모델 훈련 스크립트 (v4)

- **데이터 중심 접근법**: 모델 변경이 아닌, 데이터 전처리 방식 개선에 집중.
- **고급 전처리**: 한국어 형태소 분석기(Okt)를 사용해 명사만 추출하여 피처로 사용.
- **원본 데이터 사용**: 노이즈 가능성이 있는 증강 데이터를 제외하고, `food_dataset_v4_clean.csv` 원본 사용.
- 다중 모델 아키텍처 실험 및 최적 모델 선정.
"""

import pandas as pd
import os
import re
from konlpy.tag import Okt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, accuracy_score
import lightgbm as lgb
import joblib
import json
import time

# --- Okt 형태소 분석기 및 전처리 함수 정의 ---
okt = Okt()

def preprocess_korean_text(text):
    """
    한국어 텍스트 전처리 함수:
    1. 한글, 공백 제외 모든 문자 제거
    2. Okt 형태소 분석기로 명사만 추출
    3. 추출된 명사를 공백으로 연결한 문자열 반환
    """
    if not isinstance(text, str):
        return ""
    # 1. 한글, 공백 제외 모든 문자 제거
    text = re.sub(r'[^가-힣\s]', '', text)
    # 2. 명사 추출
    nouns = okt.nouns(text)
    # 3. 공백으로 연결
    return " ".join(nouns)

def train_model():
    print("🔄 모델 훈련 시작 (v4 - 한국어 형태소 분석기 기반 고급 전처리)...")
    
    # --- 1. 경로 및 설정 ---
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # 원본 데이터셋 사용
    dataset_path = os.path.join(current_dir, '..', 'data', 'food_dataset_v4_clean.csv')
    models_dir = os.path.join(current_dir, '..', 'models')
    os.makedirs(models_dir, exist_ok=True)

    # --- 2. 데이터셋 로드 ---
    print(f"📁 '{os.path.basename(dataset_path)}' 로드 중...")
    try:
        df = pd.read_csv(dataset_path)
        df.dropna(subset=['clean_text', 'category_code'], inplace=True)
        print(f"✅ 데이터셋 로드: {len(df):,}개 샘플, {df['category_code'].nunique()}개 카테고리")
    except FileNotFoundError:
        print(f"❌ 파일 없음: {dataset_path}. 데이터셋을 확인하세요.")
        return False

    # --- 3. 데이터 전처리 (핵심 변경) ---
    print("\n🔧 데이터 전처리 중 (Okt 명사 추출)...")
    start_time = time.time()
    df['processed_text'] = df['clean_text'].apply(preprocess_korean_text)
    preprocess_time = time.time() - start_time
    print(f"✅ 전처리 완료: {preprocess_time:.2f}초")
    
    # 전처리 후 내용이 비어있는 샘플 제거
    df = df[df['processed_text'].str.strip().astype(bool)]
    print(f"   - 유효 샘플 수: {len(df):,}개")

    # --- 4. 특성(X)과 라벨(y) 분리 및 데이터 분할 ---
    X = df['processed_text'] # 새로 전처리된 텍스트를 피처로 사용
    y = df['category_code']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # --- 5. TF-IDF 벡터화 ---
    print("\n📝 TF-IDF 벡터화 중...")
    # 전처리 단계에서 이미 토큰화가 완료되었으므로, TfidfVectorizer는 단어 빈도만 계산
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), min_df=2, max_df=0.8)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    print(f"✅ 벡터화 완료 (특성: {X_train_vec.shape[1]}개)")

    # --- 6. 모델 및 하이퍼파라미터 그리드 정의 ---
    models_to_test = {
        'LogisticRegression': {
            'estimator': LogisticRegression(random_state=42, max_iter=2000, multi_class='multinomial', solver='lbfgs'),
            'params': {'C': [1, 10, 50]}
        },
        'SGDClassifier': {
            'estimator': SGDClassifier(random_state=42, loss='hinge'),
            'params': {'alpha': [0.0001, 0.001, 0.01]}
        },
        'MultinomialNB': {
            'estimator': MultinomialNB(),
            'params': {'alpha': [0.1, 0.5, 1.0]}
        },
        'LightGBM': {
            'estimator': lgb.LGBMClassifier(random_state=42),
            'params': {'n_estimators': [100, 200], 'learning_rate': [0.1, 0.2]}
        }
    }

    best_model_info = {'name': None, 'score': -1}

    # --- 7. 다중 모델 훈련 및 평가 루프 ---
    print("\n🤖 다중 모델 훈련 및 최적 모델 탐색 시작...")
    for name, config in models_to_test.items():
        print(f"\n--- {name} 훈련 ---")
        grid_search = GridSearchCV(
            estimator=config['estimator'], param_grid=config['params'], cv=5, scoring='accuracy', n_jobs=-1, verbose=1
        )
        grid_search.fit(X_train_vec, y_train)
        accuracy = grid_search.best_estimator_.score(X_test_vec, y_test)
        
        print(f"   - 최적 파라미터: {grid_search.best_params_}")
        print(f"   - 최고 교차검증 점수: {grid_search.best_score_:.4f}")
        print(f"   - 테스트 정확도: {accuracy:.4f}")

        if accuracy > best_model_info['score']:
            print(f"   ✨ 새로운 최고 성능 모델 발견!")
            best_model_info.update({
                'name': name,
                'score': accuracy,
                'estimator': grid_search.best_estimator_,
                'params': grid_search.best_params_,
                'cv_score': grid_search.best_score_
            })

    if not best_model_info['name']:
        print("❌ 모든 모델 훈련에 실패했습니다.")
        return False

    # --- 8. 최종 최적 모델 저장 ---
    print(f"\n💾 최종 최적 모델 ({best_model_info['name']}) 저장 중...")
    
    model = best_model_info['estimator']
    joblib.dump(model, os.path.join(models_dir, 'item_classifier.pkl'))
    joblib.dump(vectorizer, os.path.join(models_dir, 'vectorizer.pkl'))
    
    model_info = {
        'best_model': best_model_info['name'],
        'preprocessing_method': 'korean_noun_extraction (Okt)',
        'classes': list(model.classes_),
        'hyperparameter_tuning': {
            'best_params': best_model_info['params'],
            'best_cv_score': best_model_info['cv_score'],
        },
        'performance': {'test_accuracy': best_model_info['score']},
        'dataset_info': {
            'dataset_file': os.path.basename(dataset_path),
            'total_samples': len(df),
        }
    }
    
    with open(os.path.join(models_dir, 'model_classes.json'), 'w', encoding='utf-8') as f:
        json.dump(model_info, f, indent=2, ensure_ascii=False)
    
    print("✅ 저장 완료.")

    # --- 9. 최종 결과 보고 ---
    print(f"\n📋 최종 훈련 결과:")
    print(f"   - 🏆 최적 모델: {best_model_info['name']}")
    print(f"   - ✅ 테스트 정확도: {best_model_info['score']:.4f} ({best_model_info['score']*100:.2f}%)")
    print(f"   - ⚙️ 최적 파라미터: {best_model_info['params']}")

    print("\n📊 상세 분류 리포트 (최적 모델 기준):")
    y_pred = model.predict(X_test_vec)
    print(classification_report(y_test, y_pred, zero_division=0))
    
    if best_model_info['score'] > 0.85:
        print(f"\n🎉 훈련 성공! (정확도 > 85%)")
    else:
        print(f"\n⚠️ 정확도 개선 필요 (목표: 85%, 현재: {best_model_info['score']*100:.1f}%)")
    
    return True

if __name__ == "__main__":
    success = train_model()
    if success:
        print("\n🎉 모델 훈련 및 선정 완료!")
    else:
        print("\n❌ 모델 훈련 실패!")
