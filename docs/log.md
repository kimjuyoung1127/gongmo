[DEBUG] /upload_receipt 시작 (LLM 기반)
[USER] 수신된 user_id: 6cc3b3c1-bc1b-4b4f-9567-560585514112
[CLOVA] 이미지 리사이즈 시작
[CLOVA] 클로바 OCR 호출 시작
[CLOVA] 클로바 OCR API 호출 시작
[CLOVA] 클로바 OCR API 호출 성공
[DEBUG] LLM 기반 파싱 시작
[PARSER] 1. 레이아웃 분석 및 전체 텍스트 재구성 시작...
[LAYOUT] 재구성된 전체 텍스트:
---
가능 한*자 00484 금액 2,300 12,370 -2,480 5,160 3,000 -1,000 3,000 -1,000 12,000 -4,000 -8,480 769원
12,370원
1 1 2 1 1 4
29,350원
031)795-1681 X X X X X X
번호: 수량
영수증 한함 계산원:
2,300 2,580 3,000 3,000 3,000
단가 12,370 비과세:
영수증 (new)
모바일
21:30
30일(신선7일)이내 할인
= 1004 37,830원 할인총금액 29,350원 신용카드 29,350원 비과세품목 17,631원
상품명
번호: Y)NEW세마리쥐포 8809885250898 서귀포감귤(2S/S/M) 2345001789454 농축산물 버터오징어김스낵40G 8801392116339 하이네켄캔500ML 8934822470135 기본행사 하이네켄실버캔500ml 8712000057190 기본행사 기린이치방500ml캔 4901411175317 기본행사 표는
12:18 *영수증및결제카드미지참시교환/환불불가 구매점포에서 단,정상(미개봉)상품에 2025/11/05[수] POS 01 02 * - 03 04 - 05 - 06 - 총합계 결제금액 받은돈 * 과세:
---
[CACHE-ERROR] 캐시 조회 실패: {'code': 'PGRST116', 'details': 'The result contains 0 rows', 'hint': None, 'message': 'JSON object requested, multiple (or no) rows returned'}
[LLM-CALL] 캐시 미스, Gemini API 호출: 491057e1...
[PARSER] 2. LLM 기반 상품명과 카테고리 추출 시작...
[LLM] Gemini API 호출 시작...
[LLM-DEBUG] API 원본 응답: ```json
[
  {"item_name": "Y)NEW세마리쥐포", "category_id": 35, "quantity": 1},
  {"item_name": "서귀포감귤(2S/S/M)", "category_id": 17, "quantity": 1},
  {"item_name": "버터오징어김스낵40G", "category_id": 31, "quantity": 2},
  {"item_name": "하이네켄캔500ML", "category_id": 30, "quantity": 1},
  {"item_name": "하이네켄실버캔500ml", "category_id": 30, "quantity": 1},
  {"item_name": "기린이치방500ml캔", "category_id": 30, "quantity": 4}
]
```
[LLM-DEBUG] 파싱할 JSON 텍스트: [
  {"item_name": "Y)NEW세마리쥐포", "category_id": 35, "quantity": 1},
  {"item_name": "서귀포감귤(2S/S/M)", "category_id": 17, "quantity": 1},
  {"item_name": "버터오징어김스낵40G", "category_id": 31, "quantity": 2},
  {"item_name": "하이네켄캔500ML", "category_id": 30, "quantity": 1},
  {"item_name": "하이네켄실버캔500ml", "category_id": 30, "quantity": 1},
  {"item_name": "기린이치방500ml캔", "category_id": 30, "quantity": 4}
]
[LLM-SUCCESS] 상품명과 카테고리 6개 추출 성공: ['Y)NEW세마리쥐포', '서귀포감귤(2S/S/M)', '버터오징어김스낵40G', '하이네켄캔500ML', '하이네켄실버캔500ml', '기린이치방500ml캔']
[PARSER] 3. 유통기한 정보 매핑 시작...
Info: ID 기반으로 37개의 카테고리를 성공적으로 로드했습니다.
[PARSER-SUCCESS] ✅ 상품 처리 완료: Y)NEW세마리쥐포 (ID: 35, 기타)
[PARSER-SUCCESS] ✅ 상품 처리 완료: 서귀포감귤(2S/S/M) (ID: 17, 기타)
[PARSER-SUCCESS] ✅ 상품 처리 완료: 버터오징어김스낵40G (ID: 31, 기타)
[PARSER-SUCCESS] ✅ 상품 처리 완료: 하이네켄캔500ML (ID: 30, 기타)
[PARSER-SUCCESS] ✅ 상품 처리 완료: 하이네켄실버캔500ml (ID: 30, 기타)
[PARSER-SUCCESS] ✅ 상품 처리 완료: 기린이치방500ml캔 (ID: 30, 기타)
[CACHE-SAVE] LLM 결과 캐시 저장: 491057e1...
[PARSER-SUMMARY] 최종 추출된 상품 수: 6
[DEBUG] LLM 처리 완료, 처리된 항목 수: 6
[DEBUG] 처리된 아이템 상세 정보:
[DEBUG] 아이템 1: {'item_name': 'Y)NEW세마리쥐포', 'category': '기타', 'category_id': 35, 'expiry_days': 7, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': 'Y)NEW세마리쥐포'}
[DEBUG] 아이템 2: {'item_name': '서귀포감귤(2S/S/M)', 'category': '기타', 'category_id': 17, 'expiry_days': 7, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '서귀포감귤(2S/S/M)'}
[DEBUG] 아이템 3: {'item_name': '버터오징어김스낵40G', 'category': '기타', 'category_id': 31, 'expiry_days': 7, 'quantity': 2, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '버터오징어김스낵40G'}
[DEBUG] 아이템 4: {'item_name': '하이네켄캔500ML', 'category': '기타', 'category_id': 30, 'expiry_days': 7, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '하이네켄캔500ML'}
[DEBUG] 아이템 5: {'item_name': '하이네켄실버캔500ml', 'category': '기타', 'category_id': 30, 'expiry_days': 7, 'quantity': 1, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '하이네켄실버캔500ml'}
[DEBUG] 아이템 6: {'item_name': '기린이치방500ml캔', 'category': '기타', 'category_id': 30, 'expiry_days': 7, 'quantity': 4, 'unit': '개', 'source': 'clova_ocr_llm', 'confidence_high': True, 'raw_text': '기린이치방500ml캔'}
[DEBUG] 만료일 계산: 2025-11-25
[DEBUG] 생성된 inventory 아이템: {'name': 'Y)NEW세마리쥐포', 'category_id': 35, 'quantity': 1, 'expiry_date': '2025-11-25', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': 'Y)NEW세마리쥐포', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] 만료일 계산: 2025-11-25
[DEBUG] 생성된 inventory 아이템: {'name': '서귀포감귤(2S/S/M)', 'category_id': 17, 'quantity': 1, 'expiry_date': '2025-11-25', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '서귀포감귤(2S/S/M)', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] 만료일 계산: 2025-11-25
[DEBUG] 생성된 inventory 아이템: {'name': '버터오징어김스낵40G', 'category_id': 31, 'quantity': 2, 'expiry_date': '2025-11-25', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '버터오징어김스낵40G', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] 만료일 계산: 2025-11-25
[DEBUG] 생성된 inventory 아이템: {'name': '하이네켄캔500ML', 'category_id': 30, 'quantity': 1, 'expiry_date': '2025-11-25', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '하이네켄캔500ML', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] 만료일 계산: 2025-11-25
[DEBUG] 생성된 inventory 아이템: {'name': '하이네켄실버캔500ml', 'category_id': 30, 'quantity': 1, 'expiry_date': '2025-11-25', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '하이네켄실버캔500ml', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] 만료일 계산: 2025-11-25
[DEBUG] 생성된 inventory 아이템: {'name': '기린이치방500ml캔', 'category_id': 30, 'quantity': 4, 'expiry_date': '2025-11-25', 'source_type': 'receipt', 'store_name': 'Unknown Store', 'raw_text': '기린이치방500ml캔', 'purchase_date': '2025-11-18', 'user_id': '6cc3b3c1-bc1b-4b4f-9567-560585514112'}
[DEBUG] inventory 테이블 저장 시작, 항목 수: 6
[DEBUG] inventory 저장 예외: {'code': '23503', 'details': 'Key (category_id)=(35) is not present in table "categories".', 'hint': None, 'message': 'insert or update on table "inventory" violates foreign key constraint "inventory_category_id_fkey"'}
127.0.0.1 - - [18/Nov/2025:15:18:36 +0000] "POST /upload_receipt HTTP/1.1" 200 139 "-" "okhttp/4.12.0"