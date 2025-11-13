-- products 테이블 생성 SQL
-- 현재 스키마와 완벽하게 매칭되도록 작성됨

-- 📦 제품 정보 (바코드 조회 결과 캐싱용)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- [핵심] 바코드(GTIN) 값. 중복 불가.
    barcode TEXT UNIQUE NOT NULL,
    
    -- 앱에 표시될 이름
    product_name TEXT NOT NULL,
    
    -- 카테고리 참조 (categories.id)
    category_id BIGINT REFERENCES public.categories(id),
    
    -- 제조사/판매사
    manufacturer TEXT DEFAULT '알 수 없음',
    
    -- 데이터 소스 ('foodsafety', 'openfoodfacts', 'user_contribution')
    source TEXT DEFAULT 'unknown',
    
    -- 검증 여부 (사용자 기여 데이터의 경우)
    verified BOOLEAN DEFAULT FALSE
);

-- RLS 활성화 (기존 스키마와 동일)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 정책: 모든 사용자가 읽기 가능 (기존 스키마와 동일)
DROP POLICY IF EXISTS "Allow read access to all users" ON public.products;
CREATE POLICY "Allow read access to all users"
ON public.products
FOR SELECT USING (true);

-- 정책: 로그인한 사용자만 쓰기 가능 (기존 스키마와 동일)
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.products;
CREATE POLICY "Allow insert for authenticated users"
ON public.products
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- [성능] 바코드 조회를 위한 인덱스 (기존 스키마와 동일)
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);

-- [성능] updated_at 자동 업데이트 트리거 연결 (기존 스키마와 동일)
DROP TRIGGER IF EXISTS handle_products_updated_at ON public.products;
CREATE TRIGGER handle_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 확인용 SELECT 문 (선택 사항)
SELECT 'products 테이블 생성 완료' AS status;
