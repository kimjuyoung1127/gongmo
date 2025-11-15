import pandas as pd
import numpy as np
import pickle
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import re

def preprocess_text(text):
    """
    Preprocess text data by converting to lowercase, removing special characters,
    and normalizing the text for better model performance.
    """
    if pd.isna(text):
        return ""
    
    # 이미 문자열이 아닌 경우 문자열로 변환
    text = str(text)
    
    # 소문자로 변환
    text = text.lower()
    
    # 영숫자와 공백은 유지하면서 특수 문자 제거
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    
    # 여분의 공백 제거
    text = ' '.join(text.split())
    
    return text

def load_dataset(dataset_path):
    """
    CSV 파일에서 식품 데이터셋을 로드합니다
    예상되는 열: 'item_name', 'category', 'expiry_days'
    """
    df = pd.read_csv(dataset_path)
    
    # 텍스트 데이터 전처리
    df['cleaned_item_name'] = df['item_name'].apply(preprocess_text)
    
    return df

def train_model(dataset_path, model_save_path='model.pkl', vectorizer_save_path='vectorizer.pkl'):
    """
    Train the AI model to classify items and predict expiry days
    """
    # 데이터셋 로드
    df = load_dataset(dataset_path)
    
    # 특징(X) 및 타겟(Y) 준비
    X = df['cleaned_item_name']  # 항목 이름을 입력으로 사용
    y_category = df['category']  # 카테고리 분류
    y_expiry = df['expiry_days']  # 유통기한 예측
    
    # 텍스트 데이터 벡터화
    vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
    X_vectorized = vectorizer.fit_transform(X)
    
    # 학습 및 테스트를 위해 데이터 분할
    X_train, X_test, y_train, y_test = train_test_split(
        X_vectorized, y_category, test_size=0.2, random_state=42
    )
    
    # 분류 모델 학습 (항목 카테고리 결정용)
    category_model = MultinomialNB()
    category_model.fit(X_train, y_train)
    
    # 유통기한 예측을 위해 원본 데이터프레임을 사용하여
    # 카테고리를 평균 유통기한으로 매핑
    expiry_by_category = df.groupby('category')['expiry_days'].mean().to_dict()
    
    # 모델 및 벡터라이저 저장
    model_data = {
        'category_model': category_model,
        'expiry_by_category': expiry_by_category,
        'vectorizer': vectorizer
    }
    
    with open(model_save_path, 'wb') as f:
        pickle.dump(model_data, f)
    
    return model_data

def predict_item_category_and_expiry(model_path, item_name):
    """
    Predict the category and expiry days for a given item name
    """
    print(f"[DEBUG] 모델 로드 시도: {model_path}")
    
    # 기본 경로 수정 - models/item_classifier.pkl 사용
    if model_path.startswith('data/'):
        model_path = model_path.replace('data/', 'models/')
        if model_path.endswith('model.pkl'):
            model_path = model_path.replace('model.pkl', 'item_classifier.pkl')
        print(f"[DEBUG] 경로 수정: {model_path}")
    
    # 학습된 모델 로드
    try:
        # 기존 방식으로 시도
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
    except (pickle.UnpicklingError, AttributeError, TypeError) as e:
        print(f"[DEBUG] Pickle 호환성 오류: {str(e)}")
        
        # 호환성 강제 시도
        import pickle5 as pickle_compat
        with open(model_path, 'rb') as f:
            model_data = pickle_compat.load(f)
    
    category_model = model_data['category_model']
    expiry_by_category = model_data['expiry_by_category']
    vectorizer = model_data['vectorizer']
    
    # 입력 전처리
    cleaned_item = preprocess_text(item_name)
    
    # 입력 벡터화
    item_vectorized = vectorizer.transform([cleaned_item])
    
    # 카테고리 예측
    predicted_category = category_model.predict(item_vectorized)[0]
    
    # 예측된 카테고리를 기반으로 유통기한 가져오기
    predicted_expiry = expiry_by_category.get(predicted_category, 7)  # 알 수 없는 경우 기본값 7일
    
    return {
        'category': predicted_category,
        'expiry_days': int(predicted_expiry),
        'item_name': item_name
    }

if __name__ == "__main__":
    # 사용 예시
    # 모델을 학습시키려면 다음을 호출합니다:
    # train_model('food_dataset_v2.csv')
    
    print("AI 모델 학습 스크립트")
    print("모델 학습: python train.py --train")
    print("항목 예측: python train.py --predict 'item_name'")