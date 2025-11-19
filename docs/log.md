[LLM-SUCCESS] 상품명과 카테고리 4개 추출 성공: ['살코기참치90g', '고소한순두부', '옛날사리당면100g', '호박고구마700g']
[PARSER] 3. 유통기한 정보 매핑 시작...
Info: ID 기반으로 37개의 카테고리를 성공적으로 로드했습니다.
[PARSER-SUCCESS] ✅ 상품 처리 완료: 살코기참치90g (ID: 71, 통조림/건식품)
[PARSER-SUCCESS] ✅ 상품 처리 완료: 고소한순두부 (ID: 74, 기타)
[PARSER-SUCCESS] ✅ 상품 처리 완료: 옛날사리당면100g (ID: 61, 건면)
[PARSER-SUCCESS] ✅ 상품 처리 완료: 호박고구마700g (ID: 47, 뿌리채소(저온))
[CACHE-SAVE] LLM 결과 캐시 저장: e5990f79...
[PARSER-SUMMARY] 최종 추출된 상품 수: 4
[DEBUG] LLM 처리 완료, 처리된 항목 수: 4
[DEBUG] 처리된 아이템 상세 정보:
[DEBUG] 아이템 1: {'item_name': '살코기참치90g', 'category': '통조림/건식품', 'category_id': 71, 'expiry_days': 365, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '살코기참치90g'}
[DEBUG] 아이템 2: {'item_name': '고소한순두부', 'category': '기타', 'category_id': 74, 'expiry_days': 7, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '고소한순두부'}
[DEBUG] 아이템 3: {'item_name': '옛날사리당면100g', 'category': '건면', 'category_id': 61, 'expiry_days': 180, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '옛날사리당면100g'}
[DEBUG] 아이템 4: {'item_name': '호박고구마700g', 'category': '뿌리채소(저온)', 'category_id': 47, 'expiry_days': 14, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '호박고구마700g'}
[DEBUG] 만료일 계산: 2026-11-18
[DEBUG] 생성된 inventory 아이템: {'name': '살코기참치90g', 'category_id': 71, 'quantity': 1, 'expiry_date': '2026-11-18', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '살코기참치90g', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] 만료일 계산: 2025-11-25
[DEBUG] 생성된 inventory 아이템: {'name': '고소한순두부', 'category_id': 74, 'quantity': 1, 'expiry_date': '2025-11-25', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '고소한순두부', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] 만료일 계산: 2026-05-17
[DEBUG] 생성된 inventory 아이템: {'name': '옛날사리당면100g', 'category_id': 61, 'quantity': 1, 'expiry_date': '2026-05-17', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '옛날사리당면100g', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] 만료일 계산: 2025-12-02
[DEBUG] 생성된 inventory 아이템: {'name': '호박고구마700g', 'category_id': 47, 'quantity': 1, 'expiry_date': '2025-12-02', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '호박고구마700g', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] inventory 테이블 저장 시작, 항목 수: 4
[DEBUG] inventory 저장 성공, 저장된 항목 수: 4
127.0.0.1 - - [18/Nov/2025:23:21:44 +0000] "POST /upload_receipt HTTP/1.1" 200 139 "-" "okhttp/4.12.0"