-- 宝妈育儿轻指南小程序 Supabase 数据库表结构
-- 创建时间: 2025-11-17

-- 1. 用户表 (profiles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname VARCHAR(50),
    avatar_url TEXT,
    phone_number VARCHAR(20),
    email VARCHAR(100),
    birth_date DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    location JSONB, -- 用户位置信息 {latitude, longitude, address}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 宝宝表 (babies)
CREATE TABLE IF NOT EXISTS babies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    nickname VARCHAR(50),
    birth_date DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    blood_type VARCHAR(5) CHECK (blood_type IN ('A', 'B', 'AB', 'O', 'unknown')),
    birth_weight DECIMAL(5,2), -- 出生体重(kg)
    birth_height DECIMAL(5,2), -- 出生身高(cm)
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 宝宝生长记录表 (baby_growth_records)
CREATE TABLE IF NOT EXISTS baby_growth_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    baby_id UUID REFERENCES babies(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    weight DECIMAL(5,2) NOT NULL, -- 体重(kg)
    height DECIMAL(5,2) NOT NULL, -- 身高(cm)
    head_circumference DECIMAL(5,2), -- 头围(cm)
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(baby_id, record_date)
);

-- 4. 里程碑记录表 (milestones)
CREATE TABLE IF NOT EXISTS milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    baby_id UUID REFERENCES babies(id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL,
    milestone_date DATE NOT NULL,
    description TEXT,
    photos TEXT[], -- 照片URL数组
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 疫苗接种记录表 (vaccinations)
CREATE TABLE IF NOT EXISTS vaccinations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    baby_id UUID REFERENCES babies(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(100) NOT NULL,
    vaccine_date DATE NOT NULL,
    vaccine_type VARCHAR(50),
    dose_number INTEGER,
    next_due_date DATE,
    hospital_name VARCHAR(100),
    notes TEXT,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 母婴设施表 (maternal_facilities)
CREATE TABLE IF NOT EXISTS maternal_facilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    facility_type VARCHAR(50) CHECK (facility_type IN ('nursing_room', 'playground', 'hospital', 'shopping_mall', 'park')),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    opening_hours JSONB, -- 营业时间 {weekday: "9:00-18:00", weekend: "10:00-20:00"}
    features JSONB, -- 设施特点 {has_diaper_table: true, is_free: true, has_breast_pump: false}
    photos TEXT[],
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    submitted_by UUID REFERENCES profiles(id),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 设施评价表 (facility_reviews)
CREATE TABLE IF NOT EXISTS facility_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    facility_id UUID REFERENCES maternal_facilities(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    photos TEXT[],
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    facility_rating INTEGER CHECK (facility_rating >= 1 AND facility_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(facility_id, profile_id)
);

-- 8. 闲置物品表 (secondhand_items)
CREATE TABLE IF NOT EXISTS secondhand_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('stroller', 'car_seat', 'crib', 'toy', 'clothing', 'feeding', 'bathing', 'other')),
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    condition VARCHAR(20) CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
    photos TEXT[] NOT NULL,
    sterilization_proof_url TEXT, -- 消毒证明
    age_range VARCHAR(50), -- 适用年龄范围
    brand VARCHAR(100),
    location JSONB, -- 物品位置 {latitude, longitude, address}
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'hidden')),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 物品收藏表 (item_favorites)
CREATE TABLE IF NOT EXISTS item_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_id UUID REFERENCES secondhand_items(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, item_id)
);

-- 10. 交易记录表 (transactions)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES secondhand_items(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_price DECIMAL(10,2),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    meeting_location JSONB,
    meeting_time TIMESTAMP WITH TIME ZONE,
    buyer_rating INTEGER CHECK (buyer_rating >= 1 AND buyer_rating <= 5),
    seller_rating INTEGER CHECK (seller_rating >= 1 AND seller_rating <= 5),
    buyer_review TEXT,
    seller_review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. 辅食食谱表 (baby_food_recipes)
CREATE TABLE IF NOT EXISTS baby_food_recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    suitable_age VARCHAR(50), -- 适用月龄
    ingredients JSONB NOT NULL, -- 食材列表 [{name: "胡萝卜", amount: "50g"}]
    steps JSONB NOT NULL, -- 制作步骤 [{step: 1, description: "胡萝卜洗净切块"}]
    cooking_time INTEGER, -- 烹饪时间(分钟)
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    nutrition_info JSONB, -- 营养信息 {calories: 100, protein: 5g}
    allergens TEXT[], -- 过敏原提醒
    photos TEXT[],
    is_featured BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES profiles(id),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. AI问答记录表 (ai_chat_records)
CREATE TABLE IF NOT EXISTS ai_chat_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    baby_id UUID REFERENCES babies(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    question_type VARCHAR(50) CHECK (question_type IN ('feeding', 'sleep', 'health', 'development', 'behavior', 'other')),
    is_helpful BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. 消息通知表 (notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    notification_type VARCHAR(50) CHECK (notification_type IN ('system', 'transaction', 'message', 'reminder', 'promotion')),
    is_read BOOLEAN DEFAULT FALSE,
    related_id UUID, -- 关联的业务ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. 系统设置表 (system_settings)
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_babies_profile_id ON babies(profile_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_baby_id ON baby_growth_records(baby_id);
CREATE INDEX IF NOT EXISTS idx_milestones_baby_id ON milestones(baby_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_baby_id ON vaccinations(baby_id);
CREATE INDEX IF NOT EXISTS idx_facility_reviews_facility_id ON facility_reviews(facility_id);
CREATE INDEX IF NOT EXISTS idx_secondhand_items_profile_id ON secondhand_items(profile_id);
CREATE INDEX IF NOT EXISTS idx_secondhand_items_category ON secondhand_items(category);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_records_profile_id ON ai_chat_records(profile_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_babies_updated_at BEFORE UPDATE ON babies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maternal_facilities_updated_at BEFORE UPDATE ON maternal_facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_secondhand_items_updated_at BEFORE UPDATE ON secondhand_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入初始系统设置
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('app_config', '{"version": "1.0.0", "maintenance_mode": false}', '应用配置'),
('growth_chart_config', '{"age_ranges": ["0-3个月", "4-6个月", "7-12个月", "1-2岁", "2-3岁", "3-6岁"], "standards": "who"}', '生长曲线配置'),
('vaccination_schedule', '{"standard_schedule": true}', '疫苗接种计划配置')
ON CONFLICT (setting_key) DO NOTHING;