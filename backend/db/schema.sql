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
-- (categories, expiry_rules 테이블은 제공된 내용과 동일하게 생성합니다)

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
-- (receipts, receipt_items 테이블은 제공된 내용과 동일하게 생성합니다)

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
-- [바코드 기능이 추가된 테이블]
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
    
    -- ✨ [바코드 추가] ✨
    -- 바코드(GTIN) 값. 바코드 스캔으로 등록 시 여기에 저장
    barcode TEXT,
    
    -- 앱에 표시될 이름 (예: '서울우유 1L')
    name TEXT NOT NULL, 
    
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
-- ✨ [바코드 인덱스 추가] ✨
CREATE INDEX IF NOT EXISTS idx_inventory_barcode ON public.inventory(barcode);


-- ===== 3.5. PUBLIC RECIPES TABLE (공용 레시피 정보 - 캐싱용) =====

-- 🍳 레시피 정보 (외부 API 결과 캐싱용)
CREATE TABLE public.recipes (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- 레시피 이름 (고유)
    menu_name TEXT UNIQUE NOT NULL,

    -- 레시피 데이터 (JSON 형식)
    recipe_data JSONB NOT NULL,

    -- 검색 키워드 (성능 최적화를 위한)
    search_keywords TEXT[]
);

-- RLS 활성화
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자가 읽기 가능 (레시피 정보는 공용)
CREATE POLICY "Allow read access to all users"
ON public.recipes
FOR SELECT USING (true);

-- 정책: 로그인한 사용자만 쓰기 가능 (레시피 추가/수정)
CREATE POLICY "Allow write for authenticated users"
ON public.recipes
FOR ALL WITH CHECK (auth.role() = 'authenticated');

-- [성능] `updated_at` 자동 업데이트 트리거 연결
CREATE TRIGGER handle_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- [성능] 레시피 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_recipes_menu_name ON public.recipes(menu_name);
CREATE INDEX IF NOT EXISTS idx_recipes_search_keywords ON public.recipes USING GIN(search_keywords);


-- ===== 4. APP VIEW (앱을 위한 '바로가기 뷰') =====
-- (upcoming_expirations 뷰는 제공된 내용과 동일하게 생성합니다)

CREATE OR REPLACE VIEW public.upcoming_expirations AS
SELECT
    id,
    user_id,
    name,
    category_id,
    expiry_date,
    purchase_date,
    status,
    (expiry_date - CURRENT_DATE) AS days_remaining
FROM
    public.inventory
WHERE
    status = 'active'
ORDER BY
    expiry_date ASC;