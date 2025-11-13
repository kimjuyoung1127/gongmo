-- ===== 1. HELPER FUNCTIONS (유용한 도우미) =====

-- `updated_at` 타임스탬프를 자동으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===== 2. PUBLIC TABLES (AI의 '뇌' - 공용 데이터) =====

-- 🗂️ ① Category Master
CREATE TABLE public.categories (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    category_code TEXT UNIQUE NOT NULL, 
    category_name_kr TEXT NOT NULL, 
    default_expiry_days INT NOT NULL DEFAULT 7, 
    description TEXT
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access"
ON public.categories
FOR SELECT USING (true);


-- 🧩 ② Expiry Rules
CREATE TABLE public.expiry_rules (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    match_type TEXT NOT NULL CHECK (match_type IN ('regex', 'exact')), 
    pattern TEXT NOT NULL, 
    override_days INT NOT NULL, 
    notes TEXT
);
ALTER TABLE public.expiry_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access"
ON public.expiry_rules
FOR SELECT USING (true);


-- ===== 3. USER-PRIVATE TABLES (사용자 '개인' 데이터) =====

-- 🧾 ③ Receipts
CREATE TABLE public.receipts (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    image_url TEXT, 
    ocr_text TEXT 
);
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow ALL operations for OWN user"
ON public.receipts
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 📄 ④ Receipt Items
CREATE TABLE public.receipt_items (
    id BIGSERIAL PRIMARY KEY,
    receipt_id BIGINT NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE, 
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL, 
    clean_text TEXT, 
    category_id BIGINT REFERENCES public.categories(id), 
    expiry_days INT, 
    status TEXT DEFAULT 'parsed' CHECK (status IN ('parsed', 'added_to_inventory', 'ignored')) 
);
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow ALL operations for OWN user"
ON public.receipt_items
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 🥑 ⑤ Inventory (사용자의 '실제 냉장고 재고')
-- [✨ quantity 컬럼 추가됨 ✨]
CREATE TABLE public.inventory (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- [보안] 이 재고의 '소유자'
    user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- [연결] (선택) 어떤 영수증 품목에서 왔는지 추적
    receipt_item_id BIGINT REFERENCES public.receipt_items(id) ON DELETE SET NULL,
    
    -- [연결] 이 재고의 카테고리 (categories.id 참조)
    category_id BIGINT REFERENCES public.categories(id),
    
    -- [바코드 추가]
    -- 바코드(GTIN) 값. 바코드 스캔으로 등록 시 여기에 저장
    barcode TEXT,
    
    -- 앱에 표시될 이름 (예: '서울우유 1L')
    name TEXT NOT NULL, 
    
    -- ✨ [수량 추가] ✨
    -- 재고 수량 (기본값 1)
    quantity INTEGER NOT NULL DEFAULT 1,
    
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- [핵심] D-Day 계산의 기준이 되는 '실제 만료일'
    expiry_date DATE NOT NULL, 
    
    -- 'active' (신선), 'consumed' (소비됨), 'expired' (폐기)
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'consumed', 'expired')) 
);

-- RLS 활성화
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 정책: '본인'의 재고만 모든 작업(CRUD) 가능
CREATE POLICY "Allow ALL operations for OWN user"
ON public.inventory
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- [성능] `updated_at` 자동 업데이트 트리거 연결
CREATE TRIGGER handle_inventory_updated_at
BEFORE UPDATE ON public.inventory
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- [성능] 인덱스
CREATE INDEX IF NOT EXISTS idx_inventory_expiry_date ON public.inventory(expiry_date);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory(status);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
-- [바코드 인덱스 추가]
CREATE INDEX IF NOT EXISTS idx_inventory_barcode ON public.inventory(barcode);


-- ===== 4. APP VIEW (앱을 위한 '바로가기 뷰') =====

-- (기존 뷰 삭제 후 재생성 - 컬럼 추가 오류 방지)
DROP VIEW IF EXISTS public.upcoming_expirations;

-- [✨ quantity 컬럼 추가됨 ✨]
CREATE VIEW public.upcoming_expirations AS
SELECT
    id,
    user_id,
    name,
    category_id,
    expiry_date,
    purchase_date,
    status,
    quantity, -- ✨[수량 추가됨]✨
    (expiry_date - CURRENT_DATE) AS days_remaining
FROM
    public.inventory
WHERE
    status = 'active'
ORDER BY
    expiry_date ASC;

-- ===== 5. AUTHENTICATION & SECURITY (OAuth2.0 설정) =====

/*
Google OAuth 인증을 위한 설정 및 권장 구조입니다.

OAuth 흐름:
1. 앱은 Supabase의 signInWithOAuth를 사용하여 Google 로그인 URL을 요청
2. WebBrowser.openAuthSessionAsync를 통해 외부 브라우저에서 인증 진행
3. 인증 완료 후 앱으로 'app://' 딥 링크로 리디렉션
4. Linking.useURL()으로 딥 링크 수신 및 createSessionFromUrl()로 토큰 파싱
5. 파싱된 토큰으로 supabase.auth.setSession() 호출하여 로그인 완료

중요 설정:
- app.json: intentFilters에 'app://' 스킴 등록 필요
- Google Console: 'app://' 스킴을 리디렉션 URI로 설정
- Supabase: 'app://' 스킴을 인증 callback URL로 설정
- Expo 프록시 방식(auth.expo.io)은 deprecated 되었으므로 사용 금지
*/

-- OAuth 연동을 위한 Supabase 사용자 테이블 컬럼 참고
-- (Supabase auth.users 테이블은 기본 제공되며, 직접 생성할 필요 없음)
/*
CREATE TABLE auth.users (
  id uuid NOT NULL,
  email text,
  encrypted_password text,
  email_confirmed_at timestamptz,
  ...
);
*/