-- 修复 RLS 策略 - 允许匿名用户创建测试数据
-- 这些策略在正式上线时需要根据用户认证机制调整

-- 删除现有的辅食食谱策略并重新创建
DROP POLICY IF EXISTS "Everyone can view recipes" ON baby_food_recipes;
DROP POLICY IF EXISTS "Authenticated users can manage recipes" ON baby_food_recipes;

-- 创建更宽松的策略用于测试
CREATE POLICY "Everyone can view recipes" ON baby_food_recipes
    FOR SELECT USING (true);

CREATE POLICY "Everyone can insert recipes" ON baby_food_recipes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Everyone can update recipes" ON baby_food_recipes
    FOR UPDATE USING (true);

CREATE POLICY "Everyone can delete recipes" ON baby_food_recipes
    FOR DELETE USING (true);

-- 同样为其他表添加测试策略
-- 母婴设施表
DROP POLICY IF EXISTS "Everyone can view facilities" ON maternal_facilities;
DROP POLICY IF EXISTS "Authenticated users can manage facilities" ON maternal_facilities;

CREATE POLICY "Everyone can view facilities" ON maternal_facilities
    FOR SELECT USING (true);

CREATE POLICY "Everyone can manage facilities" ON maternal_facilities
    FOR ALL USING (true);

-- 用户资料表
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Everyone can view profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Everyone can manage profiles" ON profiles
    FOR ALL USING (true);

-- 宝宝表
DROP POLICY IF EXISTS "Users can view own babies" ON babies;
DROP POLICY IF EXISTS "Users can manage own babies" ON babies;

CREATE POLICY "Everyone can view babies" ON babies
    FOR SELECT USING (true);

CREATE POLICY "Everyone can manage babies" ON babies
    FOR ALL USING (true);