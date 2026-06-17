-- ========================================
-- Add missing columns to products table
-- ========================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode TEXT UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_stock INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB;

-- ========================================
-- Add missing columns to categories table
-- ========================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color TEXT;
