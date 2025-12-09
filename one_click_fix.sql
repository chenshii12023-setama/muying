-- 一键修复所有商品相关表的问题
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本

-- 1. 删除所有相关表
DROP TABLE IF EXISTS item_favorites CASCADE;
DROP TABLE IF EXISTS item_inquiries CASCADE;
DROP TABLE IF EXISTS secondhand_items CASCADE;

-- 2. 创建 profiles 表（如果不存在）
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nickname VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建 secondhand_items 表
CREATE TABLE secondhand_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    images TEXT[] DEFAULT '{}',
    category VARCHAR(50) NOT NULL,
    category_name VARCHAR(50),
    "condition" VARCHAR(20) NOT NULL,
    usage_time VARCHAR(20),
    location VARCHAR(255) NOT NULL,
    has_certification BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'available',
    view_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建收藏表
CREATE TABLE item_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES secondhand_items(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, profile_id)
);

-- 5. 创建咨询表
CREATE TABLE item_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES secondhand_items(id) ON DELETE CASCADE,
    buyer_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    seller_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 创建索引
CREATE INDEX idx_secondhand_items_category ON secondhand_items(category);
CREATE INDEX idx_secondhand_items_status ON secondhand_items(status);
CREATE INDEX idx_secondhand_items_profile_id ON secondhand_items(profile_id);
CREATE INDEX idx_secondhand_items_created_at ON secondhand_items(created_at DESC);
CREATE INDEX idx_secondhand_items_price ON secondhand_items(price);

CREATE INDEX idx_item_favorites_item_id ON item_favorites(item_id);
CREATE INDEX idx_item_favorites_profile_id ON item_favorites(profile_id);

-- 7. 创建更新时间触发器
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

-- 8. 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondhand_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_inquiries ENABLE ROW LEVEL SECURITY;

-- 9. 创建 RLS 策略
-- profiles 表策略
CREATE POLICY "允许所有人查看资料" ON profiles
    FOR SELECT USING (true);
CREATE POLICY "允许用户管理自己的资料" ON profiles
    FOR ALL USING (auth.uid() = id);

-- secondhand_items 表策略（修复认证问题）
CREATE POLICY "允许所有人读取商品" ON secondhand_items
    FOR SELECT USING (true);
CREATE POLICY "允许任何人创建商品" ON secondhand_items
    FOR INSERT WITH CHECK (true); -- 暂时允许任何人创建
CREATE POLICY "允许所有者更新商品" ON secondhand_items
    FOR UPDATE USING (auth.uid() = profile_id OR profile_id = '123e4567-e89b-12d3-a456-426614174000'); -- 包含测试用户
CREATE POLICY "允许所有者删除商品" ON secondhand_items
    FOR DELETE USING (auth.uid() = profile_id OR profile_id = '123e4567-e89b-12d3-a456-426614174000'); -- 包含测试用户

-- item_favorites 表策略
CREATE POLICY "允许用户查看自己的收藏" ON item_favorites
    FOR SELECT USING (auth.uid() = profile_id OR profile_id = '123e4567-e89b-12d3-a456-426614174000');
CREATE POLICY "允许用户添加收藏" ON item_favorites
    FOR INSERT WITH CHECK (auth.uid() = profile_id OR profile_id = '123e4567-e89b-12d3-a456-426614174000');
CREATE POLICY "允许用户删除收藏" ON item_favorites
    FOR DELETE USING (auth.uid() = profile_id OR profile_id = '123e4567-e89b-12d3-a456-426614174000';

-- 10. 插入测试用户
INSERT INTO profiles (id, nickname, avatar_url) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', '测试用户', '/images/default-avatar.png')
ON CONFLICT (id) DO NOTHING;

-- 11. 插入测试商品
INSERT INTO secondhand_items (
    title, description, price, category, category_name, condition, location, profile_id
) VALUES (
    '婴儿手推车 可折叠 轻便',
    '9成新婴儿手推车，轻便易折叠，适合6个月-3岁宝宝。',
    299.00,
    'stroller',
    '婴儿车',
    '9成新',
    '朝阳区',
    '123e4567-e89b-12d3-a456-426614174000'
);

-- 12. 验证结果
SELECT 'profiles' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'id'
UNION ALL
SELECT 'secondhand_items' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'secondhand_items' AND column_name IN ('id', 'profile_id')
ORDER BY table_name, column_name;