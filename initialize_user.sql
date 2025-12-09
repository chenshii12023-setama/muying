-- 初始化测试用户
-- 创建一个具有正确 UUID 格式的测试用户

-- 检查 profiles 表是否存在
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles'
    ) THEN
        -- 创建 profiles 表
        CREATE TABLE profiles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nickname VARCHAR(100),
            avatar_url TEXT,
            phone VARCHAR(20),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- 启用 RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- 创建 RLS 策略
        CREATE POLICY "允许所有人查看资料" ON profiles
            FOR SELECT USING (true);
            
        CREATE POLICY "允许用户管理自己的资料" ON profiles
            FOR ALL USING (auth.uid() = id);
            
        RAISE NOTICE '✅ 创建了 profiles 表';
    END IF;
END $$;

-- 插入测试用户
INSERT INTO profiles (id, nickname, avatar_url) 
VALUES (
    '123e4567-e89b-12d3-a456-426614174000', -- 一个固定的 UUID
    '测试用户',
    '/images/default-avatar.png'
) ON CONFLICT (id) DO NOTHING;

-- 验证用户创建
SELECT 
    id, 
    nickname, 
    avatar_url,
    created_at
FROM profiles 
WHERE id = '123e4567-e89b-12d3-a456-426614174000';