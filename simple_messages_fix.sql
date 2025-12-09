-- 最简消息表修复 - 解决404错误
-- 在Supabase Dashboard的SQL编辑器中执行

-- 1. 创建消息表
CREATE TABLE item_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'inquiry',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 添加外键约束
ALTER TABLE item_messages 
ADD CONSTRAINT fk_item_messages_item 
FOREIGN KEY (item_id) REFERENCES secondhand_items(id) ON DELETE CASCADE;

ALTER TABLE item_messages 
ADD CONSTRAINT fk_item_messages_sender 
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE item_messages 
ADD CONSTRAINT fk_item_messages_receiver 
FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. 授予权限
GRANT ALL ON item_messages TO anon;
GRANT ALL ON item_messages TO authenticated;

-- 4. 创建基本索引
CREATE INDEX idx_item_messages_item_id ON item_messages(item_id);
CREATE INDEX idx_item_messages_receiver_id ON item_messages(receiver_id);

-- 5. 验证创建成功
SELECT 'item_messages表创建验证:' as info, COUNT(*) as count FROM item_messages;

-- 6. 插入测试数据（可选）
INSERT INTO item_messages (item_id, sender_id, receiver_id, content)
SELECT 
    (SELECT id FROM secondhand_items LIMIT 1),
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM profiles LIMIT 1),
    '系统测试消息'
WHERE EXISTS (SELECT 1 FROM secondhand_items LIMIT 1)
    AND EXISTS (SELECT 1 FROM profiles LIMIT 1)
    AND NOT EXISTS (SELECT 1 FROM item_messages LIMIT 1);