import google.generativeai as genai
import pandas as pd
import os
import time
from tqdm import tqdm
import re

# --- 설정 ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), 'data')

ORIGINAL_DATASET_PATH = os.path.join(DATA_DIR, 'food_dataset_v4_clean.csv')
SYNTHETIC_DATASET_PATH = os.path.join(DATA_DIR, 'food_dataset_v5_synthetic.csv')

# --- Gemini API 설정 ---
# 환경 변수에서 API 키 로드 (보안을 위해 직접 코드에 넣지 마세요)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    print("❌ 오류: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
    print("   새로운 API 키를 발급받아 환경 변수에 설정해주세요.")
    exit()

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# --- 프롬프트 엔지니어링 ---
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

Generate ONLY the variations, no explanations.
"""
    return prompt

# --- 합성 데이터 생성 함수 ---
def generate_synthetic_dataset(original_csv_path, output_csv_path, num_variations_per_sample=10):
    print("🔄 Gemini API를 이용한 합성 데이터 생성 시작...")

    # 1. 원본 데이터 로드
    try:
        df_original = pd.read_csv(original_csv_path)
        print(f"✅ 원본 데이터셋 로드: {len(df_original):,}개 샘플")
    except FileNotFoundError:
        print(f"❌ 오류: 원본 데이터셋 '{original_csv_path}'을(를) 찾을 수 없습니다.")
        return None
    
    synthetic_data = []
    
    # 2. 합성 데이터 생성 루프
    # tqdm으로 진행률 표시
    for idx, row in tqdm(df_original.iterrows(), total=len(df_original), desc="합성 데이터 생성 중"):
        original_text = row['clean_text']
        category = row['category_code']
        
        # 프롬프트 생성
        prompt = create_synthetic_data_prompt(original_text, category, num_variations_per_sample)
        
        try:
            # Gemini API 호출
            response = model.generate_content(prompt)
            
            # 응답 파싱 및 정제
            variations = response.text.strip().split('\n')
            
            for variation in variations:
                cleaned_variation = variation.strip()
                # 빈 문자열이거나 원본과 동일한 경우 제외 (선택 사항)
                if cleaned_variation and cleaned_variation != original_text:
                    synthetic_data.append({
                        'clean_text': cleaned_variation,
                        'category_code': category,
                        'source': 'gemini_synthetic',
                        'original_text': original_text # 원본 텍스트 추적
                    })
            
            # Rate limiting (무료 티어: 15 RPM = 1분당 15회 요청, 즉 4초에 1회)
            time.sleep(4)
            
        except Exception as e:
            print(f"\n❌ 오류 발생 (원본: '{original_text}'): {e}")
            # 오류 발생 시 해당 샘플은 건너뛰고 다음으로 진행
            continue

    # 3. 합성 데이터를 DataFrame으로 변환
    df_synthetic = pd.DataFrame(synthetic_data)
    print(f"\n✅ 총 {len(df_synthetic):,}개의 합성 샘플 생성 완료.")

    # 4. 원본 데이터와 합성 데이터 병합
    # 원본 데이터에도 'source' 및 'original_text' 컬럼 추가하여 일관성 유지
    df_original['source'] = 'original'
    df_original['original_text'] = df_original['clean_text']
    
    df_combined = pd.concat([df_original, df_synthetic], ignore_index=True)
    
    # 중복 제거 (clean_text 기준으로)
    initial_len = len(df_combined)
    df_combined.drop_duplicates(subset=['clean_text', 'category_code'], inplace=True)
    print(f"✅ 중복 제거 후 최종 샘플 수: {len(df_combined):,}개 (제거된 중복: {initial_len - len(df_combined):,}개)")

    # 5. 최종 데이터셋 저장
    try:
        df_combined.to_csv(output_csv_path, index=False, encoding='utf-8-sig')
        print(f"✅ 최종 데이터셋 '{os.path.basename(output_csv_path)}' 저장 완료.")
    except Exception as e:
        print(f"❌ 오류: 최종 데이터셋 저장 실패: {e}")
        return None
    
    return df_combined

if __name__ == "__main__":
    # 환경 변수에서 API 키를 로드하도록 설정
    # 예: export GEMINI_API_KEY='YOUR_API_KEY' (Linux/macOS)
    #     $env:GEMINI_API_KEY='YOUR_API_KEY' (PowerShell)
    #     set GEMINI_API_KEY=YOUR_API_KEY (CMD) 
    
    # 합성 데이터 생성 실행
    final_dataset = generate_synthetic_dataset(
        ORIGINAL_DATASET_PATH,
        SYNTHETIC_DATASET_PATH,
        num_variations_per_sample=10
    )
    
    if final_dataset is not None:
        print("\n🎉 합성 데이터 생성 파이프라인 완료!")
        print(f"   생성된 파일: {SYNTHETIC_DATASET_PATH}")
        print(f"   총 샘플 수: {len(final_dataset):,}개")
    else:
        print("\n❌ 합성 데이터 생성 파이프라인 실패.")
