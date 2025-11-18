[LLM-CALL] 캐시 미스, Gemini API 호출: 922f6934...
[PARSER] 2. LLM 기반 상품명과 카테고리 추출 시작...
[LLM] Gemini API 호출 시작...
[LLM-DEBUG] API 원본 응답: ```json
[
  {"item_name": "커피", "category_id": 29, "quantity": 1},
  {"item_name": "찌개컵", "category_id": 35, "quantity": 1},
  {"item_name": "살코기참치90g", "category_id": 34, "quantity": 1},
  {"item_name": "호박고구마700g", "category_id": 10, "quantity": 1}
]
```
[LLM-DEBUG] 파싱할 JSON 텍스트: [
  {"item_name": "커피", "category_id": 29, "quantity": 1},
  {"item_name": "찌개컵", "category_id": 35, "quantity": 1},
  {"item_name": "살코기참치90g", "category_id": 34, "quantity": 1},
  {"item_name": "호박고구마700g", "category_id": 10, "quantity": 1}
]
[LLM-SUCCESS] 상품명과 카테고리 4개 추출 성공: ['커피', '찌개컵', '살코기참치90g', '호박고구마700g']
[PARSER] 3. 유통기한 정보 매핑 시작...
[PARSER-SUCCESS] ✅ 상품 처리 완료: 커피 (ID: 29, 기타)
[PARSER-SUCCESS] ✅ 상품 처리 완료: 찌개컵 (ID: 35, 기타)
[PARSER-SUCCESS] ✅ 상품 처리 완료: 살코기참치90g (ID: 34, 기타)
[PARSER-SUCCESS] ✅ 상품 처리 완료: 호박고구마700g (ID: 10, 기타)
[CACHE-SAVE] LLM 결과 캐시 저장: 922f6934...
[PARSER-SUMMARY] 최종 추출된 상품 수: 4
[DEBUG] LLM 처리 완료, 처리된 항목 수: 4
[DEBUG] 처리된 아이템 상세 정보:
[DEBUG] 아이템 1: {'item_name': '커피', 'category': '기타', 'category_id': 29, 'expiry_days': 7, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '커피'}
[DEBUG] 아이템 2: {'item_name': '찌개컵', 'category': '기타', 'category_id': 35, 'expiry_days': 7, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '찌개컵'}
[DEBUG] 아이템 3: {'item_name': '살코기참치90g', 'category': '기타', 'category_id': 34, 'expiry_days': 7, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '살코기참치90g'}
[DEBUG] 아이템 4: {'item_name': '호박고구마700g', 'category': '기타', 'category_id': 10, 'expiry_days': 7, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '호박고구마700g'}
[DEBUG] 만료일 계산: 2025-11-25
[DEBUG] 생성된 inventory 아이템: {'name': '커피', 'category_id': 29, 'quantity': 1, 'expiry_date': '2025-11-25', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '커피', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] 만료일 계산: 2025-11-25
[DEBUG] 생성된 inventory 아이템: {'name': '찌개컵', 'category_id': 35, 'quantity': 1, 'expiry_date': '2025-11-25', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '찌개컵', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] 만료일 계산: 2025-11-25
[DEBUG] 생성된 inventory 아이템: {'name': '살코기참치90g', 'category_id': 34, 'quantity': 1, 'expiry_date': '2025-11-25', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '살코기참치90g', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] 만료일 계산: 2025-11-25
[DEBUG] 생성된 inventory 아이템: {'name': '호박고구마700g', 'category_id': 10, 'quantity': 1, 'expiry_date': '2025-11-25', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '호박고구마700g', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] inventory 테이블 저장 시작, 항목 수: 4
[DEBUG] inventory 저장 예외: {'code': '23503', 'details': 'Key (category_id)=(29) is not present in table "categories".', 'hint': None, 'message': 'insert or update on table "inventory" violates foreign key constraint "inventory_category_id_fkey"'}
127.0.0.1 - - [18/Nov/2025:15:35:58 +0000] "POST /upload_receipt HTTP/1.1" 200 139 "-" "okhttp/4.12.0"