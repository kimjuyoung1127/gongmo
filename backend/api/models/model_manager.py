"""
모델 전역 관리자
서버 시작 시 ML 모델을 미리 로드하여 OCR 처리 속도 향상
"""
import os
import pickle
import joblib
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 전역 모델 변수
_global_models = {}

class ModelManager:
    """모델 관리자 싱글톤 클래스"""
    
    def __new__(cls):
        if not hasattr(cls, '_instance'):
            cls._instance = super(ModelManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, 'initialized'):
            self._models = {}
            self.initialized = True
    
    def load_models(self):
        """서버 시작 시 모든 ML 모델 미리 로드"""
        logger.info("모델 로드 시작...")
        
        try:
            # 기본 경로 설정
            models_dir = os.path.dirname(os.path.abspath(__file__))
            logger.info(f"모델 디렉토리: {models_dir}")
            
            # 모델 파일 경로
            model_path = os.path.join(models_dir, 'item_classifier_final.pkl')
            vectorizer_path = os.path.join(models_dir, 'vectorizer_final.pkl')
            
            if os.path.exists(model_path) and os.path.exists(vectorizer_path):
                # joblib 우선 시도
                try:
                    logger.info("joblib으로 모델 로드 시도...")
                    self._models['classifier'] = joblib.load(model_path)
                    self._models['vectorizer'] = joblib.load(vectorizer_path)
                    logger.info("joblib 모델 로드 성공!")
                except Exception as e:
                    logger.warning(f"joblib 실패: {str(e)}, pickle로 fallback...")
                    try:
                        self._models['classifier'] = pickle.load(open(model_path, 'rb'))
                        self._models['vectorizer'] = pickle.load(open(vectorizer_path, 'rb'))
                        logger.info("pickle 모델 로드 성공!")
                    except Exception as e2:
                        logger.error(f"pickle도 실패: {str(e2)}")
                        return False
                
                # Okt 형태소 분석기 로드
                try:
                    from konlpy.tag import Okt
                    self._models['okt'] = Okt()
                    logger.info("Okt 형태소 분석기 로드 성공!")
                except Exception as e:
                    logger.warning(f"Okt 로드 실패: {str(e)}")
                    return False
                
                # 카테고리 매핑 로드
                self._load_category_mapping()
                
                logger.info("✅ 모든 모델 로드 완료!")
                return True
            else:
                logger.error(f"모델 파일 없음: {model_path} 또는 {vectorizer_path}")
                return False
                
        except Exception as e:
            logger.error(f"모델 로드 실패: {str(e)}")
            return False
    
    def _load_category_mapping(self):
        """카테고리 매핑 로드"""
        category_mapping = {
            'BAKERY_CREAM_SANDWICH': '빵과과자',
            'BERRIES': '과일',
            'BEVERAGE_REFRIGERATED': '음료',
            'BEVERAGE_SHELF_STABLE': '음료',
            'BREAD_GENERAL': '빵과과자',
            'CANNED_DRY_GOODS': '가공식품',
            'CITRUS': '과일',
            'DAIRY_FRESH': '유제품',
            'DAIRY_PROCESSED': '유제품',
            'DRIED_NOODLES': '가공식품',
            'DRY_SEAWEED': '해산물',
            'EGGS': '유제품',
            'ETC': '기타',
            'FISH_FRESH': '해산물',
            'FRESH_NOODLES': '가공식품',
            'FRESH_SEAWEED': '해산물',
            'FROZEN_FOOD': '냉동식품',
            'FRUIT_GENERAL': '과일',
            'FRUIT_VEGETABLES': '채소',
            'GRAINS_RICE': '가공식품',
            'HARD_CHEESE': '유제품',
            'LEAFY_VEGETABLES': '채소',
            'MEAT_FRESH': '정육',
            'MEAT_PROCESSED': '정육',
            'MOLLUSCS_CRUSTACEANS': '해산물',
            'MUSHROOMS': '채소',
            'PICKLED_VEGETABLES': '채소',
            'READY_MEALS_FROZEN': '냉동식품',
            'READY_MEALS_REFRIGERATED': '가공식품',
            'ROOT_VEGETABLES': '채소',
            'SAUCES_SEASONINGS': '조미료',
            'SHELLFISH': '해산물',
            'SNACKS': '빵과과자',
            'SOFT_CHEESE': '유제품',
            'SPROUTS': '채소',
            'STEM_VEGETABLES': '채소',
            'TROPICAL_FRUIT': '과일'
        }
        self._models['category_mapping'] = category_mapping
    
    def get_model(self, model_name):
        """로드된 모델 반환"""
        return self._models.get(model_name)
    
    def get_models_loaded(self):
        """모델 로드 상태 확인"""
        return len(self._models) > 0

# 전역 인스턴스
model_manager = ModelManager()

# 서버 시작 시 모델 로드 함수
def initialize_models():
    """서버 시작 시 모델 초기화"""
    return model_manager.load_models()
