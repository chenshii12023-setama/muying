-- 为小程序登录添加特殊的 RLS 策略
-- 允许通过API直接创建用户资料（用于小程序登录）

-- 为 profiles 表添加匿名用户插入策略
DROP POLICY IF EXISTS "Miniprogram users can insert profiles" ON profiles;

CREATE POLICY "Miniprogram users can insert profiles" ON profiles
    FOR INSERT WITH CHECK (
        -- 允许匿名用户创建基础profile
        auth.uid() IS NULL AND
        user_id IS NULL AND
        phone_number IS NOT NULL AND
        nickname IS NOT NULL
    );

-- 为 profiles 表添加查看策略（允许查看自己的或所有公开信息）
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND user_id = auth.uid() OR
        auth.uid() IS NULL -- 匿名用户可以查看所有（仅开发环境）
    );

-- 更新策略（只允许用户更新自己的资料）
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);