-- 最终数据库修复 - 确保商品直接写入数据库
-- 在 Supabase Dashboard 中执行此脚本

-- 1. 完全重建表结构，确保所有权限正确
DROP TABLE IF EXISTS item_favorites CASCADE;
DROP TABLE IF EXISTS item_inquiries CASCADE;
DROP TABLE IF EXISTS secondhand_items CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. 创建用户表
CREATE TABLE profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nickname VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建商品表
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

-- 5. 创建索引
CREATE INDEX idx_secondhand_items_category ON secondhand_items(category);
CREATE INDEX idx_secondhand_items_status ON secondhand_items(status);
CREATE INDEX idx_secondhand_items_created_at ON secondhand_items(created_at DESC);
CREATE INDEX idx_secondhand_items_profile_id ON secondhand_items(profile_id);

-- 6. 插入测试用户
INSERT INTO profiles (id, nickname, avatar_url) 
VALUES ('123e4567-e89b-12d3-a456-426614174000', '测试用户', '/images/default-avatar.png');

-- 7. 禁用 RLS - 允许匿名访问（测试用）
ALTER TABLE secondhand_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 8. 给匿名用户授予所有权限
GRANT ALL ON secondhand_items TO anon;
GRANT ALL ON item_favorites TO anon;
GRANT ALL ON profiles TO anon;
GRANT ALL ON secondhand_items TO authenticated;
GRANT ALL ON item_favorites TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- 9. 创建更新时间触发器
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

-- 10. 验证权限
SELECT 
    schemaname,
    tablename,
    hasinsert,
    hasselect,
    hasupdate,
    hasdelete
FROM pg_tables 
JOIN pg_class ON pg_tables.tablename = pg_class.relname
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace AND pg_namespace.nspname = pg_tables.schemaname
LEFT JOIN information_schema.role_table_grants ON role_table_grants.table_name = pg_tables.tablename
WHERE pg_tables.tablename IN ('secondhand_items', 'item_favorites', 'profiles')
    AND role_table_grants.grantee = 'anon'
    AND pg_tables.schemaname = 'public';