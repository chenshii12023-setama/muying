-- 简单的商品表创建脚本
-- 在 Supabase Dashboard 中执行此脚本

-- 删除现有表（如果存在）
DROP TABLE IF EXISTS secondhand_items CASCADE;

-- 重新创建表
CREATE TABLE secondhand_items (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_secondhand_items_category ON secondhand_items(category);
CREATE INDEX idx_secondhand_items_status ON secondhand_items(status);
CREATE INDEX idx_secondhand_items_profile_id ON secondhand_items(profile_id);
CREATE INDEX idx_secondhand_items_created_at ON secondhand_items(created_at DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_secondhand_items_updated_at 
    BEFORE UPDATE ON secondhand_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS
ALTER TABLE secondhand_items ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "允许所有人读取商品" ON secondhand_items
    FOR SELECT USING (true);

CREATE POLICY "允许已登录用户创建商品" ON secondhand_items
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "允许所有者更新商品" ON secondhand_items
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "允许所有者删除商品" ON secondhand_items
    FOR DELETE USING (auth.uid() = profile_id);

-- 插入一些测试数据（使用 UUID）
INSERT INTO secondhand_items (
    id,
    title, 
    description, 
    price, 
    original_price,
    images, 
    category, 
    category_name,
    condition, 
    usage_time,
    location, 
    has_certification,
    profile_id
) VALUES 
(
    gen_random_uuid(),
    '婴儿手推车 可折叠 轻便',
    '9成新婴儿手推车，轻便易折叠，适合6个月-3岁宝宝。使用频率不高，宝宝现在长大了用不到了。车轮顺滑，刹车灵敏，座椅可调节。急需出售，价格可小刀。',
    299.00,
    599.00,
    ARRAY['/images/stroller1.jpg'],
    'stroller',
    '婴儿车',
    '9成新',
    '6个月-1年',
    '朝阳区',
    true,
    (SELECT id FROM profiles LIMIT 1) -- 引用第一个用户
),
(
    gen_random_uuid(),
    '品牌安全座椅 9-36kg适用',
    'Britax品牌安全座椅，通过3C认证，适合9-36kg儿童使用。无事故记录，清洁干净。价格美丽，有需要的宝妈联系。',
    450.00,
    1280.00,
    ARRAY['/images/car-seat1.jpg'],
    'car-seat',
    '安全座椅',
    '9成新',
    '1-2年',
    '海淀区',
    true,
    (SELECT id FROM profiles LIMIT 1) -- 引用第一个用户
);

-- 验证表结构
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'secondhand_items' 
ORDER BY ordinal_position;