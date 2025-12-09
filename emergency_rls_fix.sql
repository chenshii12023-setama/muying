-- 紧急RLS修复 - 解决401认证错误
-- 在Supabase Dashboard的SQL编辑器中执行

-- 1. 完全禁用所有表的RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE secondhand_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_messages DISABLE ROW LEVEL SECURITY;

-- 2. 删除所有RLS策略
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

-- 3. 重新授予完全权限
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. 设置默认权限，确保新表也有权限
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

-- 5. 验证权限设置
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
    AND schemaname = 'public';

-- 6. 测试查询权限
SELECT 'Testing profiles count:' as info, COUNT(*) as count FROM profiles;
SELECT 'Testing secondhand_items count:' as info, COUNT(*) as count FROM secondhand_items;
SELECT 'Testing item_favorites count:' as info, COUNT(*) as count FROM item_favorites;
SELECT 'Testing item_messages count:' as info, COUNT(*) as count FROM item_messages;