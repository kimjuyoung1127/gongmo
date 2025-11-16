[DEBUG] upload_receipt_v2 시작
[USER] 수신된 user_id: f71be319-c89c-46ce-8f48-caad78001f72
[CLOVA] 이미지 리사이즈 시작
[CLOVA] 원본 이미지 로드: C:\Users\gmdqn\AppData\Local\Temp\tmp_c38kja0.jpg
[CLOVA] 원본 크기: (4080, 3060)
[CLOVA] 리사이즈 완료: (2000, 1500)
[CLOVA] 압축 완료: 490375 bytes (0.47 MB)
[CLOVA] 클로바 OCR v2 호출 시작
[CLOVA] 클로바 OCR API 호출 시작
[CLOVA] API 요청 준비 완료, 이미지 크기: 490375 bytes
[CLOVA] 이미지 포맷 확인: jpg
[CLOVA] Base64 데이터 길이: 653836
[CLOVA] RequestId: scan_1763291123
[CLOVA] API URL: https://j1rk9mwb41.apigw.ntruss.com/custom/v1/47776/f429bbeb45ad1a3c8af201d540fa373ee373dbf0ecc62a533c7a75d448fc1088/general
[CLOVA] Headers: {'X-OCR-SECRET': '***MASKED***', 'Content-Type': 'application/json'}
[CLOVA] Timeout 설정: 60초
[CLOVA] 요청 데이터 구조: ['images', 'requestId', 'version', 'timestamp']
[CLOVA] 첫번째 이미지 키: ['format', 'name', 'data']
[CLOVA] 클로바 OCR API 호출 성공
[DEBUG] 클로바 OCR v2 결과 파싱 시작
[CLOVA] 전체 응답 구조: ['version', 'requestId', 'timestamp', 'images']
[CLOVA] 이미지 데이터 구조: ['uid', 'name', 'inferResult', 'message', 'validationResult', 'convertedImageInfo', 'fields']
[CLOVA] 추출된 텍스트 목록: ['appw.e', 'backend.we', 'scan.', 'tsx', 'README.mo', 'MI', '"text "', '경설중기(사우동)', 'FRESH', '불불가', 'THE', '/환', '6s', '가능', '짐선', '이내', '카드미', '궐에', '
제서', '30일(신', '한함', ', ,', '개봉)상품에', '-983-1691~3', '(미', '매매', '031', 'KJOKO', '박*숙', '<|금', '계산원:', '「Orto」', '18:52', '호:', '2025/11/14 10:04', '영수증', '00446', 'POS', '번호
', '단가', '수량', '금액', '상품명', '1,280', '280', '1,980', '(개)', '*한끼딱)절단무', '1,380', '1,580', '금융업무대상담배율', '580', '3,480', '3.', '480', '1,380', '옛날사골곰탕500g', '700원', '9,700
0원', '결제금', '700원', '주[', '카드', '신용', '받은', '비과세풍물', '비부', '과가', '역]', '280원', '765원', '포인', '(주)삼진DDR', '[GS', 'ALL', 'GS', 'ALL', '( )', '주류', '닭백신', '*성님', '482', '10', '고현금기추', '명수생립립', '6183', '재회본가', '점발적적', '949094******4056', '( )', '카드운용', '국민카드', '000']
[CLOVA-DEBUG] 총 93개 텍스트 항목 처리 시작

[CLOVA-DEBUG] 항목 1/93: 'appw.e'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: 'appw.e'
[PRODUCT-DEBUG] 정제된 상품명: 'appw.e'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: 'appw.e'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: 'appw.e'
[PRODUCT-REJECT] 필터링으로 제외: 'appw.e'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 2/93: 'backend.we'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: 'backend.we'
[PRODUCT-DEBUG] 정제된 상품명: 'backend.we'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: 'backend.we'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: 'backend.we'
[PRODUCT-REJECT] 필터링으로 제외: 'backend.we'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 3/93: 'scan.'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: 'scan.'
[PRODUCT-DEBUG] 정제된 상품명: 'scan.'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: 'scan.'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: 'scan.'
[PRODUCT-REJECT] 필터링으로 제외: 'scan.'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 4/93: 'tsx'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: 'tsx'
[PRODUCT-DEBUG] 정제된 상품명: 'tsx'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: 'tsx'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: 'tsx'
[PRODUCT-REJECT] 필터링으로 제외: 'tsx'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 5/93: 'README.mo'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: 'README.mo'
[PRODUCT-DEBUG] 정제된 상품명: 'README.mo'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: 'README.mo'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: 'README.mo'
[PRODUCT-REJECT] 필터링으로 제외: 'README.mo'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 6/93: 'MI'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: 'MI'
[PRODUCT-DEBUG] 정제된 상품명: 'MI'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: 'MI'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: 'MI'
[PRODUCT-REJECT] 필터링으로 제외: 'MI'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 7/93: '"text "'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '"text "'
[PRODUCT-DEBUG] 정제된 상품명: '"text "'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '"text "'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '"text "'
[PRODUCT-REJECT] 필터링으로 제외: '"text "'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 8/93: '경설중기(사우동)'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '경설중기(사우동)'
[PRODUCT-DEBUG] 정제된 상품명: '경설중기(사우동)'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '경설중기(사우동)'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '경설중기(사우동)'
[PRODUCT-REJECT] 필터링으로 제외: '경설중기(사우동)'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 9/93: 'FRESH'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: 'FRESH'
[PRODUCT-DEBUG] 정제된 상품명: 'FRESH'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: 'FRESH'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: 'FRESH'
[PRODUCT-REJECT] 필터링으로 제외: 'FRESH'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 10/93: '불불가'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '불불가'
[PRODUCT-DEBUG] 정제된 상품명: '불불가'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '불불가'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '불불가'
[PRODUCT-REJECT] 필터링으로 제외: '불불가'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 11/93: 'THE'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: 'THE'
[PRODUCT-DEBUG] 정제된 상품명: 'THE'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: 'THE'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: 'THE'
[PRODUCT-REJECT] 필터링으로 제외: 'THE'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 12/93: '/환'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '/환'
[PRODUCT-DEBUG] 정제된 상품명: '/환'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '/환'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '/환'
[PRODUCT-REJECT] 필터링으로 제외: '/환'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 13/93: '6s'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '6s'
[PRODUCT-DEBUG] 정제된 상품명: '6s'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '6s'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '6s'
[PRODUCT-REJECT] 필터링으로 제외: '6s'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 14/93: '가능'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '가능'
[PRODUCT-DEBUG] 정제된 상품명: '가능'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '가능'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '가능'
[PRODUCT-REJECT] 필터링으로 제외: '가능'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 15/93: '짐선'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '짐선'
[PRODUCT-DEBUG] 정제된 상품명: '짐선'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '짐선'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '짐선'
[PRODUCT-REJECT] 필터링으로 제외: '짐선'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 16/93: '이내'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '이내'
[PRODUCT-DEBUG] 정제된 상품명: '이내'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '이내'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '이내'
[PRODUCT-REJECT] 필터링으로 제외: '이내'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 17/93: '카드미'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '카드미'
[PRODUCT-DEBUG] 정제된 상품명: '카드미'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '카드미'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '카드미'
[PRODUCT-REJECT] 필터링으로 제외: '카드미'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 18/93: '궐에'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '궐에'
[PRODUCT-DEBUG] 정제된 상품명: '궐에'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '궐에'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '궐에'
[PRODUCT-REJECT] 필터링으로 제외: '궐에'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 19/93: '제서'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '제서'
[PRODUCT-DEBUG] 정제된 상품명: '제서'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '제서'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '제서'
[PRODUCT-REJECT] 필터링으로 제외: '제서'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 20/93: '30일(신'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '30일(신'
[PRODUCT-DEBUG] 정제된 상품명: '30일(신'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '30일(신'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '30일(신'
[PRODUCT-REJECT] 필터링으로 제외: '30일(신'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 21/93: '한함'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '한함'
[PRODUCT-DEBUG] 정제된 상품명: '한함'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '한함'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: '한함'
[PRODUCT-REJECT] 필터링으로 제외: '한함'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 22/93: ', ,'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: ', ,'
[PRODUCT-DEBUG] 정제된 상품명: ', ,'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: ', ,'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-REJECT] 1단계 필터링에서 거부: ', ,'
[PRODUCT-REJECT] 필터링으로 제외: ', ,'
[CLOVA-REJECT] ❌ 필터링됨

[CLOVA-DEBUG] 항목 23/93: '개봉)상품에'
[PRODUCT-DEBUG] 상품 데이터 생성 시작: '개봉)상품에'
[PRODUCT-DEBUG] 정제된 상품명: '개봉)상품에'
[PRODUCT-DEBUG] 2단계 필터링 적용
[FILTER-DEBUG] 2단계 필터링 시작: '개봉)상품에'
[FILTER-DEBUG] 1단계: 정규식 필터링 적용
[FILTER-PASS] 1단계 필터링 통과: '개봉)상품에'
[FILTER-DEBUG] 2단계: ML 모델 검증 시작
[ML-DEBUG] 텍스트 분류 시작: '개봉)상품에'
[ML-DEBUG] 모델 파일 확인: C:\Users\gmdqn\scanner-project\backend\api\..\models\item_classifier_final.pkl
[ML-DEBUG] 벡터라이저 파일 확인: C:\Users\gmdqn\scanner-project\backend\api\..\models\vectorizer_final.pkl
[ML-DEBUG] 모델 파일 로드 시작
[ML-DEBUG] 모델 파일 로드 중...
[ML-DEBUG] joblib으로 모델 로드 중...
C:\Users\gmdqn\scanner-project\backend\.venv\lib\site-packages\sklearn\base.py:442: InconsistentVersionWarning: Trying to unpickle estimator LogisticRegression from version 1.3.0 when using version 1.7.2. This might lead to breaking code or invalid results. Use at your own risk. For more info please refer to:
https://scikit-learn.org/stable/model_persistence.html#security-maintainability-limitations
  warnings.warn(
[ML-DEBUG] 벡터라이저 로드 중...
C:\Users\gmdqn\scanner-project\backend\.venv\lib\site-packages\sklearn\base.py:442: InconsistentVersionWarning: Trying to unpickle estimator TfidfTransformer from version 1.3.0 when using version 1.7.2. This might lead to breaking code or invalid results. Use at your own risk. For more info please refer to:
https://scikit-learn.org/stable/model_persistence.html#security-maintainability-limitations
  warnings.warn(
C:\Users\gmdqn\scanner-project\backend\.venv\lib\site-packages\sklearn\base.py:442: InconsistentVersionWarning: Trying to unpickle estimator TfidfVectorizer from version 1.3.0 when using version 1.7.2. This might lead to breaking code or invalid results. Use at your own risk. For more info please refer to:
https://scikit-learn.org/stable/model_persistence.html#security-maintainability-limitations
  warnings.warn(
[ML-DEBUG] 모델 로드 성공!
[ML-DEBUG] 모델 및 벡터라이저 로드 완료
[ML-DEBUG] 텍스트 전처리 시작
(.venv) PS C:\Users\gmdqn\scanner-project\backend>   <- 서버가 꺼져버림