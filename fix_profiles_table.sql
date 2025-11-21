-- 修复 profiles 表以支持小程序登录
-- 将 user_id 改为可空，支持独立的小程序用户系统

-- 1. 先删除现有的外键约束（如果存在）
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- 2. 将 user_id 改为可空
ALTER TABLE profiles ALTER COLUMN user_id DROP NOT NULL;

-- 3. 为小程序添加唯一标识符字段（可选）
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS miniprogram_user_id VARCHAR(100) UNIQUE;

-- 4. 重新创建 RLS 策略
DROP POLICY IF EXISTS "Miniprogram users can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 允许匿名用户创建资料（用于小程序登录）
CREATE POLICY "Miniprogram users can insert profiles" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() IS NULL AND
        user_id IS NULL AND
        nickname IS NOT NULL
    );

-- 允许查看所有资料（开发环境宽松策略）
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (
        true -- 允许所有查看（仅开发环境）
    );

-- 允许用户更新自己的资料
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (
        auth.uid() = user_id OR
        (auth.uid() IS NULL AND user_id IS NULL)
    );

-- 5. 确保 RLS 已启用
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;