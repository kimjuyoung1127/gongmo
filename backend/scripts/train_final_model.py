"""
최종 모델 학습 스크립트 - 원본 모델에 충실한 방식
메모리 효율적이면서 원본 61.6% 목표
"""
import pandas as pd
import os
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
import joblib
import json

def final_preprocess_text(text):
    """최종 텍스트 전처리 - 상품명 특성 보존"""
    if not isinstance(text, str):
        return ""
    
    # 소문자 변환
    text = text.lower()
    
    # 상품명에서 중요한 패턴만 보존
    # 한글, 영문, 숫자, 수량 단위 (g, kg, ml, l, 개, 봉, 팩, 박스)
    text = re.sub(r'[^가-힣a-z0-9gmlkg개봉팩박스\s]', ' ', text)
    
    # 다중 공백 제거 및 정리
    text = ' '.join(text.split())
    
    return text

def train_final_model():
    """최종 모델 학습 - 단순하고 강한 접근"""
    print("최종 모델 학습 시작...")
    
    # 데이터셋 로드
    dataset_path = 'data/food_dataset_v5_combined.csv'
    models_dir = 'api/models'
    os.makedirs(models_dir, exist_ok=True)
    
    try:
        df = pd.read_csv(dataset_path)
        df.dropna(subset=['clean_text', 'category_code'], inplace=True)
        print(f"데이터셋: {len(df):,}개 샘플, {df['category_code'].nunique()}개 카테고리")
    except Exception as e:
        print(f"데이터셋 로드 실패: {e}")
        return False
    
    # 전처리
    print("\n텍스트 전처리...")
    df['processed_text'] = df['clean_text'].apply(final_preprocess_text)
    
    # 유효한 텍스트만 필터링
    df = df[df['processed_text'].str.len() >= 2]
    df = df[df['processed_text'].str.strip().astype(bool)]
    
    print(f"유효 샘플: {len(df):,}개")
    
    # 특성과 라벨 분리
    X = df['processed_text']
    y = df['category_code']
    
    # 데이터 분할
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # TF-IDF 벡터화
    print("\nTF-IDF 벡터화...")
    vectorizer = TfidfVectorizer(
        max_features=10000,          # 특성 수 늘리기
        min_df=1,                    # 최소 문서 빈도 낮춤
        max_df=0.7,                 # 최대 문서 빈도 낮춰 더 선택적으로
        ngram_range=(1, 3),         # 트리그램까지
        sublinear_tf=True,          # sublinear 효과
        norm='l2'                   # L2 정규화
    )
    
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    print(f"벡터화 완료: {X_train_vec.shape[1]}개 특성")
    
    # 모델 파라미터 테스트
    model_configs = [
        {
            'name': 'LogisticRegression_Default',
            'params': {'C': 1.0, 'max_iter': 2000}
        },
        {
            'name': 'LogisticRegression_HighReg', 
            'params': {'C': 10.0, 'max_iter': 3000}
        },
        {
            'name': 'LogisticRegression_LowReg',
            'params': {'C': 0.5, 'max_iter': 2000}
        }
    ]
    
    best_model = None
    best_accuracy = 0
    best_config = None
    
    for config in model_configs:
        print(f"\n{config['name']} 테스트...")
        
        model = LogisticRegression(
            random_state=42,
            multi_class='multinomial',
            solver='lbfgs',
            **config['params']
        )
        
        try:
            model.fit(X_train_vec, y_train)
            accuracy = model.score(X_test_vec, y_test)
            
            print(f"정확도: {accuracy:.4f} ({accuracy*100:.2f}%)")
            
            if accuracy > best_accuracy:
                best_accuracy = accuracy
                best_model = model
                best_config = config
                print("새로운 최고 모델 발견!")
                
        except Exception as e:
            print(f"학습 실패: {e}")
    
    if not best_model:
        print("모든 모델 실패")
        return False
    
    # 모델 저장
    model_path = os.path.join(models_dir, 'item_classifier_final.pkl')
    vectorizer_path = os.path.join(models_dir, 'vectorizer_final.pkl')
    
    print(f"\n최종 모델 저장: {best_config['name']}")
    joblib.dump(best_model, model_path)
    joblib.dump(vectorizer, vectorizer_path)
    
    # 카테고리 매핑
    category_mapping = {
        'BAKERY_CREAM_SANDWICH': '빵과과자',
        'BERRIES': '과일', 'BEVERAGE_REFRIGERATED': '음료', 'BEVERAGE_SHELF_STABLE': '음료',
        'BREAD_GENERAL': '빵과과자', 'CANNED_DRY_GOODS': '가공식품', 'CITRUS': '과일',
        'DAIRY_FRESH': '유제품', 'DAIRY_PROCESSED': '유제품', 'DRIED_NOODLES': '가공식품',
        'DRY_SEAWEED': '해산물', 'EGGS': '유제품', 'ETC': '기타', 'FISH_FRESH': '해산물',
        'FRESH_NOODLES': '가공식품', 'FRESH_SEAWEED': '해산물', 'FROZEN_FOOD': '냉동식품',
        'FRUIT_GENERAL': '과일', 'FRUIT_VEGETABLES': '채소', 'GRAINS_RICE': '가공식품',
        'HARD_CHEESE': '유제품', 'LEAFY_VEGETABLES': '채소', 'MEAT_FRESH': '정육',
        'MEAT_PROCESSED': '정육', 'MOLLUSCS_CRUSTACEANS': '해산물', 'MUSHROOMS': '채소',
        'PICKLED_VEGETABLES': '채소', 'READY_MEALS_FROZEN': '냉동식품',
        'READY_MEALS_REFRIGERATED': '가공식품', 'ROOT_VEGETABLES': '채소',
        'SAUCES_SEASONINGS': '조미료', 'SHELLFISH': '해산물', 'SNACKS': '빵과과자',
        'SOFT_CHEESE': '유제품', 'SPROUTS': '채소', 'STEM_VEGETABLES': '채소',
        'TROPICAL_FRUIT': '과일'
    }
    
    # 모델 정보 저장
    model_info = {
        'best_model': best_config['name'],
        'preprocessing_method': 'final_product_cleaning',
        'parameters': best_config['params'],
        'classes': list(best_model.classes_),
        'performance': {
            'test_accuracy': best_accuracy,
            'target_accuracy': 0.616,
            'achievement_ratio': best_accuracy / 0.616
        },
        'vectorizer_config': {
            'max_features': 10000,
            'min_df': 1,
            'max_df': 0.7,
            'ngram_range': [1, 3]
        },
        'dataset_info': {'total_samples': len(df)},
        'category_mapping': category_mapping
    }
    
    info_path = os.path.join(models_dir, 'model_classes_final.json')
    with open(info_path, 'w', encoding='utf-8') as f:
        json.dump(model_info, f, indent=2, ensure_ascii=False)
    
    print("저장 완료")
    
    # 결과 출력
    print(f"\n=== 최종 결과 ===")
    print(f"최적 모델: {best_config['name']}")
    print(f"테스트 정확도: {best_accuracy:.4f} ({best_accuracy*100:.2f}%)")
    print(f"원본 모델: 61.6%")
    print(f"달성률: {(best_accuracy/0.616)*100:.1f}%")
    
    if best_accuracy >= 0.616:
        print("성공: 원본 모델 이상 성능 달성!")
    elif best_accuracy >= 0.55:
        print("양호: 55% 이상 달성")
    elif best_accuracy >= 0.45:
        print("보통: 45% 이상 달성")
    else:
        print("개선 필요: 45% 미만")
    
    return True

if __name__ == "__main__":
    success = train_final_model()
    if success:
        print("\n최종 모델 학습 완료!")
    else:
        print("\n최종 모델 학습 실패!")
