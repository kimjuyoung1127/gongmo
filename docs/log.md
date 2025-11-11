# AI 식료품 관리 앱 개발을 위한 오픈소스 딥 리서치 보고서

본 보고서는 Python/Flask 백엔드, React Native 프론트엔드, Supabase 데이터베이스 기반의 AI 식료품 관리 앱 개발을 위한 최고 수준의 오픈소스 솔루션을 제시합니다. 특히 유료 API 의존성을 줄이고, 사용자 피드백 기반의 AI 모델 개선 파이프라인 구축에 중점을 두었습니다.

## 1. 백엔드 OCR: 한글 영수증 인식을 위한 최적 솔루션

### 1.1 PaddleOCR - 최우수 추천 솔루션

**PaddleOCR**은 중국 Baidu가 개발한 고성능 OCR 프레임워크로, 한글 영수증 인식에서 가장 뛰어난 성능을 보입니다.[1][2][3]

#### 핵심 특징
- **탁월한 한글 인식률**: 한국어 텍스트 인식에서 95% 이상의 정확도를 기록하며, EasyOCR과 Tesseract를 크게 능가합니다.[4][1]
- **초경량 모델**: PP-OCRv2 전체 모델(탐지+인식+분류)이 단 17MB로, 모바일 및 임베디드 환경에서도 배포 가능합니다.[3][5]
- **완전한 파이프라인**: 텍스트 탐지(Text Detection), 문자 인식(Text Recognition), 각도 분류(Angle Classification)를 포함한 End-to-End OCR 파이프라인을 제공합니다.[2]
- **다국어 지원**: PP-OCRv5는 한국어를 포함한 109개 언어를 지원하며, 80개 이상의 언어에 대한 사전 학습 모델을 제공합니다.[5][3]

#### 프로젝트 적용성
PaddleOCR은 한글 영수증의 복잡한 레이아웃과 작은 글씨를 정확하게 인식할 수 있으며, 유료 Clova OCR API를 완전히 대체할 수 있는 최고의 선택입니다. Python Flask 백엔드와의 통합이 간단하며, 다음과 같이 사용할 수 있습니다:[1][4]

```python
from paddleocr import PaddleOCR

# 한국어 모델 초기화
ocr = PaddleOCR(lang='korean')

# 영수증 이미지 OCR 수행
result = ocr.ocr('receipt.jpg', cls=True)

# 텍스트 추출
text_only = [line[1][0] for res in result for line in res]
```

**GitHub**: https://github.com/PaddlePaddle/PaddleOCR

### 1.2 EasyOCR - 차선책

**EasyOCR**은 JaidedAI에서 개발한 PyTorch 기반 OCR 라이브러리로, 사용이 간편하지만 한글 인식률은 PaddleOCR에 비해 낮습니다.[6][7][8]

#### 핵심 특징
- **간편한 API**: Python에서 몇 줄의 코드만으로 OCR을 구현할 수 있습니다.[6]
- **한글 지원**: 80개 이상의 언어를 지원하며, 한글 인식률은 약 93%(전이학습 적용 시)입니다.[7][8]
- **CRAFT + CRNN 아키텍처**: CRAFT 모델로 텍스트를 탐지하고, CRNN으로 문자를 인식합니다.[9]

#### 한계점
- 한글 인식률이 PaddleOCR보다 낮으며, 특히 이중 모음 인식에 약점이 있습니다.[8]
- 특수문자(따옴표 등)를 거의 인식하지 못합니다.[8]
- PaddleOCR에 비해 처리 속도가 느립니다.[4]

**GitHub**: https://github.com/JaidedAI/EasyOCR

### 1.3 Tesseract OCR - 권장하지 않음

**Tesseract OCR**은 Google이 개발한 오픈소스 OCR 엔진이지만, 한글 인식에는 부적합합니다.[10][11][12]

#### 주요 문제점
- **극히 낮은 한글 인식률**: 한국어 번호판 인식 테스트에서 단 12.5%의 정확도를 기록했습니다.[13]
- **Hangul 특성 미지원**: 특히 왼쪽에 세로선이 있는 한글 자모(ㄱ, ㄴ, ㄷ 등)를 제대로 인식하지 못합니다.[14][10]
- **영문+한글 혼용 문제**: 한글과 영어가 섞인 텍스트에서 성능이 크게 저하됩니다.[14]

**GitHub**: https://github.com/tesseract-ocr/tesseract

### 1.4 최종 권장사항

**PaddleOCR**을 한글 영수증 OCR의 1순위 솔루션으로 강력히 권장합니다. 95% 이상의 한글 인식률, 17MB의 초경량 모델, 빠른 처리 속도를 제공하며, Clova OCR API를 완전히 대체할 수 있습니다. Flask 백엔드에 통합이 용이하고, CPU 환경에서도 실시간 처리가 가능합니다.[2][3][1][4]

## 2. 백엔드 상품 데이터베이스: 바코드 조회 솔루션

### 2.1 Open Food Facts - 글로벌 식품 데이터베이스

**Open Food Facts**는 전 세계 300만 개 이상의 식품 정보를 제공하는 오픈소스 데이터베이스입니다.[15][16][17]

#### 핵심 특징
- **방대한 데이터**: 350만 개 이상의 식품 바코드 정보를 보유하고 있습니다.[18][15]
- **Python SDK 제공**: `openfoodfacts` 패키지로 간편하게 API를 사용할 수 있습니다.[19][20]
- **무료 및 오픈소스**: 완전 무료이며, 사용자가 직접 제품을 추가할 수 있습니다.[21][15]
- **풍부한 정보**: 제품명, 성분, 영양 정보, 알레르기 유발 물질, Nutri-Score, Eco-Score 등을 제공합니다.[16][15]

#### 사용 예시
```python
import openfoodfacts

api = openfoodfacts.API(user_agent="FoodManagementApp/1.0")

# 바코드로 제품 조회
code = "8801234567890"
product = api.product.get(code, fields=["code", "product_name", "categories"])

# 텍스트 검색
results = api.product.text_search("김치")
```

#### 한계점
- **한국 제품 커버리지 제한**: 주로 유럽과 미국 제품이 많으며, 한국 식품의 등록률은 상대적으로 낮습니다.[20][22]
- **데이터 품질**: 사용자 기여 방식이므로 정보의 정확성과 완전성을 보장하기 어렵습니다.[15]

**GitHub**: https://github.com/openfoodfacts/openfoodfacts-python  
**Website**: https://world.openfoodfacts.org/

### 2.2 식품안전나라 API - 한국 공식 데이터베이스

**식품안전나라**는 대한민국 식품의약품안전처(식약처)가 운영하는 공식 식품 정보 데이터베이스입니다.[23][24]

#### 핵심 특징
- **공식 정부 데이터**: 식약처의 공식 데이터로 신뢰성이 높습니다.[23]
- **한국 제품 특화**: 한국에서 판매되는 식품에 대한 가장 완전한 정보를 제공합니다.[23]
- **품목유형코드**: 식품의 상세 분류 정보를 제공합니다.[23]
- **제조사 정보**: 제조업체 및 사업자 정보를 포함합니다.[24][23]

#### API 특징
- OpenAPI 형태로 제공되며, XML 또는 JSON 형식으로 데이터를 받을 수 있습니다.[23]
- 인증키를 발급받아 사용해야 합니다.[23]

**Website**: https://www.foodsafetykorea.go.kr/api

### 2.3 푸드QR (FoodQR) - 신규 플랫폼

**푸드QR**은 식약처가 2024년 11월부터 본격 시행한 실시간 식품정보 확인 서비스입니다.[25]

#### 핵심 특징
- **QR 기반 정보 제공**: QR 코드를 스캔하여 제품의 원재료, 소비기한 등을 확인합니다.[25]
- **바코드 지원**: 바코드 기반 조회도 지원합니다.[25]
- **확장 계획**: 2024년 국내 제조식품, 2025년 수입식품, 2026년 모든 식품으로 확대 예정입니다.[25]

#### 현재 한계
- **제한적 데이터**: 현재 354건의 제품만 등록되어 있습니다(2024년 기준).[25]
- **초기 단계**: 서비스 초기 단계로 API 제공 여부가 불명확합니다.[25]

**Website**: https://portal.foodqr.kr

### 2.4 최종 권장사항

**하이브리드 전략**을 권장합니다:
1. **1차 데이터소스**: 식품안전나라 API를 한국 제품 조회의 주요 소스로 사용합니다.[24][23]
2. **2차 데이터소스**: Open Food Facts를 국제 제품 및 식품안전나라에서 조회되지 않는 제품의 대체 소스로 사용합니다.[19][15]
3. **사용자 기여**: 두 DB에서 찾을 수 없는 제품은 사용자가 직접 등록하도록 하고, 이를 Supabase 자체 DB에 저장합니다.

이 전략은 한국 제품에 대한 높은 커버리지를 확보하면서도, 국제 제품까지 지원할 수 있는 최적의 방법입니다.[15][23]

## 3. 프론트엔드 React Native SDK

### 3.1 바코드 스캐너 라이브러리

#### 3.1.1 react-native-vision-camera - 최우수 추천

**react-native-vision-camera**는 고성능 카메라 기능을 제공하는 React Native 라이브러리입니다.[26][27]

##### 핵심 특징
- **내장 바코드 스캐너**: `useCodeScanner` 훅으로 간편하게 바코드를 스캔할 수 있습니다.[27][26]
- **고성능**: v4에서 iOS 바코드 스캔 성능이 대폭 개선되어 Android와 동등한 수준을 달성했습니다.[28]
- **다양한 바코드 지원**: QR, EAN-13, Code-128, UPC-A 등 다양한 바코드 형식을 지원합니다.[26][27]
- **고급 기능**: 줌, 토치, 오토포커스, 프레임 프로세서 등을 지원합니다.[29][26]

##### 사용 예시
```javascript
import { Camera, useCodeScanner, useCameraDevice } from 'react-native-vision-camera';

const device = useCameraDevice('back');

const codeScanner = useCodeScanner({
  codeTypes: ['qr', 'ean-13', 'code-128'],
  onCodeScanned: (codes) => {
    console.log(`Scanned ${codes.length} codes!`);
    const barcode = codes[0]?.value;
    // 바코드 처리 로직
  }
});

return (
  <Camera
    device={device}
    codeScanner={codeScanner}
    isActive={true}
  />
);
```

##### 성능 이슈 해결
- **v3의 iOS 문제**: v3에서 iOS의 바코드 스캔 속도가 Android보다 10배 이상 느린 문제가 있었습니다.[28]
- **v4의 개선**: v4.0.1부터 iOS 성능이 크게 개선되어, 이제 Android와 동등한 속도로 바코드를 스캔합니다.[28]

**NPM**: https://www.npmjs.com/package/react-native-vision-camera  
**GitHub**: https://github.com/mrousavy/react-native-vision-camera

#### 3.1.2 대체 솔루션

**@mgcrea/vision-camera-barcode-scanner**: react-native-vision-camera의 프레임 프로세서 플러그인으로, iOS에서 MLKit을 사용하여 더 나은 성능을 제공합니다. iOS에서 AVFoundation 대신 Vision API를 사용하여 바코드 인식률이 높습니다.[30][31][28]

**expo-camera**: Expo 프로젝트를 사용하는 경우, `expo-camera`의 바코드 스캔 기능을 사용할 수 있습니다. 통합이 간편하지만, react-native-vision-camera보다 기능이 제한적입니다.[32][33][34][29]

### 3.2 온디바이스 OCR 라이브러리

#### 3.2.1 @react-native-ml-kit/text-recognition - 권장

**@react-native-ml-kit/text-recognition**은 Google ML Kit의 텍스트 인식 기능을 React Native에서 사용할 수 있게 하는 라이브러리입니다.[35][36]

##### 핵심 특징
- **한국어 지원**: `TextRecognitionScript.KOREAN`을 지정하여 한글 텍스트를 인식할 수 있습니다.[37][35]
- **온디바이스 처리**: 서버 통신 없이 기기에서 직접 OCR을 수행하여 빠르고 프라이버시를 보호합니다.[38][35]
- **간편한 API**: 이미지 URI를 입력하면 인식된 텍스트를 반환합니다.[35]
- **블록/라인/요소 단위 정보**: 텍스트의 계층적 구조 정보를 제공합니다.[35]

##### 사용 예시
```javascript
import TextRecognition, { TextRecognitionScript } from '@react-native-ml-kit/text-recognition';

const result = await TextRecognition.recognize(
  imageURL,
  TextRecognitionScript.KOREAN
);

console.log('인식된 텍스트:', result.text);

// 블록 단위 처리
for (let block of result.blocks) {
  console.log('블록 텍스트:', block.text);
  console.log('블록 위치:', block.frame);
}
```

##### 프로젝트 적용성
서버 부하를 줄이기 위해 간단한 텍스트는 모바일 기기에서 직접 처리할 수 있습니다. 복잡한 영수증은 서버의 PaddleOCR로 처리하고, 단순한 텍스트(예: 상품명 확인)는 온디바이스 OCR로 처리하는 하이브리드 전략을 권장합니다.[38][35]

**NPM**: https://www.npmjs.com/package/@react-native-ml-kit/text-recognition  
**GitHub**: https://github.com/a7medev/react-native-ml-kit

#### 3.2.2 대체 솔루션

**react-native-mlkit-ocr**: 또 다른 MLKit 기반 OCR 라이브러리로, URI와 파일 경로를 모두 지원합니다. API가 더 단순하지만, 스크립트별 언어 지정 기능은 제한적입니다.[39][40]

### 3.3 최종 권장사항

1. **바코드 스캐너**: **react-native-vision-camera v4**를 사용하여 iOS와 Android에서 모두 빠르고 정확한 바코드 스캔을 구현합니다. Expo를 사용하는 경우에만 expo-camera를 고려합니다.[34][32][26][28]

2. **온디바이스 OCR**: **@react-native-ml-kit/text-recognition**을 사용하여 간단한 텍스트 인식은 기기에서 처리하고, 복잡한 영수증 OCR은 서버의 PaddleOCR로 처리하는 하이브리드 전략을 권장합니다.[38][35]

## 4. AI 모델 고도화: 사용자 피드백 기반 재학습 파이프라인

정적인 `model.pkl`을 사용자 피드백으로 지속적으로 개선하는 MLOps 파이프라인 구축을 위한 오픈소스 도구를 소개합니다.

### 4.1 데이터 레이블링 및 피드백 수집

#### 4.1.1 Label Studio - 최우수 추천

**Label Studio**는 오픈소스 데이터 레이블링 플랫폼으로, 사용자 피드백을 체계적으로 수집하고 관리할 수 있습니다.[41][42][43][44][45]

##### 핵심 특징
- **다양한 데이터 타입 지원**: 텍스트, 이미지, 오디오 등 다양한 데이터 타입의 레이블링을 지원합니다.[44][45]
- **사용자 수정 워크플로우**: AI 분류 결과를 사용자가 검토하고 수정하는 워크플로우를 구축할 수 있습니다.[42][46]
- **ML 백엔드 통합**: 기존 모델의 예측을 pre-label로 제공하고, 사용자가 수정하는 human-in-the-loop 방식을 지원합니다.[43][42]
- **품질 관리**: Reviewer 워크플로우, 합의 점수, 주석자 성능 추적 등을 제공합니다.[46][47][43]
- **액티브 러닝**: 불확실한 예측을 우선적으로 사용자에게 제시하는 액티브 러닝을 지원합니다.[42][43]
- **데이터 내보내기**: 레이블링된 데이터를 다양한 형식으로 내보내 재학습에 활용할 수 있습니다.[45][41]

##### 프로젝트 적용 방법
1. Supabase의 `receipt_items` 테이블에서 AI가 분류한 데이터를 가져옵니다.
2. Label Studio에서 사용자가 잘못된 분류를 수정합니다(예: '새송이버섯' → '버섯류').
3. 수정된 데이터를 학습 데이터로 내보내 `model.pkl` 재학습에 사용합니다.

**GitHub**: https://github.com/heartexlabs/label-studio  
**Website**: https://labelstud.io/

#### 4.1.2 대체 솔루션

**doccano**: 텍스트 전용 어노테이션 도구로, 분류, 시퀀스 라벨링, seq2seq 작업을 지원합니다. Label Studio보다 기능이 제한적이지만, 텍스트 분류에 특화되어 있습니다.

### 4.2 ML 실험 추적 및 모델 관리

#### 4.2.1 MLflow - 필수 도구

**MLflow**는 머신러닝 실험 추적, 모델 버전 관리, 배포를 위한 오픈소스 플랫폼입니다.[48][49][50][51]

##### 핵심 특징
- **scikit-learn 자동 로깅**: `mlflow.sklearn.autolog()`로 학습 과정과 메트릭을 자동으로 기록합니다.[50][48]
- **모델 버전 관리**: 여러 버전의 `model.pkl`을 추적하고 비교할 수 있습니다.[49][48]
- **실험 추적**: 하이퍼파라미터, 메트릭, 아티팩트를 체계적으로 기록합니다.[48][49]
- **모델 레지스트리**: 프로덕션 배포를 위한 모델 관리 기능을 제공합니다.[49][50]
- **Flask 통합**: Python/Flask 스택과 완벽하게 통합됩니다.[48][49]

##### 사용 예시
```python
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier

# 자동 로깅 활성화
mlflow.sklearn.autolog()

# 실험 시작
with mlflow.start_run():
    # 모델 학습
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)
    
    # 평가
    accuracy = model.score(X_test, y_test)
    
    # 모델 저장
    mlflow.sklearn.log_model(model, "model")
```

##### 재학습 파이프라인 구축
1. 사용자 피드백이 일정량 쌓이면 MLflow로 새 실험을 시작합니다.
2. 새로운 데이터로 `model.pkl`을 재학습하고 성능을 기록합니다.
3. 이전 모델과 성능을 비교하여 개선 여부를 확인합니다.
4. 성능이 향상되면 MLflow Model Registry에서 새 모델을 프로덕션으로 승격합니다.

**GitHub**: https://github.com/mlflow/mlflow  
**Website**: https://mlflow.org

### 4.3 데이터 버전 관리

#### 4.3.1 DVC (Data Version Control)

**DVC**는 Git과 유사한 방식으로 데이터셋과 모델을 버전 관리하는 오픈소스 도구입니다.[52][53][54][55][56]

##### 핵심 특징
- **Git 통합**: Git과 함께 사용하여 코드와 데이터를 동시에 버전 관리합니다.[53][54][52]
- **원격 스토리지**: S3, GCS, Azure 등에 데이터를 저장하고 필요할 때만 다운로드합니다.[54][52]
- **파이프라인 관리**: `dvc.yaml`로 ML 파이프라인을 정의하고 재현 가능하게 관리합니다.[52][54]
- **실험 재현**: 특정 시점의 데이터셋과 모델을 정확하게 재현할 수 있습니다.[53][52]

##### 프로젝트 적용 방법
```bash
# 데이터셋 추적 시작
dvc add training_data.csv

# Git에 메타데이터 커밋
git add training_data.csv.dvc
git commit -m "Add v1 training data"

# 재학습 후 새 버전 추가
dvc add training_data.csv
git add training_data.csv.dvc
git commit -m "Add v2 training data with user feedback"

# 이전 버전으로 롤백
git checkout v1.0 training_data.csv.dvc
dvc checkout
```

**GitHub**: https://github.com/iterative/dvc  
**Website**: https://dvc.org

### 4.4 모델 성능 모니터링 및 드리프트 탐지

#### 4.4.1 Evidently AI - 권장

**Evidently AI**는 ML 모델의 성능을 모니터링하고 데이터 드리프트를 탐지하는 오픈소스 라이브러리입니다.[57][58][59][60]

##### 핵심 특징
- **성능 모니터링**: 모델 정확도, 정밀도, 재현율 등을 실시간으로 추적합니다.[59][61]
- **데이터 드리프트 탐지**: 입력 데이터의 분포가 학습 데이터와 달라졌는지 감지합니다.[58][57][59]
- **리포트 생성**: 시각적 리포트와 대시보드를 생성합니다.[60][59]
- **재학습 트리거**: 성능 저하 시 자동으로 재학습을 트리거할 수 있습니다.[61][62]

##### 프로젝트 적용 방법
```python
from evidently.report import Report
from evidently.metric_preset import DataDriftPreset

# 참조 데이터(학습 데이터)와 현재 데이터(프로덕션 데이터) 비교
report = Report(metrics=[DataDriftPreset()])
report.run(reference_data=train_df, current_data=production_df)

# 드리프트 감지 시 재학습 트리거
if report.metrics[0].result().drift_detected:
    trigger_retraining()
```

**GitHub**: https://github.com/evidentlyai/evidently  
**Website**: https://evidentlyai.com

#### 4.4.2 대체 솔루션

**Alibi Detect**: TensorFlow와 PyTorch를 지원하는 드리프트 탐지 라이브러리로, 통계적 테스트(KS test, MMD)를 제공합니다. scikit-learn 기반 프로젝트에는 Evidently AI가 더 적합합니다.[63][64][57][58]

### 4.5 액티브 러닝

#### 4.5.1 modAL

**modAL**은 scikit-learn과 완벽하게 호환되는 액티브 러닝 프레임워크입니다.[65][66][67][68][69]

##### 핵심 특징
- **scikit-learn 호환**: 기존 scikit-learn 모델을 그대로 사용할 수 있습니다.[66][67][65]
- **쿼리 전략**: 가장 불확실한 샘플을 선택하여 레이블링 효율을 높입니다.[65][66]
- **모듈식 설계**: 커스텀 쿼리 전략을 쉽게 구현할 수 있습니다.[69][66][65]

##### 프로젝트 적용 방법
```python
from modAL.models import ActiveLearner
from sklearn.naive_bayes import MultinomialNB

# 액티브 러너 초기화
learner = ActiveLearner(
    estimator=MultinomialNB(),
    X_training=X_initial,
    y_training=y_initial
)

# 가장 불확실한 샘플 쿼리
query_idx, query_inst = learner.query(X_unlabeled)

# 사용자 레이블 획득 후 학습
learner.teach(X_unlabeled[query_idx], y_new)
```

**GitHub**: https://github.com/modAL-python/modAL

### 4.6 워크플로우 오케스트레이션 (선택사항)

#### 4.6.1 Apache Airflow

**Apache Airflow**는 데이터 및 ML 파이프라인을 오케스트레이션하는 플랫폼입니다.[70][71][72][73]

##### 핵심 특징
- **DAG 기반 워크플로우**: Python으로 복잡한 파이프라인을 정의할 수 있습니다.[72][70]
- **스케줄링**: 주기적인 재학습을 자동화합니다.[74][70]
- **다양한 통합**: MLflow, SageMaker, Databricks 등과 통합됩니다.[70][72]
- **모니터링 및 알림**: 파이프라인 실행 상태를 추적하고 알림을 보냅니다.[73][70]

**GitHub**: https://github.com/apache/airflow

#### 4.6.2 Kubeflow Pipelines

**Kubeflow Pipelines**는 Kubernetes 기반 ML 파이프라인 플랫폼입니다.[75][76][77][78]

##### 핵심 특징
- **컨테이너 기반**: 각 단계를 Docker 컨테이너로 실행합니다.[77][75]
- **Kubernetes 네이티브**: K8s 환경에서 자동 확장과 고가용성을 제공합니다.[76][75]
- **실험 추적**: 파이프라인 실행 기록을 추적합니다.[78][77]

**GitHub**: https://github.com/kubeflow/pipelines

### 4.7 데이터 검증

#### 4.7.1 Great Expectations

**Great Expectations**는 데이터 품질을 검증하는 Python 라이브러리입니다.[79][80][81][82][83]

##### 핵심 특징
- **Expectation 기반**: 데이터에 대한 기대치를 정의하고 검증합니다.[80][81][79]
- **파이프라인 통합**: ML 파이프라인의 각 단계에서 데이터 품질을 검증합니다.[79][80]
- **리포트 생성**: 검증 결과를 HTML 리포트로 생성합니다.[80][79]

**GitHub**: https://github.com/great-expectations/great_expectations  
**Website**: https://greatexpectations.io

### 4.8 권장 MLOps 파이프라인 구조

프로젝트에 단계적으로 적용 가능한 파이프라인을 제안합니다:

#### Phase 1: 피드백 수집 (필수)
- **Label Studio**를 사용하여 Supabase `receipt_items` 테이블의 AI 분류 결과를 사용자가 수정할 수 있는 인터페이스를 구축합니다.[41][45][42]
- 수정된 데이터를 학습 데이터로 내보냅니다.[45][41]

#### Phase 2: 실험 추적 (필수)
- **MLflow**를 설정하여 재학습 실험을 추적합니다.[50][49][48]
- 사용자 피드백이 100개 이상 쌓이면 재학습을 실행하고, 성능을 이전 모델과 비교합니다.[49][48]
- 성능이 향상되면 새 `model.pkl`을 프로덕션에 배포합니다.[48][49]

#### Phase 3: 데이터 버전 관리 (권장)
- **DVC**를 사용하여 학습 데이터셋의 버전을 추적합니다.[54][52][53]
- 각 재학습 시점의 데이터를 재현 가능하게 관리합니다.[52][53]

#### Phase 4: 성능 모니터링 (권장)
- **Evidently AI**로 프로덕션 모델의 분류 정확도를 모니터링합니다.[57][59][61]
- 정확도가 임계값 이하로 떨어지면 자동으로 재학습을 트리거합니다.[62][61]

#### Phase 5: 고급 최적화 (선택)
- **modAL**을 사용하여 가장 불확실한 예측을 우선적으로 사용자에게 제시하여 레이블링 효율을 높입니다.[66][69][65]
- **Apache Airflow** 또는 **Kubeflow Pipelines**로 전체 파이프라인을 자동화합니다.[77][70]

### 4.9 최종 권장사항

**최소 구성(MVP)**: Label Studio + MLflow를 사용하여 피드백 수집과 재학습 파이프라인을 구축합니다. 이 조합만으로도 사용자 피드백 기반의 AI 개선 사이클을 완성할 수 있습니다.[41][42][49][48]

**확장 구성**: 프로젝트가 성숙해지면 DVC로 데이터 버전 관리, Evidently AI로 성능 모니터링을 추가합니다. 이를 통해 모델의 장기적인 품질을 보장할 수 있습니다.[59][53][57][52]

## 결론

본 보고서는 AI 식료품 관리 앱 개발을 위한 최고 수준의 오픈소스 솔루션을 제시했습니다:

1. **OCR**: PaddleOCR을 사용하여 95% 이상의 한글 인식률로 Clova OCR을 대체합니다.[3][1][2][4]
2. **바코드 DB**: 식품안전나라 API를 주력으로, Open Food Facts를 보조로 사용하는 하이브리드 전략을 권장합니다.[15][23]
3. **React Native**: react-native-vision-camera v4로 바코드 스캔, @react-native-ml-kit/text-recognition으로 온디바이스 OCR을 구현합니다.[26][28][35]
4. **AI 파이프라인**: Label Studio와 MLflow로 사용자 피드백 기반 재학습 파이프라인을 구축하고, DVC와 Evidently AI로 확장합니다.[57][41][52][48]

이러한 오픈소스 도구들을 조합하면, 유료 API 의존성을 최소화하면서도 고품질의 AI 식료품 관리 앱을 개발할 수 있습니다. 특히 사용자 피드백을 통한 지속적인 AI 개선 메커니즘은 앱의 정확도와 사용자 만족도를 장기적으로 향상시킬 것입니다.[42][41][49][48]

[1](https://d-ontory.tistory.com/20)
[2](https://blog.tinstack.net/posts/42)
[3](https://yunwoong.tistory.com/249)
[4](https://organicplain.tistory.com/entry/%F0%9F%94%8D-%EB%94%A5%EB%9F%AC%EB%8B%9D-OCR-EasyOCR-vs-PaddleOCR-%EB%B9%84%EA%B5%90-%EB%B6%84%EC%84%9D)
[5](https://www.themoonlight.io/ko/review/paddleocr-vl-boosting-multilingual-document-parsing-via-a-09b-ultra-compact-vision-language-model)
[6](https://github.com/JaidedAI/EasyOCR)
[7](https://journal.kci.go.kr/ksavs/archive/articlePdf?artiId=ART002967644)
[8](https://teki.tistory.com/68)
[9](https://woans0104.tistory.com/17)
[10](https://github.com/SubtitleEdit/subtitleedit/discussions/7708)
[11](https://blog.naver.com/samsjang/220694855018)
[12](https://stackoverflow.com/questions/59558820/tesseract-for-license-plate-especially-korean-version)
[13](https://ki-it.com/_common/do.php?a=full&b=22&bidx=2536&aidx=28902)
[14](https://github.com/tesseract-ocr/tesseract/issues/2639)
[15](https://openfoodfacts.github.io/openfoodfacts-server/api/)
[16](https://www.gigasheet.com/no-code-api/open-food-facts-api)
[17](https://stackoverflow.com/questions/3117645/how-to-get-food-product-data-from-barcode)
[18](https://apps.apple.com/us/app/open-food-facts-product-scan/id588797948)
[19](https://pypi.org/project/openfoodfacts/)
[20](https://openfoodfacts.github.io/openfoodfacts-python/usage/)
[21](https://github.com/openfoodfacts/openfoodfacts-python)
[22](https://blog.csdn.net/skywalk8163/article/details/142283619)
[23](https://www.foodsafetykorea.go.kr/api/openApiInfo.do?menu_grp=MENU_GRP31&menu_no=661&show_cnt=10&start_idx=1&svc_no=I2510&svc_type_cd=API_TYPE06)
[24](https://data.mfds.go.kr/openapi/FoodAdtvMnftBsshClsbizInfo/getFoodAdtvMnftBsshClsbizInfo)
[25](https://portal.foodqr.kr)
[26](https://www.linkedin.com/pulse/creating-react-native-vision-camera-code-scanner-step-by-step-uafge)
[27](https://scanbot.io/techblog/react-native-vision-camera-code-scanner-tutorial/)
[28](https://github.com/mrousavy/react-native-vision-camera/issues/2060)
[29](https://scanbot.io/blog/react-native-vision-camera-vs-expo-camera/)
[30](https://dev.to/ajmal_hasan/building-a-qr-codebarcode-scanner-app-with-react-native-and-vision-camera-534k)
[31](https://github.com/mgcrea/vision-camera-barcode-scanner)
[32](https://scanbot.io/techblog/react-native-scanner-tutorial/)
[33](https://www.youtube.com/watch?v=PZIEqcdFjpQ)
[34](https://docs.expo.dev/versions/latest/sdk/camera/)
[35](https://www.npmjs.com/package/@react-native-ml-kit/text-recognition)
[36](https://github.com/a7medev/react-native-ml-kit)
[37](https://www.youtube.com/watch?v=KO212Pvw5Ts)
[38](https://www.dhiwise.com/post/adding-ai-to-apps-react-native-ml-kit-in-focus)
[39](https://www.npmjs.com/package/react-native-mlkit-ocr)
[40](https://github.com/agoldis/react-native-mlkit-ocr)
[41](https://labelstud.io/learn/getting-started-with-label-studio/get-started-with-data-labeling/)
[42](https://labelstud.io/blog/data-labeling-and-comparative-analysis-of-fine-tuning-methods/)
[43](https://labelstud.io/learningcenter/data-labeling/)
[44](https://labelstud.io)
[45](https://github.com/HumanSignal/label-studio)
[46](https://docs.humansignal.com/guide/quality)
[47](https://labelstud.io/learningcenter/top-6-data-labeling-challenges-and-how-to-overcome-them/)
[48](https://www.mlflow.org/docs/3.5.0/ml/traditional-ml/sklearn/guide/)
[49](https://towardsdatascience.com/machine-learning-model-development-and-deployment-with-mlflow-and-scikit-learn-pipelines-f658c39e4d58/)
[50](https://mlflow.org/docs/3.1.3/ml/traditional-ml/sklearn/)
[51](https://mlflow.org/docs/latest/python_api/mlflow.sklearn.html)
[52](https://dvc.org/doc/use-cases/versioning-data-and-models/tutorial)
[53](https://lsjsj92.tistory.com/573)
[54](https://www.datacamp.com/tutorial/data-version-control-dvc)
[55](https://velog.io/@jkseo50/DVC-%EA%B0%9C%EB%85%90-%EB%B0%8F-%ED%99%9C%EC%9A%A9-%EB%B0%A9%EB%B2%95)
[56](https://dvc.org)
[57](https://mlinreallife.github.io/posts/alibi-detect/)
[58](https://arxiv.org/abs/2404.18673)
[59](https://www.evidentlyai.com/ml-in-production/model-monitoring)
[60](https://www.evidentlyai.com/blog/tutorial-evidently-ml-monitoring-cs329s)
[61](https://www.linkedin.com/pulse/day-22-model-retraining-feedback-loops-mlops-srinivasan-ramanujam-n8gmc)
[62](https://www.startworks.in/post/continuous-model-ownership-deploying-real-time-feedback-loops-for-mlops-how-to-keep-ai-models-fresh)
[63](https://github.com/SeldonIO/alibi-detect)
[64](https://pypi.org/project/alibi-detect/0.3.0/)
[65](https://rubrix.readthedocs.io/en/stable/tutorials/05-active_learning.html)
[66](http://ui.adsabs.harvard.edu/abs/2018arXiv180500979D/abstract)
[67](https://www.semanticscholar.org/paper/modAL:-A-modular-active-learning-framework-for-Danka-Horv%C3%A1th/34f2480845b5a898814694a1299c5947048ddf94)
[68](https://arxiv.org/abs/1805.00979)
[69](https://github.com/modAL-python/modAL)
[70](https://www.astronomer.io/docs/learn/airflow-mlops)
[71](https://www.conf42.com/Machine_Learning_2023_Tamara_Janina_Fingerlin_orchestrating_workflows_apache_airflow)
[72](https://www.mage.ai/blog/apache-airflow-for-data-engineers-master-pipeline-orchestration)
[73](https://airflow.apache.org/use-cases/mlops/)
[74](https://aws.amazon.com/blogs/big-data/use-apache-airflow-workflows-to-orchestrate-data-processing-on-amazon-sagemaker-unified-studio/)
[75](https://cloudzone.io/kubeflow-and-ml-automation-part-1/)
[76](https://portworx.com/blog/getting-started-with-kubeflow-pipelines/)
[77](https://www.kubeflow.org/docs/components/pipelines/overview/)
[78](https://github.com/kubeflow/pipelines)
[79](https://datatonic.com/insights/vertex-ai-data-validation-pipelines-great-expectations/)
[80](https://mlops.systems/posts/2022-04-19-data-validation-great-expectations-part-1.html)
[81](https://www.codecentric.de/en/knowledge-hub/blog/great-expectations-validating-datasets-in-machine-learning-pipeline)
[82](https://www.datacamp.com/tutorial/great-expectations-tutorial)
[83](https://greatexpectations.io)
[84](https://www.enolsoft.com/blog/korean-ocr.html)
[85](https://tesseract-ocr.github.io/docs/MOCRadaptingtesseract2.pdf)
[86](https://ironsoftware.com/csharp/ocr/languages/korean-ko/)
[87](https://greenjade.tistory.com/101)
[88](https://velog.io/@fbckdgns3/OCR-%EC%84%B1%EB%8A%A5-%EB%81%8C%EC%96%B4%EC%98%AC%EB%A6%AC%EA%B8%B0-Final)
[89](https://www.facebook.com/groups/tensorflowdevelopers/posts/848490955336198/)
[90](https://conroy.org/open-barcode-database)
[91](https://universe.roboflow.com/seoyoung-lee-ashwk/korean-food-jxpuk)
[92](https://koreanfood.rda.go.kr/eng/fctFoodSrchEng/main)
[93](https://www.gs1us.org/industries-and-insights/by-industry/retail-grocery)
[94](https://www.reddit.com/r/arduino/comments/hn18sk/looking_for_an_opensource_database_for_uk/)
[95](https://github.com/dl0312/open-apis-korea)
[96](https://play.google.com/store/apps/details?id=org.openproductsfacts.scanner&hl=ko)
[97](https://www.kaggle.com/datasets/rtatman/universal-product-code-database)
[98](https://www.tandfonline.com/doi/full/10.1080/19768354.2011.607513)
[99](https://www.frontiersin.org/journals/pharmacology/articles/10.3389/fphar.2017.00931/epub)
[100](https://devarthur25.tistory.com/63)
[101](https://github.com/gev2002/react-native-vision-camera-barcodes-scanner)
[102](https://yumedev.tistory.com/37)
[103](https://react-native-vision-camera.com/docs/guides/code-scanning)
[104](https://blog.naver.com/henasys/221946511364)
[105](https://www.npmjs.com/package/vision-camera-code-scanner)
[106](https://blog.naver.com/biud436/223455367949)
[107](https://neptune.ai/blog/retraining-model-during-deployment-continuous-training-continuous-testing)
[108](https://developer.dataiku.com/latest/tutorials/machine-learning/model-import/scikit-pipeline/index.html)
[109](https://codefinity.com/courses/v2/b501abfa-43ce-401b-b265-6bf2d164ed06/e2063beb-105e-4dc1-8d49-5eb8407836c6/7f4e1126-1dcd-4f45-84df-774efbd3233b)
[110](https://www.hpe.com/emea_europe/en/resource-library.video.machine-learning-data-version-control-dvc-reproducibility-and-collaboration-in-your-ml-projects.50d2a4e6-5614-4529-a556-a27bed906d2d.html)
[111](https://www.youtube.com/watch?v=Fwb7PjzGFRg)
[112](https://www.reddit.com/r/MachineLearning/comments/1ea8kc8/p_scikitactiveml_an_active_learning_library_in/)
[113](https://www.youtube.com/watch?v=cgc3dSEAel0)
[114](https://www.themoonlight.io/ko/review/open-source-drift-detection-tools-in-action-insights-from-two-use-cases)
[115](https://www.kaggle.com/code/linakeepgoing/evidently)
[116](https://modal-python.readthedocs.io/en/latest/)
[117](https://www.seldon.io/solutions/alibi-detect-module/)
[118](https://intuitionlabs.ai/articles/non-llm-ocr-technologies)
[119](https://dev.to/czmilo/2025-complete-guide-paddleocr-vl-09b-baidus-ultra-lightweight-document-parsing-powerhouse-1e8l)
[120](https://paddlepaddle.github.io/PaddleOCR/main/en/version3.x/pipeline_usage/seal_recognition.html)
[121](https://classic.yarnpkg.com/en/package/vision-camera-simple-scanner)
[122](https://github.com/PaddlePaddle/PaddleOCR)
[123](https://react-native-vision-camera.com/docs/guides/performance)
[124](https://www.kaggle.com/datasets/alexandrelemercier/food-detailed-nutritional-content)
[125](https://velog.io/@penguin1109/%EC%A1%B8%EC%97%85-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-1-Korean-Receipt-%EB%AC%B8%EC%9E%90-%EC%9D%B8%EC%8B%9D%EC%9D%84-%EC%9C%84%ED%95%9C-OCR-%EB%AA%A8%EB%8D%B8-%EA%B0%9C%EB%B0%9C-%EA%B7%B8%EB%A6%AC%EA%B3%A0-predict-API-%EB%A7%8C%EB%93%A4%EA%B8%B0)
[126](https://pub.dev/packages/openfoodfacts)
[127](https://arxiv.org/html/2508.19944v1)
[128](https://stackoverflow.com/questions/63789448/barcode-scanner-using-rn-camera-is-very-slow-in-android-expected-as-smooth-as-th)
[129](https://ernie.baidu.com/blog/publication/PaddleOCR-VL_Technical_Report.pdf)
[130](https://docs.kakaocloud.com/tutorial/machine-learning-ai/kubeflow-use-pipeline)
[131](https://blog.fabric.microsoft.com/en-us/blog/semantic-link-data-validation-using-great-expectations/)
[132](https://techblog.samsung.com/blog/article/70)
[133](https://iting.co.kr/reinvent-techblog-2024-post-154/)
[134](https://www.kubeflow.org)
[135](https://www.pixeltable.com/blog/pixeltable-vs-airflow-ml-orchestration)