---
[PARSER] 2. LLM 기반 상품명 추출 시작...
[LLM] Gemini API 호출 시작...
[LLM-DEBUG] API 원본 응답: ```json
["아메리카노"]
```
[LLM-DEBUG] 파싱할 JSON 텍스트: ["아메리카노"]
[LLM-SUCCESS] 상품명 1개 추출 성공: ['아메리카노']
[PARSER] 3. 카테고리 및 유통기한 정보 매핑 시작...
Info: DB에서 37개의 카테고리를 성공적으로 로드했습니다.
[PARSER-SUCCESS] ✅ 상품 처리 완료: 아메리카노 (음료)

[PARSER-SUMMARY] 최종 추출된 상품 수: 1
[DEBUG] LLM 처리 완료, 처리된 항목 수: 1
[DEBUG] 처리된 아이템 상세 정보:
[DEBUG] 아이템 1: {'item_name': '아메리카노', 'category': '음료', 'category_id': 37, 'expiry_days': 7, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '아메카노'}
[DEBUG] 만료일 계산: 2025-11-23
[DEBUG] 생성된 inventory 아이템: {'name': '아메리카노', 'category_id': 37, 'quantity': 1, 'expiry_date': '2025-11-23', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '아메리카노', 'purchase_date': '2025-11-16', 'user_id': 'f71be319-c89c-46ce-8f48-caad78001f72'}
[DEBUG] inventory 테이블 저장 시작, 항목 수: 1
[DEBUG] inventory 저장 성공, 저장된 항목 수: 1
172.30.1.12 - - [16/Nov/2025 22:57:37] "POST /upload_receipt HTTP/1.1" 200 -
