-- 修复外键约束问题
-- 修复 profile_id 和 id 的类型不匹配问题

-- 步骤 1: 检查 profiles 表结构
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'id';

-- 步骤 2: 检查 secondhand_items 表结构  
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'secondhand_items' AND column_name = 'profile_id';

-- 步骤 3: 删除外键约束（如果存在）
ALTER TABLE secondhand_items DROP CONSTRAINT IF EXISTS secondhand_items_profile_id_fkey;

-- 步骤 4: 根据情况修复列类型
-- 如果 profiles.id 是 UUID 类型，需要将 secondhand_items.profile_id 也改为 UUID
DO $$
BEGIN
    -- 检查 profiles.id 的数据类型
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
        -- profiles.id 是 UUID，需要修改 secondhand_items.profile_id
        ALTER TABLE secondhand_items 
        ALTER COLUMN profile_id TYPE UUID USING profile_id::uuid;
        
        RAISE NOTICE '✅ 已将 secondhand_items.profile_id 改为 UUID 类型';
    END IF;
    
    -- 检查 profiles.id 的数据类型是 bigint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'id' 
        AND data_type = 'bigint'
    ) THEN
        -- profiles.id 是 bigint，需要修改 secondhand_items.id
        ALTER TABLE secondhand_items 
        ALTER COLUMN id TYPE BIGINT USING id::bigint;
        
        RAISE NOTICE '✅ 已将 secondhand_items.id 改为 BIGINT 类型';
    END IF;
END $$;

-- 步骤 5: 重新创建外键约束
DO $$
BEGIN
    -- 根据数据类型选择合适的外键约束
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
        -- UUID 版本
        ALTER TABLE secondhand_items 
        ADD CONSTRAINT secondhand_items_profile_id_fkey 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
        
        RAISE NOTICE '✅ 已创建 UUID 外键约束';
    ELSE
        -- BIGINT 版本
        ALTER TABLE secondhand_items 
        ADD CONSTRAINT secondhand_items_profile_id_fkey 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
        
        RAISE NOTICE '✅ 已创建 BIGINT 外键约束';
    END IF;
END $$;

-- 步骤 6: 验证结果
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
    AND tc.table_name = 'secondhand_items';

-- 步骤 7: 显示最终的表结构
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'secondhand_items') 
    AND column_name IN ('id', 'profile_id')
ORDER BY table_name, ordinal_position;