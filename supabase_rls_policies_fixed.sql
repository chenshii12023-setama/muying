-- 宝妈育儿轻指南 - Supabase RLS (Row Level Security) 策略（修复版）
-- 修复了 UUID 类型匹配问题

-- 首先为所有表启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE maternal_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE secondhand_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_food_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 1. 用户资料表 RLS 策略
-- 用户只能查看和修改自己的资料
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. 宝宝信息表 RLS 策略
-- 用户只能管理自己宝宝的资料
CREATE POLICY "Users can view own babies" ON babies
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own babies" ON babies
    FOR ALL USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- 3. 成长记录表 RLS 策略
CREATE POLICY "Users can view own baby growth records" ON baby_growth_records
    FOR SELECT USING (
        baby_id IN (
            SELECT id FROM babies 
            WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage own baby growth records" ON baby_growth_records
    FOR ALL USING (
        baby_id IN (
            SELECT id FROM babies 
            WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- 4. 里程碑表 RLS 策略
CREATE POLICY "Users can view own milestones" ON milestones
    FOR SELECT USING (
        baby_id IN (
            SELECT id FROM babies 
            WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage own milestones" ON milestones
    FOR ALL USING (
        baby_id IN (
            SELECT id FROM babies 
            WHERE profile_id IN (
                SELECT id FROM profiles WHERE user_id = auth.uid()
            )
        )
    );

-- 5. 母婴设施表 - 公开读取，认证用户可以管理
CREATE POLICY "Everyone can view facilities" ON maternal_facilities
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage facilities" ON maternal_facilities
    FOR ALL USING (auth.role() = 'authenticated');

-- 6. 设施评价表 RLS 策略
CREATE POLICY "Everyone can view reviews" ON facility_reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage own reviews" ON facility_reviews
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- 7. 闲置物品表 RLS 策略
CREATE POLICY "Everyone can view available items" ON secondhand_items
    FOR SELECT USING (
        status = 'available'
    );

CREATE POLICY "Users can view own items" ON secondhand_items
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own items" ON secondhand_items
    FOR ALL USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- 8. 辅食食谱表 - 公开读取，认证用户可以管理
CREATE POLICY "Everyone can view recipes" ON baby_food_recipes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage recipes" ON baby_food_recipes
    FOR ALL USING (auth.role() = 'authenticated');

-- 9. AI 聊天记录表 RLS 策略
CREATE POLICY "Users can view own chat records" ON ai_chat_records
    FOR SELECT USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own chat records" ON ai_chat_records
    FOR ALL USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );

-- 10. 通知表 RLS 策略
CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (
        profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
        )
    );