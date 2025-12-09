-- 快速修复外键约束问题
-- 如果 profiles.id 是 UUID，将 secondhand_items 改为匹配的 UUID 类型

-- 1. 删除现有的外键约束
ALTER TABLE secondhand_items DROP CONSTRAINT IF EXISTS secondhand_items_profile_id_fkey;

-- 2. 将 secondhand_items 改为 UUID 类型（与 profiles.id 匹配）
ALTER TABLE secondhand_items 
ALTER COLUMN id TYPE UUID USING gen_random_uuid(),
ALTER COLUMN profile_id TYPE UUID USING profile_id::uuid;

-- 3. 重新创建外键约束
ALTER TABLE secondhand_items 
ADD CONSTRAINT secondhand_items_profile_id_fkey 
FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 4. 验证修复结果
SELECT 
    'secondhand_items' as table_name,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'secondhand_items' 
    AND column_name IN ('id', 'profile_id')
UNION ALL
SELECT 
    'profiles' as table_name,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND column_name = 'id'
ORDER BY table_name, column_name;