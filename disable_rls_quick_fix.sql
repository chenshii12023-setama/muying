-- 快速修复：禁用 RLS 解决认证问题
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本

-- 禁用 RLS 暂时解决认证问题
ALTER TABLE secondhand_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE item_inquiries DISABLE ROW LEVEL SECURITY;

-- 验证修复结果
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('secondhand_items', 'item_favorites', 'item_inquiries')
    AND schemaname = 'public';

-- 测试插入权限
SELECT 'secondhand_items' as table_name, 
       has_insert_privilege, 
       has_select_privilege,
       has_update_privilege,
       has_delete_privilege
FROM information_schema.table_privileges 
WHERE table_name = 'secondhand_items' 
    AND table_schema = 'public'
    AND grantee = 'authenticated';