import pandas as pd
import os

# 데이터 파일 경로 설정
DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
AUGMENTED_DATASET_PATH = os.path.join(DATA_DIR, 'food_dataset_v4_augmented.csv')

# 데이터셋 로드
try:
    df = pd.read_csv(AUGMENTED_DATASET_PATH)
    print(f"'{os.path.basename(AUGMENTED_DATASET_PATH)}' 파일을 성공적으로 로드했습니다. (총 {len(df)}개 샘플)")
    
    # 카테고리별 샘플 수 출력
    print("\n카테고리별 샘플 수:")
    counts = df['category_code'].value_counts()
    print(counts)
    
    # 샘플 수가 2개 미만인 카테고리 확인
    print("\n샘플 수가 2개 미만인 클래스:")
    problematic_classes = counts[counts < 2]
    if problematic_classes.empty:
        print("(없음)")
    else:
        print(problematic_classes)
        
except FileNotFoundError:
    print(f"오류: '{os.path.basename(AUGMENTED_DATASET_PATH)}' 파일을 찾을 수 없습니다.")
except Exception as e:
    print(f"파일 로드 또는 분석 중 오류 발생: {e}")
