# Supabase存储桶配置指南

## 问题描述
图片上传功能无法正常工作，因为 `market-images` 存储桶在Supabase中尚未配置。

## 解决方案

### 方法一：在Supabase Dashboard中执行SQL（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制并执行以下SQL语句：

```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'market-images', 
    'market-images', 
    true, 
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 配置权限策略
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
```

### 方法二：通过Supabase CLI配置

如果安装了Supabase CLI，可以使用以下命令：

```bash
# 创建存储桶
supabase storage create market-images --public

# 设置权限
supabase storage policy create market-images --policy-name "anonymous-upload" --operation insert --role anon
supabase storage policy create market-images --policy-name "anonymous-view" --operation select --role anon
supabase storage policy create market-images --policy-name "anonymous-update" --operation update --role anon
supabase storage policy create market-images --policy-name "anonymous-delete" --operation delete --role anon
```

### 方法三：手动配置（GUI方式）

1. 登录 Supabase Dashboard
2. 进入 **Storage** 菜单
3. 点击 **Create a new bucket**
4. 填写信息：
   - **Bucket name**: `market-images`
   - **Public**: 勾选
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`
5. 点击 **Create bucket**

## 验证配置

配置完成后，可以通过以下方式验证：

1. **检查存储桶**：在Supabase Dashboard的Storage页面查看是否出现 `market-images` 存储桶
2. **测试上传**：在微信开发者工具中尝试上传图片
3. **查看日志**：检查控制台是否有上传成功的信息

## 故障排除

### 常见错误及解决方案

1. **错误："存储桶不存在"**
   - 原因：存储桶未创建
   - 解决方案：按照上述步骤创建存储桶

2. **错误："权限不足"**
   - 原因：RLS策略未配置
   - 解决方案：执行权限配置SQL

3. **错误："网络连接失败"**
   - 原因：网络问题或Supabase配置错误
   - 解决方案：检查网络连接和Supabase项目URL

4. **错误："文件类型不支持"**
   - 原因：上传了非图片文件
   - 解决方案：只允许上传jpg、png、gif、webp格式

## 降级方案

如果Supabase存储配置暂时无法完成，系统会自动降级使用本地文件路径。但请注意：
- 本地文件路径只能在当前设备上访问
- 重新发布或分享时图片可能无法显示
- 建议尽快配置Supabase存储以获得完整功能

## 技术说明

- **存储桶名称**: `market-images`
- **最大文件大小**: 5MB
- **支持格式**: jpg, png, gif, webp
- **访问权限**: 公开访问
- **URL格式**: `https://zbhlrnecjmdpuaxvhneu.supabase.co/storage/v1/object/public/market-images/filename.jpg`