-- 修复表关系 - 解决收藏功能错误
-- 在Supabase Dashboard的SQL编辑器中执行

-- 1. 确保item_favorites表存在且结构正确
DROP TABLE IF EXISTS item_favorites CASCADE;

CREATE TABLE item_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES secondhand_items(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, profile_id)
);

-- 2. 禁用RLS
ALTER TABLE item_favorites DISABLE ROW LEVEL SECURITY;

-- 3. 授予权限
GRANT ALL ON item_favorites TO anon;
GRANT ALL ON item_favorites TO authenticated;

-- 4. 确保secondhand_items表的外键约束正确
DO $$
BEGIN
    -- 检查外键是否存在，如果不存在则创建
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'secondhand_items_profile_id_fkey' 
        AND table_name = 'secondhand_items'
    ) THEN
        ALTER TABLE secondhand_items 
        ADD CONSTRAINT secondhand_items_profile_id_fkey 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_item_favorites_item_id ON item_favorites(item_id);
CREATE INDEX IF NOT EXISTS idx_item_favorites_profile_id ON item_favorites(profile_id);

-- 6. 验证关系
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND (tc.table_name IN ('secondhand_items', 'item_favorites', 'profiles')
         OR ccu.table_name IN ('secondhand_items', 'item_favorites', 'profiles'));

-- 7. 测试数据插入
INSERT INTO item_favorites (item_id, profile_id)
SELECT 
    (SELECT id FROM secondhand_items LIMIT 1),
    (SELECT id FROM profiles LIMIT 1)
WHERE EXISTS (SELECT 1 FROM secondhand_items LIMIT 1)
    AND EXISTS (SELECT 1 FROM profiles LIMIT 1)
    AND NOT EXISTS (SELECT 1 FROM item_favorites LIMIT 1);