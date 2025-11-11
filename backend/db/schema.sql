-- Supabase Schema for Receipt Scanner Project

-- Create the products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    predicted_expiry_days INTEGER NOT NULL,
    expiry_date DATE NOT NULL,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active', -- active, expired, consumed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Create an index on expiry_date for faster queries
CREATE INDEX IF NOT EXISTS idx_products_expiry_date ON products(expiry_date);

-- Create an index on status for filtering
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Create a function to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update 'updated_at' on row updates
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for upcoming expirations
CREATE OR REPLACE VIEW upcoming_expirations AS
SELECT 
    id,
    item_name,
    category,
    expiry_date,
    purchase_date,
    predicted_expiry_days,
    status,
    CURRENT_DATE - expiry_date AS days_since_expiry
FROM products
WHERE status = 'active'
ORDER BY expiry_date ASC;