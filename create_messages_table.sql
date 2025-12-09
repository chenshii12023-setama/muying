-- 创建商品消息表 - 解决联系卖家功能
-- 在Supabase Dashboard的SQL编辑器中执行

-- 1. 创建商品消息表
DROP TABLE IF EXISTS item_messages CASCADE;

CREATE TABLE item_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES secondhand_items(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'inquiry', -- inquiry: 咨询, offer: 出价, other: 其他
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 禁用RLS
ALTER TABLE item_messages DISABLE ROW LEVEL SECURITY;

-- 3. 授予权限
GRANT ALL ON item_messages TO anon;
GRANT ALL ON item_messages TO authenticated;

-- 4. 创建索引
CREATE INDEX idx_item_messages_item_id ON item_messages(item_id);
CREATE INDEX idx_item_messages_sender_id ON item_messages(sender_id);
CREATE INDEX idx_item_messages_receiver_id ON item_messages(receiver_id);
CREATE INDEX idx_item_messages_created_at ON item_messages(created_at DESC);

-- 5. 创建更新时间触发器
CREATE TRIGGER update_item_messages_updated_at 
    BEFORE UPDATE ON item_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. 验证表结构
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'item_messages' 
    AND table_schema = 'public'
ORDER BY ordinal_position;