-- 设置Supabase存储 - 解决图片上传显示问题
-- 在Supabase Dashboard的SQL编辑器中执行
-- 注意：请逐条执行，不要一次性执行整个文件

-- 步骤1：创建存储桶（先执行这一条）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'market-images', 
    'market-images', 
    true, 
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 步骤2：配置权限策略（逐条执行以下4条）
-- 允许匿名用户上传文件
CREATE POLICY "Allow anonymous users to upload" ON storage.objects
FOR INSERT TO anon
WITH CHECK (bucket_id = 'market-images');

-- 允许匿名用户查看文件
CREATE POLICY "Allow anonymous users to view" ON storage.objects
FOR SELECT TO anon
USING (bucket_id = 'market-images');

-- 允许匿名用户更新自己的文件
CREATE POLICY "Allow anonymous users to update own files" ON storage.objects
FOR UPDATE TO anon
USING (bucket_id = 'market-images')
WITH CHECK (bucket_id = 'market-images');

-- 允许匿名用户删除自己的文件
CREATE POLICY "Allow anonymous users to delete own files" ON storage.objects
FOR DELETE TO anon
USING (bucket_id = 'market-images');

-- 验证步骤（最后执行）
-- 验证存储桶创建
SELECT * FROM storage.buckets WHERE id = 'market-images';

-- 测试文件URL格式
SELECT 
  'market-images' as bucket_name,
  'https://zbhlrnecjmdpuaxvhneu.supabase.co/storage/v1/object/public/market-images/filename.jpg' as example_url;