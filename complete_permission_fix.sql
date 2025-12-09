-- 完整权限修复 - 确保所有表和API都正常
-- 在Supabase Dashboard的SQL编辑器中执行

-- 1. 确保所有表存在
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE,
    nickname VARCHAR(100),
    avatar_url TEXT,
    phone_number VARCHAR(20),
    email TEXT,
    birth_date DATE,
    gender VARCHAR(10),
    location TEXT,
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

-- 2. 创建消息表（如果不存在）
CREATE TABLE IF NOT EXISTS item_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES secondhand_items(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'inquiry',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 禁用所有RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE secondhand_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_messages DISABLE ROW LEVEL SECURITY;

-- 4. 删除所有RLS策略
DROP POLICY IF EXISTS "Enable insert for all users" ON profiles;
DROP POLICY IF EXISTS "Enable select for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for all users" ON profiles;
DROP POLICY IF EXISTS "Enable delete for all users" ON profiles;

DROP POLICY IF EXISTS "Enable insert for all users" ON secondhand_items;
DROP POLICY IF EXISTS "Enable select for all users" ON secondhand_items;
DROP POLICY IF EXISTS "Enable update for all users" ON secondhand_items;
DROP POLICY IF EXISTS "Enable delete for all users" ON secondhand_items;

DROP POLICY IF EXISTS "Enable insert for all users" ON item_favorites;
DROP POLICY IF EXISTS "Enable select for all users" ON item_favorites;
DROP POLICY IF EXISTS "Enable update for all users" ON item_favorites;
DROP POLICY IF EXISTS "Enable delete for all users" ON item_favorites;

DROP POLICY IF EXISTS "Enable insert for all users" ON item_messages;
DROP POLICY IF EXISTS "Enable select for all users" ON item_messages;
DROP POLICY IF EXISTS "Enable update for all users" ON item_messages;
DROP POLICY IF EXISTS "Enable delete for all users" ON item_messages;

-- 5. 重新授予完全权限
GRANT ALL PRIVILEGES ON profiles TO anon;
GRANT ALL PRIVILEGES ON profiles TO authenticated;
GRANT ALL PRIVILEGES ON secondhand_items TO anon;
GRANT ALL PRIVILEGES ON secondhand_items TO authenticated;
GRANT ALL PRIVILEGES ON item_favorites TO anon;
GRANT ALL PRIVILEGES ON item_favorites TO authenticated;
GRANT ALL PRIVILEGES ON item_messages TO anon;
GRANT ALL PRIVILEGES ON item_messages TO authenticated;

-- 6. 授予序列权限
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_secondhand_items_category ON secondhand_items(category);
CREATE INDEX IF NOT EXISTS idx_secondhand_items_status ON secondhand_items(status);
CREATE INDEX IF NOT EXISTS idx_secondhand_items_profile_id ON secondhand_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_item_favorites_item_id ON item_favorites(item_id);
CREATE INDEX IF NOT EXISTS idx_item_favorites_profile_id ON item_favorites(profile_id);
CREATE INDEX IF NOT EXISTS idx_item_messages_item_id ON item_messages(item_id);
CREATE INDEX IF NOT EXISTS idx_item_messages_sender_id ON item_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_item_messages_receiver_id ON item_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_item_messages_created_at ON item_messages(created_at DESC);

-- 8. 创建触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_secondhand_items_updated_at 
    BEFORE UPDATE ON secondhand_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_item_favorites_updated_at 
    BEFORE UPDATE ON item_favorites 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_item_messages_updated_at 
    BEFORE UPDATE ON item_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 验证权限设置
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasinsert,
    hasselect,
    hasupdate,
    hasdelete
FROM pg_tables 
WHERE tablename IN ('profiles', 'secondhand_items', 'item_favorites', 'item_messages')
    AND schemaname = 'public'
ORDER BY tablename;

-- 10. 测试查询权限
SELECT 'Testing profiles count:' as info, COUNT(*) as count FROM profiles;
SELECT 'Testing secondhand_items count:' as info, COUNT(*) as count FROM secondhand_items;
SELECT 'Testing item_favorites count:' as info, COUNT(*) as count FROM item_favorites;
SELECT 'Testing item_messages count:' as info, COUNT(*) as count FROM item_messages;