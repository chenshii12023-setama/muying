-- 修复商品表结构
-- 如果表已存在但缺少某些列，则添加这些列

-- 检查并添加可能缺少的列
DO $$
BEGIN
    -- 添加 category_name 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='secondhand_items' 
        AND column_name='category_name'
    ) THEN
        ALTER TABLE secondhand_items ADD COLUMN category_name VARCHAR(50);
        RAISE NOTICE 'Added category_name column';
    END IF;

    -- 添加 original_price 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='secondhand_items' 
        AND column_name='original_price'
    ) THEN
        ALTER TABLE secondhand_items ADD COLUMN original_price DECIMAL(10,2);
        RAISE NOTICE 'Added original_price column';
    END IF;

    -- 添加 usage_time 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='secondhand_items' 
        AND column_name='usage_time'
    ) THEN
        ALTER TABLE secondhand_items ADD COLUMN usage_time VARCHAR(20);
        RAISE NOTICE 'Added usage_time column';
    END IF;

    -- 添加 has_certification 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='secondhand_items' 
        AND column_name='has_certification'
    ) THEN
        ALTER TABLE secondhand_items ADD COLUMN has_certification BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added has_certification column';
    END IF;

    -- 添加 view_count 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='secondhand_items' 
        AND column_name='view_count'
    ) THEN
        ALTER TABLE secondhand_items ADD COLUMN view_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added view_count column';
    END IF;

    -- 添加 inquiry_count 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='secondhand_items' 
        AND column_name='inquiry_count'
    ) THEN
        ALTER TABLE secondhand_items ADD COLUMN inquiry_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added inquiry_count column';
    END IF;

    -- 添加 favorite_count 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='secondhand_items' 
        AND column_name='favorite_count'
    ) THEN
        ALTER TABLE secondhand_items ADD COLUMN favorite_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added favorite_count column';
    END IF;

    -- 添加 updated_at 列（如果不存在）
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='secondhand_items' 
        AND column_name='updated_at'
    ) THEN
        ALTER TABLE secondhand_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;

END $$;

-- 创建更新时间触发器（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.triggers 
        WHERE trigger_name='update_secondhand_items_updated_at'
    ) THEN
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        CREATE TRIGGER update_secondhand_items_updated_at 
            BEFORE UPDATE ON secondhand_items 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Created update_updated_at trigger';
    END IF;
END $$;

-- 创建必要的索引（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename='secondhand_items' 
        AND indexname='idx_secondhand_items_category'
    ) THEN
        CREATE INDEX idx_secondhand_items_category ON secondhand_items(category);
        RAISE NOTICE 'Created category index';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename='secondhand_items' 
        AND indexname='idx_secondhand_items_status'
    ) THEN
        CREATE INDEX idx_secondhand_items_status ON secondhand_items(status);
        RAISE NOTICE 'Created status index';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename='secondhand_items' 
        AND indexname='idx_secondhand_items_profile_id'
    ) THEN
        CREATE INDEX idx_secondhand_items_profile_id ON secondhand_items(profile_id);
        RAISE NOTICE 'Created profile_id index';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename='secondhand_items' 
        AND indexname='idx_secondhand_items_created_at'
    ) THEN
        CREATE INDEX idx_secondhand_items_created_at ON secondhand_items(created_at DESC);
        RAISE NOTICE 'Created created_at index';
    END IF;
END $$;

-- 启用 RLS（如果未启用）
ALTER TABLE secondhand_items ENABLE ROW LEVEL SECURITY;

-- 创建或更新 RLS 策略
-- 删除已存在的策略
DROP POLICY IF EXISTS "允许所有人读取商品" ON secondhand_items;
DROP POLICY IF EXISTS "允许已登录用户创建商品" ON secondhand_items;
DROP POLICY IF EXISTS "允许所有者更新商品" ON secondhand_items;
DROP POLICY IF EXISTS "允许所有者删除商品" ON secondhand_items;

-- 创建新的 RLS 策略
CREATE POLICY "允许所有人读取商品" ON secondhand_items
    FOR SELECT USING (true);

CREATE POLICY "允许已登录用户创建商品" ON secondhand_items
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "允许所有者更新商品" ON secondhand_items
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "允许所有者删除商品" ON secondhand_items
    FOR DELETE USING (auth.uid() = profile_id);

-- 显示表结构用于验证
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'secondhand_items' 
ORDER BY ordinal_position;