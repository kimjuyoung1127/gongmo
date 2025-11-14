#!/usr/bin/env python3
"""
Step 2: 데이터셋 분석
food_dataset_v3.csv 품질 및 분포 분석
"""

import pandas as pd
import os
from collections import Counter

def analyze_dataset():
    print("🔄 Step 2: 데이터셋 분석 시작...")
    
    # 1. 파일 경로
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(current_dir, 'food_dataset_v3.csv')
    
    # 2. 데이터셋 로드
    print("📁 food_dataset_v3.csv 로드 중...")
    try:
        df = pd.read_csv(dataset_path)
        print(f"✅ 로드 완료: {len(df)}개 샘플")
    except FileNotFoundError:
        print(f"❌ 파일 없음: {dataset_path}")
        print("💡 먼저 python merge_datasets.py 실행 필요")
        return False
    except Exception as e:
        print(f"❌ 로드 실패: {e}")
        return False
    
    # 3. 기본 통계
    print("\n📊 기본 통계:")
    print(f"   총 샘플: {len(df):,}개")
    print(f"   카테고리: {df['category_code'].nunique()}개")
    
    # 4. 컬럼 정보
    print(f"\n📋 컬럼 정보:")
    for col in df.columns:
        print(f"   {col}: {df[col].dtype}")
        null_count = df[col].isnull().sum()
        if null_count > 0:
            print(f"     ⚠️ NULL 값: {null_count}개")
    
    # 5. 카테고리별 분포
    print(f"\n📈 카테고리별 샘플 분포:")
    category_counts = df['category_code'].value_counts()
    
    # 상위 10개
    print("   (상위 10개)")
    for i, (cat, count) in enumerate(category_counts.head(10).items(), 1):
        percentage = (count / len(df)) * 100
        print(f"   {i:2d}. {cat:<25} {count:>4}개 ({percentage:>5.1f}%)")
    
    # 하위 10개
    print(f"\n   (하위 10개)")
    for i, (cat, count) in enumerate(category_counts.tail(10).items(), 1):
        percentage = (count / len(df)) * 100
        print(f"   {i:2d}. {cat:<25} {count:>4}개 ({percentage:>5.1f}%)")
    
    # 6. 샘플 부족 카테고리 식별
    print(f"\n⚠️ 샘플 부족 카테고리 (< 10개):")
    missing_categories = []
    for cat, count in category_counts.items():
        if count < 10:
            missing_categories.append((cat, count))
            print(f"   {cat:<25} {count:>4}개")
    
    if not missing_categories:
        print("   (없음) 모든 카테고리 10개 이상")
    
    #7. 텍스트 길이 분석
    print(f"\n📝 텍스트 길이 분석:")
    df['text_length'] = df['clean_text'].str.len()
    
    length_stats = df['text_length'].describe()
    print(f"   평균: {length_stats['mean']:.1f}자")
    print(f"   중앙값: {length_stats['50%']:.1f}자")
    print(f"   최소: {length_stats['min']:.0f}자")
    print(f"   최대: {length_stats['max']:.0f}자")
    
    # 길이 분포
    short_texts = (df['text_length'] <= 3).sum()
    long_texts = (df['text_length'] >= 15).sum()
    print(f"   짧은 텍스트 (≤3자): {short_texts}개")
    print(f"   긴 텍스트 (≥15자): {long_texts}개")
    
    # 8. 카테고리별 평균 텍스트 길이
    print(f"\n📊 카테고리별 평균 텍스트 길이 (상/하위 3개):")
    cat_text_length = df.groupby('category_code')['text_length'].mean().sort_values()
    
    print("   (가장 짧은 카테고리)")
    for cat, avg_len in cat_text_length.head(3).items():
        count = category_counts[cat]
        print(f"   {cat:<25} {avg_len:>5.1f}자 ({count}개)")
    
    print(f"\n   (가장 긴 카테고리)")
    for cat, avg_len in cat_text_length.tail(3).items():
        count = category_counts[cat]
        print(f"   {cat:<25} {avg_len:>5.1f}자 ({count}개)")
    
    # 9. 텍스트 품질 점검
    print(f"\n🔍 텍스트 품질 점검:")
    
    # 특수문자 포함
    special_chars = df['clean_text'].str.contains(r'[^가-힣a-zA-Z0-9\s]').sum()
    print(f"   특수문자 포함: {special_chars}개")
    
    # 숫자만 포함
    numbers_only = df['clean_text'].str.contains(r'^\d+$').sum()
    if numbers_only > 0:
        print(f"   숫자만 포함: {numbers_only}개")
        examples = df[df['clean_text'].str.contains(r'^\d+$')]['clean_text'].head(3).tolist()
        print(f"     예시: {examples}")
    
    # 공백만 포함
    whitespace_only = df['clean_text'].str.contains(r'^\s+$').sum()
    if whitespace_only > 0:
        print(f"   공백만 포함: {whitespace_only}개")
    
    # 10. 데이터셋 요약
    print(f"\n📋 데이터셋 요약:")
    print(f"   ✅ 총 샘플: {len(df):,}개")
    print(f"   ✅ 카테고리: {df['category_code'].nunique()}개")
    print(f"   ✅ 평균 텍스트 길이: {length_stats['mean']:.1f}자")
    print(f"   ⚠️ 부족 카테고리: {len(missing_categories)}개")
    
    # 다음 단계 안내
    if missing_categories:
        print(f"\n💡 다음 단계: python supplement_dataset.py")
        print(f"   부족한 {len(missing_categories)}개 카테고리 보완 필요")
    else:
        print(f"\n💡 다음 단계: python train.py")
        print(f"   데이터셋 품질 우수, 바로 훈련 가능")
    
    return True, missing_categories

if __name__ == "__main__":
    success, missing = analyze_dataset()
    if success:
        print("\n🎉 Step 2 완료!")
    else:
        print("\n❌ Step 2 실패!")
