import os
import sys
import argparse
from ml.train import train_model

def main():
    parser = argparse.ArgumentParser(description='영수증 스캐너 AI 모델 학습')
    parser.add_argument('--dataset', type=str, default='../data/food_dataset_v2.csv',
                        help='학습 데이터셋 CSV 파일 경로')
    parser.add_argument('--model-output', type=str, default='../data/model.pkl',
                        help='학습된 모델이 저장될 경로')
    parser.add_argument('--vectorizer-output', type=str, default='../data/vectorizer.pkl',
                        help='TF-IDF 벡터라이저가 저장될 경로')
    
    args = parser.parse_args()
    
    # 데이터셋 존재 여부 확인
    if not os.path.exists(args.dataset):
        print(f"오류: 데이터셋 파일 '{args.dataset}'이(가) 존재하지 않습니다.")
        sys.exit(1)
    
    print(f"데이터셋을 사용하여 모델 학습: {args.dataset}")
    print(f"모델은 다음 위치에 저장됩니다: {args.model_output}")
    
    # 모델 학습
    model_data = train_model(args.dataset, args.model_output, args.vectorizer_output)
    
    print("학습이 성공적으로 완료되었습니다!")
    print(f"모델이 다음 위치에 저장됨: {args.model_output}")
    print(f"벡터라이저가 다음 위치에 저장됨: {args.vectorizer_output}")
    
    # 학습된 모델 요약 출력
    print("\n모델 요약:")
    print(f"- 학습된 카테고리 수: {len(model_data['expiry_by_category'])}")
    print(f"- 카테고리: {list(model_data['expiry_by_category'].keys())}")

if __name__ == "__main__":
    main()