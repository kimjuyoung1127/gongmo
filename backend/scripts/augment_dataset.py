#!/usr/bin/env python3
"""
데이터셋 증강 스크립트 (v3)

- 모델 성능 저하 문제 해결을 위해 데이터 증강 전략을 수정합니다. (Phase 4, Action 4.1)
- categories_master.csv를 단일 진실 원천으로 사용합니다.
- food_dataset_v4_clean.csv를 기반으로 **구조적이고 예측 가능한 노이즈**를 적용하여 데이터 증강을 수행합니다.
- 최종적으로 food_dataset_v5_augmented.csv를 생성합니다.
"""

import pandas as pd
import os
import random

# --- 설정 ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'data')

MASTER_CATEGORIES_PATH = os.path.join(DATA_DIR, 'categories_master.csv')
CLEAN_DATASET_PATH = os.path.join(DATA_DIR, 'food_dataset_v4_clean.csv')
AUGMENTED_DATASET_PATH = os.path.join(DATA_DIR, 'food_dataset_v5_augmented.csv') # v5로 변경

TARGET_SAMPLE_COUNT = 15  # 카테고리별 목표 샘플 수 (10개 이상 보장, 15개로 설정)

def generate_structured_noise(text):
    """주어진 텍스트에 예측 가능한 구조적 노이즈를 추가"""
    # 모델이 학습해야 할 핵심적이고 현실적인 패턴 위주로 제한
    patterns = [
        f"(PB){text}",
        f"행사){text}",
        f"{text} 대용량",
        f"{text} 1+1",
        f"신선코너 {text}",
        f"{text}*2",
        f"{text} 500G"
    ]
    return random.choice(patterns)

def augment_dataset():
    print("🔄 데이터셋 증강 시작 (v3 - 구조적 노이즈)...")

    # 1. 단일 진실 원천(Master Categories) 로드
    try:
        print(f"📁 '{os.path.basename(MASTER_CATEGORIES_PATH)}' 로드 중...")
        master_categories_df = pd.read_csv(MASTER_CATEGORIES_PATH)
        standard_categories = set(master_categories_df['category_code'])
        print(f"✅ 표준 카테고리: {len(standard_categories)}개 로드 완료")
    except FileNotFoundError:
        print(f"❌ 치명적 오류: '{MASTER_CATEGORIES_PATH}' 파일을 찾을 수 없습니다.")
        return

    # 2. 정제된 데이터셋 로드
    try:
        print(f"📁 '{os.path.basename(CLEAN_DATASET_PATH)}' 로드 중...")
        clean_df = pd.read_csv(CLEAN_DATASET_PATH)
        # 원본 데이터는 항상 포함되도록 보장
        print(f"✅ 정제된 데이터셋: {len(clean_df)}개 샘플 (이들은 최종 데이터셋에 모두 포함됩니다)")
    except FileNotFoundError:
        print(f"❌ 치명적 오류: '{CLEAN_DATASET_PATH}' 파일을 찾을 수 없습니다.")
        return

    # 3. 카테고리별 샘플 수 분석
    category_counts = clean_df['category_code'].value_counts()
    
    # 4. 데이터 증강
    augmented_data = []
    print("\n🔬 부족한 카테고리 데이터 증강 중...")
    
    for category in sorted(list(standard_categories)):
        count = category_counts.get(category, 0)
        
        # 원본 데이터가 목표치보다 많으면, 증강하지 않고 원본만 사용
        if count >= TARGET_SAMPLE_COUNT:
            continue
            
        needed = TARGET_SAMPLE_COUNT - count
        
        # 해당 카테고리의 기존 샘플을 기반으로 증강
        base_samples = clean_df[clean_df['category_code'] == category]['clean_text'].tolist()
        
        if not base_samples:
            print(f"   ⚠️ 경고: '{category}'에 대한 기본 샘플이 없어 증강할 수 없습니다.")
            continue
            
        new_samples = []
        # 증강 시 중복을 피하기 위해 기존 샘플 + 새 샘플을 추적
        existing_texts = set(base_samples)

        while len(new_samples) < needed:
            base_text = random.choice(base_samples)
            noisy_text = generate_structured_noise(base_text)
            
            # 생성된 노이즈 텍스트가 기존에 없다면 추가
            if noisy_text not in existing_texts:
                new_samples.append((noisy_text, category))
                existing_texts.add(noisy_text)
        
        augmented_data.extend(new_samples)
        print(f"   - {category:<25} | 현재: {count:>3}개 | 추가: {len(new_samples):>3}개")

    # 5. 증강된 데이터를 DataFrame으로 변환
    augmented_df = pd.DataFrame(augmented_data, columns=['clean_text', 'category_code'])
    if not augmented_df.empty:
        print(f"\n✅ 총 {len(augmented_df)}개의 새로운 샘플 생성")
    else:
        print("\n✅ 모든 카테고리가 목표 샘플 수를 충족하여 추가 증강이 필요 없습니다.")

    # 6. 기존 데이터와 병합
    # clean_df (원본)은 항상 포함되므로, 데이터 유실 없음
    print("🔗 원본 데이터와 증강 데이터 병합 중...")
    final_df = pd.concat([clean_df, augmented_df], ignore_index=True)
    
    # 최종 데이터셋에서 중복 제거 (혹시 모를 경우 대비)
    final_df.drop_duplicates(subset=['clean_text'], inplace=True, keep='first')

    # 7. 최종 결과 저장
    try:
        print(f"\n💾 '{os.path.basename(AUGMENTED_DATASET_PATH)}' 저장 중...")
        final_df.to_csv(AUGMENTED_DATASET_PATH, index=False)
        print(f"✅ 저장 완료: {AUGMENTED_DATASET_PATH}")
        print(f"   - 최종 샘플 수: {len(final_df)}개")
        print(f"   - 최종 카테고리 수: {final_df['category_code'].nunique()}개")
    except Exception as e:
        print(f"❌ 저장 실패: {e}")
        return

    print("\n🎉 데이터 증강 완료!")

if __name__ == "__main__":
    augment_dataset()