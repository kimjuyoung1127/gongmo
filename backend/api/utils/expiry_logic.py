import requests
import json
import csv
import os
from datetime import datetime, timedelta

# --- 카테고리 매핑 헬퍼 함수 (DB 기반) ---
_category_map_by_code_cache = None
_supabase_client = None

def set_supabase_client_for_categories(supabase_client):
    """카테고리 조회를 위한 Supabase 클라이언트 설정"""
    global _supabase_client
    _supabase_client = supabase_client

def _load_category_map_from_db():
    """
    Supabase DB에서 카테고리 정보를 로드하여 캐싱합니다.
    """
    if not _supabase_client:
        print("Warning: Supabase 클라이언트가 설정되지 않았습니다. 기본 카테고리 매핑을 사용합니다.")
        return {'기타': {'id': 37, 'code': 'ETC', 'expiry_days': 7}}  # ETC ID 기본값
    
    try:
        # categories 테이블에서 모든 카테고리 조회
        response = _supabase_client.table('categories').select('*').execute()
        
        if response.data:
            category_map = {}
            for row in response.data:
                category_map[row['category_name_kr']] = {
                    "id": row['id'],
                    "code": row['category_code'],
                    "expiry_days": row['default_expiry_days']
                }
            print(f"Info: DB에서 {len(category_map)}개의 카테고리를 성공적으로 로드했습니다.")
            return category_map
        else:
            print("Warning: DB에서 카테고리를 찾을 수 없습니다. 기본 매핑을 사용합니다.")
            return {'기타': {'id': 37, 'code': 'ETC', 'expiry_days': 7}}
            
    except Exception as e:
        print(f"Error: DB 카테고리 로드 중 오류 발생: {e}")
        return {'기타': {'id': 37, 'code': 'ETC', 'expiry_days': 7}}

def _get_category_info_by_name(category_name: str):
    """
    카테고리 이름을 기반으로 ID, 코드, 유통기한을 조회합니다.
    """
    global _category_map_by_code_cache
    if _category_map_by_code_cache is None:
        _category_map_by_code_cache = _load_category_map_from_db()
    
    category_info = _category_map_by_code_cache.get(category_name)
    if category_info:
        return category_info
    else:
        # 기본값으로 '기타' 카테고리 반환
        return {'id': 37, 'code': 'ETC', 'expiry_days': 7}

def _get_category_id_by_name(category_name: str):
    """기존 호환성을 위한 wrapper 함수"""
    category_info = _get_category_info_by_name(category_name)
    return category_info['id']

def _get_category_expiry_days(category_name: str):
    """카테고리 유통기한 조회"""
    category_info = _get_category_info_by_name(category_name)
    return category_info['expiry_days']