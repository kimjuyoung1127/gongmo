import pandas as pd
import os

def merge_datasets():
    """
    상품 데이터셋과 비상품 데이터셋을 병합하여 새로운 학습 데이터셋을 생성합니다.
    인코딩 문제를 해결하기 위해 Python과 Pandas를 사용합니다.
    """
    try:
        # 파일 경로 설정 (backend 디렉토리 기준)
        product_data_path = os.path.join('data', 'food_dataset_v4_clean.csv')
        non_product_data_path = os.path.join('data', 'non_product_data.csv')
        combined_data_path = os.path.join('data', 'food_dataset_v5_combined.csv')

        print(f"'{product_data_path}' 파일 읽기...")
        df_products = pd.read_csv(product_data_path, encoding='utf-8')

        print(f"'{non_product_data_path}' 파일 읽기...")
        df_non_products = pd.read_csv(non_product_data_path, encoding='utf-8')

        print("두 데이터셋 병합...")
        df_combined = pd.concat([df_products, df_non_products], ignore_index=True)

        # 중복 제거
        df_combined.drop_duplicates(subset=['clean_text'], inplace=True)

        print(f"병합 및 중복 제거 후 총 데이터 수: {len(df_combined)}")

        print(f"'{combined_data_path}' 파일로 저장 (encoding='utf-8-sig')...")
        df_combined.to_csv(combined_data_path, index=False, encoding='utf-8-sig')

        print("데이터셋 병합 성공!")
        return True

    except FileNotFoundError as e:
        print(f"오류: 파일을 찾을 수 없습니다 - {e}")
        return False
    except Exception as e:
        print(f"데이터셋 병합 중 오류 발생: {e}")
        return False

if __name__ == "__main__":
    merge_datasets()
