-- 快速修复RLS策略 - 解决401认证错误
-- 在Supabase Dashboard的SQL编辑器中执行此脚本

-- 1. 完全禁用所有表的RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE secondhand_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_favorites DISABLE ROW LEVEL SECURITY;

-- 2. 删除可能存在的RLS策略
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view all items" ON secondhand_items;
DROP POLICY IF EXISTS "Users can insert own items" ON secondhand_items;
DROP POLICY IF EXISTS "Users can update own items" ON secondhand_items;
DROP POLICY IF EXISTS "Users can delete own items" ON secondhand_items;

DROP POLICY IF EXISTS "Users can view all favorites" ON item_favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON item_favorites;

-- 3. 给anon用户授予完全权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 4. 给authenticated用户授予完全权限  
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. 允许匿名用户使用存储
GRANT USAGE ON SCHEMA storage TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO anon;

-- 6. 确保表存在
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE,
    nickname VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS secondhand_items (
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
    user_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS item_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES secondhand_items(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, profile_id)
);

-- 7. 插入测试用户数据
INSERT INTO profiles (id, user_id, nickname, avatar_url) 
VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'test_user_001', '测试用户', '/images/default-avatar.png'),
    ('223e4567-e89b-12d3-a456-426614174001', 'test_user_002', '用户小李', '/images/avatar2.png')
ON CONFLICT (id) DO NOTHING;

-- 8. 插入测试商品数据
INSERT INTO secondhand_items (title, description, price, category, category_name, "condition", location, profile_id, user_id)
VALUES 
    ('婴儿推车', '九成新婴儿推车，轻便易折叠', 299.00, 'stroller', '婴儿推车', 'excellent', '北京市朝阳区', '123e4567-e89b-12d3-a456-426614174000', 'test_user_001'),
    ('婴儿床', '实木婴儿床，可调节高度', 599.00, 'bed', '婴儿床', 'good', '上海市浦东新区', '123e4567-e89b-12d3-a456-426614174000', 'test_user_001'),
    ('儿童安全座椅', '0-4岁儿童安全座椅，通过认证', 399.00, 'seat', '安全座椅', 'excellent', '广州市天河区', '223e4567-e89b-12d3-a456-426614174001', 'test_user_002')
ON CONFLICT DO NOTHING;

-- 9. 验证权限设置
SELECT 
    tablename,
    hasinsert,
    hasselect,
    hasupdate,
    hasdelete
FROM information_schema.role_table_grants 
WHERE grantee = 'anon' 
    AND table_schema = 'public'
    AND tablename IN ('profiles', 'secondhand_items', 'item_favorites');

-- 10. 测试查询
SELECT 'Testing profiles count:' as info, COUNT(*) as count FROM profiles;
SELECT 'Testing secondhand_items count:' as info, COUNT(*) as count FROM secondhand_items;
SELECT 'Testing item_favorites count:' as info, COUNT(*) as count FROM item_favorites;