-- 商品表结构
-- 宝妈育儿轻指南小程序 - 闲置物品市场

-- 创建商品表
CREATE TABLE IF NOT EXISTS secondhand_items (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    images TEXT[] DEFAULT '{}',
    category VARCHAR(50) NOT NULL,
    category_name VARCHAR(50),
    condition VARCHAR(20) NOT NULL,
    usage_time VARCHAR(20),
    location VARCHAR(255) NOT NULL,
    has_certification BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'available',
    view_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_secondhand_items_category ON secondhand_items(category);
CREATE INDEX idx_secondhand_items_status ON secondhand_items(status);
CREATE INDEX idx_secondhand_items_profile_id ON secondhand_items(profile_id);
CREATE INDEX idx_secondhand_items_created_at ON secondhand_items(created_at DESC);
CREATE INDEX idx_secondhand_items_price ON secondhand_items(price);
CREATE INDEX idx_secondhand_items_location ON secondhand_items(location);

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

-- 插入一些示例数据
INSERT INTO secondhand_items (
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
    '婴儿手推车 可折叠 轻便',
    '9成新婴儿手推车，轻便易折叠，适合6个月-3岁宝宝。使用频率不高，宝宝现在长大了用不到了。车轮顺滑，刹车灵敏，座椅可调节。急需出售，价格可小刀。',
    299.00,
    599.00,
    ARRAY['/images/stroller1.jpg', '/images/stroller2.jpg'],
    'stroller',
    '婴儿车',
    '9成新',
    '6个月-1年',
    '朝阳区',
    true,
    1
),
(
    '品牌安全座椅 9-36kg适用',
    'Britax品牌安全座椅，通过3C认证，适合9-36kg儿童使用。无事故记录，清洁干净。价格美丽，有需要的宝妈联系。',
    450.00,
    1280.00,
    ARRAY['/images/car-seat1.jpg', '/images/car-seat2.jpg'],
    'car-seat',
    '安全座椅',
    '9成新',
    '1-2年',
    '海淀区',
    true,
    1
),
(
    '婴儿床带蚊帐 可调节',
    '实木婴儿床，可调节床板高度，带蚊帐和侧围栏。使用时间不长，现在宝宝换大床了。床品可赠送。',
    380.00,
    899.00,
    ARRAY['/images/crib1.jpg', '/images/crib2.jpg'],
    'crib',
    '婴儿床',
    '8成新',
    '6个月-1年',
    '西城区',
    false,
    2
),
(
    '早教益智玩具套装 6个月+',
    '包含积木、摇铃、布书等多种早教玩具，适合6个月以上宝宝。全部经过消毒清洁，无损坏，包装完好。',
    68.00,
    158.00,
    ARRAY['/images/toys1.jpg', '/images/toys2.jpg', '/images/toys3.jpg'],
    'toys',
    '玩具',
    '95成新',
    '3-6个月',
    '东城区',
    true,
    2
),
(
    '女宝宝春夏装 12-18个月',
    '12-18个月女宝宝春夏装，包含连衣裙、T恤、短裤等约20件。质量很好的品牌童装，清洁干净，无破损。',
    120.00,
    300.00,
    ARRAY['/images/clothes1.jpg', '/images/clothes2.jpg'],
    'clothes',
    '衣物',
    '8成新',
    '3-6个月',
    '丰台区',
    false,
    3
);

-- RLS 行级安全策略
-- 1. 允许所有人读取商品信息
ALTER TABLE secondhand_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有人读取商品" ON secondhand_items
    FOR SELECT USING (true);

-- 2. 允许已登录用户创建商品
CREATE POLICY "允许已登录用户创建商品" ON secondhand_items
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. 允许商品所有者更新自己的商品
CREATE POLICY "允许所有者更新商品" ON secondhand_items
    FOR UPDATE USING (auth.uid() = profile_id);

-- 4. 允许商品所有者删除自己的商品
CREATE POLICY "允许所有者删除商品" ON secondhand_items
    FOR DELETE USING (auth.uid() = profile_id);

-- 创建商品收藏表
CREATE TABLE IF NOT EXISTS item_favorites (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT REFERENCES secondhand_items(id) ON DELETE CASCADE,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, profile_id)
);

-- 创建索引
CREATE INDEX idx_item_favorites_item_id ON item_favorites(item_id);
CREATE INDEX idx_item_favorites_profile_id ON item_favorites(profile_id);

-- RLS 策略
ALTER TABLE item_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许用户查看自己的收藏" ON item_favorites
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "允许用户添加收藏" ON item_favorites
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "允许用户删除收藏" ON item_favorites
    FOR DELETE USING (auth.uid() = profile_id);

-- 创建商品咨询表
CREATE TABLE IF NOT EXISTS item_inquiries (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT REFERENCES secondhand_items(id) ON DELETE CASCADE,
    buyer_profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    seller_profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_item_inquiries_item_id ON item_inquiries(item_id);
CREATE INDEX idx_item_inquiries_buyer_id ON item_inquiries(buyer_profile_id);
CREATE INDEX idx_item_inquiries_seller_id ON item_inquiries(seller_profile_id);
CREATE INDEX idx_item_inquiries_created_at ON item_inquiries(created_at DESC);

-- RLS 策略
ALTER TABLE item_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许买家查看自己的咨询" ON item_inquiries
    FOR SELECT USING (auth.uid() = buyer_profile_id);

CREATE POLICY "允许卖家查看收到的咨询" ON item_inquiries
    FOR SELECT USING (auth.uid() = seller_profile_id);

CREATE POLICY "允许用户创建咨询" ON item_inquiries
    FOR INSERT WITH CHECK (auth.uid() = buyer_profile_id);

CREATE POLICY "允许卖家标记已读" ON item_inquiries
    FOR UPDATE USING (auth.uid() = seller_profile_id);