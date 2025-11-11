import json
from ml.train import predict_item_category_and_expiry

def test_model_predictions():
    """
    샘플 항목으로 학습된 모델 테스트
    """
    model_path = '../data/model.pkl'
    
    # 테스트할 샘플 항목
    test_items = [
        "Organic Bananas",
        "Fresh Strawberries", 
        "Whole Milk",
        "Organic Eggs",
        "Chicken Breast",
        "Baby Spinach"
    ]
    
    print("모델 예측 테스트:")
    print("-" * 50)
    
    for item in test_items:
        result = predict_item_category_and_expiry(model_path, item)
        print(f"항목: {result['item_name']}")
        print(f"카테고리: {result['category']}")
        print(f"유통기한: {result['expiry_days']}일")
        print("-" * 30)

if __name__ == "__main__":
    test_model_predictions()