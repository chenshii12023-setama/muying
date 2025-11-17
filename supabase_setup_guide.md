# Supabase 后端部署指南

## 1. 创建 Supabase 项目

### 第一步：注册 Supabase 账号
1. 访问 [supabase.com](https://supabase.com)
2. 注册新账号（支持 GitHub、GitLab 等第三方登录）
3. 创建新组织（Organization）

### 第二步：创建新项目
1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: `mom-baby-guide`
   - **Database Password**: 设置安全的数据库密码
   - **Region**: 选择离你最近的区域（如 `ap-southeast-1` 新加坡）
3. 点击 "Create new project"

## 2. 配置数据库表结构

### 执行 SQL 脚本
1. 进入项目 Dashboard
2. 点击左侧菜单 "SQL Editor"
3. 复制 `supabase_tables.sql` 文件内容到编辑器中
4. 点击 "Run" 执行脚本

### 验证表结构
执行完成后，你应该能看到以下表：
- ✅ profiles（用户资料）
- ✅ babies（宝宝信息）
- ✅ baby_growth_records（生长记录）
- ✅ milestones（里程碑）
- ✅ vaccinations（疫苗接种）
- ✅ maternal_facilities（母婴设施）
- ✅ facility_reviews（设施评价）
- ✅ secondhand_items（闲置物品）
- ✅ item_favorites（收藏）
- ✅ transactions（交易记录）
- ✅ baby_food_recipes（辅食食谱）
- ✅ ai_chat_records（AI问答）
- ✅ notifications（通知）
- ✅ system_settings（系统设置）

## 3. 配置存储桶（Storage）

### 创建存储桶
1. 点击左侧菜单 "Storage"
2. 点击 "New Bucket"
3. 创建以下存储桶：

| 存储桶名称 | 用途 | 权限设置 |
|-----------|------|----------|
| `avatars` | 用户和宝宝头像 | public |
| `milestone-photos` | 里程碑照片 | public |
| `facility-photos` | 设施照片 | public |
| `item-photos` | 闲置物品照片 | public |
| `recipe-photos` | 食谱照片 | public |
| `certificates` | 消毒证明等证书 | private |

### 设置权限策略
对于每个存储桶，需要设置相应的权限策略。在 SQL Editor 中执行：

```sql
-- 允许所有用户读取头像
INSERT INTO storage.policies (name, bucket_id, statement)
VALUES ('Avatar read access', 'avatars', '{
  "statement": "SELECT",
  "effect": "allow",
  "principal": "*",
  "resource": "avatars/*",
  "action": "read"
}')
```

## 4. 配置身份验证

### 设置身份验证配置
1. 点击左侧菜单 "Authentication"
2. 点击 "Settings"
3. 配置以下设置：
   - **Site URL**: 你的小程序域名
   - **Enable email confirmations**: 开启
   - **Enable phone confirmations**: 根据需求开启

### 配置第三方登录（可选）
如果需要微信登录，需要配置相应的 OAuth 提供商。

## 5. 获取 API 配置

### 获取项目配置
你已提供 Supabase 配置信息：

```javascript
// 已经配置在 supabase_config.js 中
const supabaseUrl = 'https://fhtmhmeglsqggtupvhqn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodG1obWVnbHNxZ2d0dXB2aHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNTU4MzksImV4cCI6MjA3ODkzMTgzOX0.WXHppt4O5JUPrdWkQZstdWy9gKWgT5cIkzoTDaCie_U'
```

### 执行数据库脚本
1. 登录 Supabase 控制台: https://supabase.com/dashboard
2. 选择你的项目: `fhtmhmeglsqggtupvhqn`
3. 点击左侧 "SQL Editor"
4. 先执行 `supabase_tables.sql` 创建表结构
5. 再执行 `supabase_example_data.sql` 插入示例数据

## 6. 配置 Row Level Security (RLS)

### 启用 RLS 策略
在 SQL Editor 中执行以下 RLS 策略：

```sql
-- 启用所有表的 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE babies ENABLE ROW LEVEL SECURITY;
-- ... 为所有表启用 RLS

-- 为用户资料表创建策略
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 为宝宝表创建策略
CREATE POLICY "Users can view own babies" ON babies
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- 为闲置物品表创建策略
CREATE POLICY "Anyone can view available items" ON secondhand_items
  FOR SELECT USING (status = 'available');

CREATE POLICY "Users can manage own items" ON secondhand_items
  FOR ALL USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));
```

## 7. 插入示例数据（可选）

### 插入初始数据
在 SQL Editor 中执行示例数据脚本：

```sql
-- 插入示例辅食食谱
INSERT INTO baby_food_recipes (title, description, suitable_age, ingredients, steps, difficulty) VALUES
('胡萝卜泥', '适合6个月以上宝宝的营养辅食', '6-8个月', '[{"name": "胡萝卜", "amount": "50g"}, {"name": "水", "amount": "适量"}]', '[{"step": 1, "description": "胡萝卜洗净去皮"}, {"step": 2, "description": "切块蒸熟"}, {"step": 3, "description": "捣成泥状"}]', 'easy'),
('苹果泥', '天然甜味，促进消化', '6-8个月', '[{"name": "苹果", "amount": "1个"}]', '[{"step": 1, "description": "苹果洗净去皮"}, {"step": 2, "description": "蒸熟或直接捣泥"}]', 'easy');

-- 插入系统设置
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('growth_standards', '{"who": true, "china": true}', '生长标准配置'),
('vaccination_reminder', '{"enabled": true, "days_before": 7}', '疫苗接种提醒配置');
```

## 8. 小程序集成配置

### 配置小程序端
1. 将 `supabase_config.js` 文件复制到小程序项目中
2. 更新配置文件中的 URL 和密钥
3. 在小程序中使用 Supabase API

### 示例代码
```javascript
import { SupabaseAPI } from './supabase_config.js'

// 用户注册
async function registerUser(email, password, userData) {
  try {
    const result = await SupabaseAPI.signUp(email, password, userData)
    console.log('注册成功', result)
  } catch (error) {
    console.error('注册失败', error)
  }
}

// 获取宝宝信息
async function getBabies(profileId) {
  try {
    const babies = await SupabaseAPI.getUserBabies(profileId)
    return babies
  } catch (error){
    console.error('获取宝宝信息失败', error)
  }
}
```

## 9. 测试部署

### 功能测试
小程序中已集成测试页面：
1. 在小程序开发者工具中运行项目
2. 访问 `/pages/test/test` 页面
3. 点击"运行测试"按钮验证后端连接

### 功能测试清单
- [x] 后端连接测试（通过测试页面）
- [x] 辅食食谱API测试
- [x] 母婴设施API测试
- [x] 闲置物品API测试
- [ ] 用户注册/登录
- [ ] 宝宝信息管理
- [ ] 生长记录添加
- [ ] 文件上传

### 小程序访问测试页面
在微信开发者工具中，修改 app.json 添加测试页面：
```json
{
  "pages": [
    "pages/index/index",
    "pages/test/test",
    // ... 其他页面
  ]
}
```

## 10. 监控和维护

### 监控指标
- 数据库性能
- 存储使用情况
- API 调用频率
- 错误率

### 定期维护
- 备份数据库
- 清理过期数据
- 更新依赖包
- 优化查询性能

## 故障排除

### 常见问题
1. **RLS 策略错误**: 检查用户权限设置
2. **存储权限问题**: 验证存储桶策略
3. **API 限流**: 检查调用频率限制
4. **连接超时**: 检查网络配置和防火墙

### 获取帮助
- Supabase 官方文档: [supabase.com/docs](https://supabase.com/docs)
- GitHub Issues: 项目问题跟踪
- Discord 社区: 实时技术支持

---

## 10. 快速开始指南

### 立即部署步骤
1. **已经拥有Supabase项目**: 项目ID: `fhtmhmeglsqggtupvhqn`
2. **执行数据库脚本**: 在SQL Editor中按顺序执行:
   - `supabase_tables.sql` (创建表结构)
   - `supabase_example_data.sql` (插入示例数据)
3. **小程序已配置完成**: 配置文件已更新为真实配置
4. **测试后端连接**: 运行小程序访问测试页面

### 小程序集成验证
在小程序开发者工具中:
1. 查看控制台输出，确认后端连接成功
2. 访问测试页面验证各个API接口
3. 检查是否出现连接错误提示

**部署完成时间**: 2025-11-17  
**版本**: v1.0.0  
**最后更新**: 2025-11-17  
**项目状态**: ✅ 后端配置已完成，可进行数据库初始化