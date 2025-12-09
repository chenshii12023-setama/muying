-- 完整的二手市场数据库修复脚本
-- 在 Supabase Dashboard 的 SQL 编辑器中执行此脚本

-- 1. 创建 item_messages 表（如果不存在）
CREATE TABLE IF NOT EXISTS item_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'inquiry',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引（提高查询性能）
CREATE INDEX IF NOT EXISTS idx_item_messages_item_id ON item_messages(item_id);
CREATE INDEX IF NOT EXISTS idx_item_messages_sender_id ON item_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_item_messages_receiver_id ON item_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_item_messages_created_at ON item_messages(created_at);

-- 3. 添加外键约束（确保数据完整性）
-- 先删除可能存在的旧约束
DO $$ 
BEGIN
    DROP CONSTRAINT IF EXISTS fk_item_messages_item FROM item_messages;
    DROP CONSTRAINT IF EXISTS fk_item_messages_sender FROM item_messages;
    DROP CONSTRAINT IF EXISTS fk_item_messages_receiver FROM item_messages;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 添加新的外键约束
ALTER TABLE item_messages 
ADD CONSTRAINT fk_item_messages_item 
FOREIGN KEY (item_id) REFERENCES secondhand_items(id) ON DELETE CASCADE;

ALTER TABLE item_messages 
ADD CONSTRAINT fk_item_messages_sender 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE item_messages 
ADD CONSTRAINT fk_item_messages_receiver 
FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 4. 禁用 RLS（Row Level Security）以允许匿名访问
ALTER TABLE item_messages DISABLE ROW LEVEL SECURITY;

-- 5. 授予权限给所有用户
GRANT ALL ON item_messages TO anon;
GRANT ALL ON item_messages TO authenticated;
GRANT ALL ON item_messages TO service_role;

-- 6. 授予序列权限（用于自增ID）
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. 验证表结构
SELECT 
    'item_messages 表结构验证' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'item_messages' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. 验证权限
SELECT 
    'item_messages 权限验证' as info,
    grantee,
    privilege_type,
    table_name
FROM information_schema.role_table_grants 
WHERE table_name = 'item_messages' 
    AND table_schema = 'public';

-- 9. 验证外键约束
SELECT 
    'item_messages 外键约束验证' as info,
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
    AND tc.table_name = 'item_messages';

-- 10. 插入测试数据（仅用于测试）
INSERT INTO item_messages (item_id, sender_id, receiver_id, content)
SELECT 
    (SELECT id FROM secondhand_items LIMIT 1),
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM profiles OFFSET 1 LIMIT 1),
    '这是一条测试消息 - ' || NOW()
WHERE EXISTS (SELECT 1 FROM secondhand_items LIMIT 1)
    AND EXISTS (SELECT 1 FROM profiles LIMIT 1)
    AND (SELECT COUNT(*) FROM item_messages) = 0;

-- 11. 验证测试数据
SELECT 
    'item_messages 测试数据验证' as info,
    COUNT(*) as total_messages,
    COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_messages
FROM item_messages;

-- 12. 显示完成信息
SELECT '✅ item_messages 表创建和配置完成!' as status,
       (SELECT COUNT(*) FROM item_messages) as message_count;