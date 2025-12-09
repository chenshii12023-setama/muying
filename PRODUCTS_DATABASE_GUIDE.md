# 商品数据库集成指南

## 概述

本指南介绍了如何将闲置物品市场集成到 Supabase 数据库中，实现所有用户上传的商品在市场页面统一显示。

## 数据库表结构

### 1. secondhand_items 表（二手商品表）

```sql
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
```

### 2. item_favorites 表（商品收藏表）

```sql
CREATE TABLE IF NOT EXISTS item_favorites (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT REFERENCES secondhand_items(id) ON DELETE CASCADE,
    profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, profile_id)
);
```

### 3. item_inquiries 表（商品咨询表）

```sql
CREATE TABLE IF NOT EXISTS item_inquiries (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT REFERENCES secondhand_items(id) ON DELETE CASCADE,
    buyer_profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    seller_profile_id BIGINT REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 安全策略（RLS）

所有表都启用了行级安全策略（RLS），确保：

1. **商品表（secondhand_items）**
   - 所有人可以查看商品
   - 已登录用户可以创建商品
   - 只有商品所有者可以编辑/删除自己的商品

2. **收藏表（item_favorites）**
   - 用户只能查看自己的收藏
   - 用户可以添加/删除自己的收藏

3. **咨询表（item_inquiries）**
   - 买家只能查看自己发送的咨询
   - 卖家只能查看收到的咨询
   - 只有卖家可以标记咨询为已读

## 使用方法

### 1. 初始化数据库

在 Supabase Dashboard 中执行以下步骤：

1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 执行 `supabase_products_table.sql` 文件中的 SQL 脚本

### 2. 配置小程序

小程序已经集成了 SupabaseAPI，包含以下功能：

- `getSecondhandItems(filters)` - 获取商品列表
- `createSecondhandItem(profileId, itemData)` - 创建新商品
- `updateSecondhandItem(itemId, updates)` - 更新商品
- `deleteSecondhandItem(itemId)` - 删除商品
- `toggleItemFavorite(itemId, profileId)` - 切换收藏状态
- `getItemFavorites(profileId)` - 获取收藏列表

### 3. 数据同步机制

小程序会自动在以下情况下同步数据：

- **上传商品时**：自动保存到数据库
- **浏览商品时**：从数据库加载最新商品列表
- **编辑商品时**：实时更新数据库中的商品信息
- **删除商品时**：从数据库中移除商品记录

## 字段映射

### 前端 → 数据库

| 前端字段 | 数据库字段 | 说明 |
|---------|-----------|------|
| `title` | `title` | 商品标题 |
| `description` | `description` | 商品描述 |
| `price` | `price` | 现在价格 |
| `originalPrice` | `original_price` | 原价 |
| `images` | `images` | 图片数组 |
| `category` | `category` | 分类代码 |
| `categoryName` | `category_name` | 分类名称 |
| `condition` | `condition` | 成色 |
| `usageTime` | `usage_time` | 使用时间 |
| `location` | `location` | 交易地点 |
| `hasCertification` | `has_certification` | 是否有消毒证明 |
| `viewCount` | `view_count` | 浏览量 |
| `inquiryCount` | `inquiry_count` | 咨询量 |
| `favoriteCount` | `favorite_count` | 收藏量 |

## 权限控制

### 匿名用户
- ✅ 查看商品列表
- ✅ 查看商品详情
- ❌ 上传商品
- ❌ 收藏商品

### 已登录用户
- ✅ 查看商品列表
- ✅ 查看商品详情
- ✅ 上传商品
- ✅ 编辑/删除自己的商品
- ✅ 收藏/取消收藏商品
- ✅ 查看自己的收藏列表

## 降级机制

当 Supabase 连接不可用时，系统会自动降级到本地存储模式：

1. 所有商品数据存储在本地 `wxStorageSync` 中
2. 使用 `LocalStorageAPI` 模拟数据库操作
3. 数据仅在当前设备有效，不会同步到其他用户

## 测试方法

### 1. 测试数据库连接

```javascript
const SupabaseAPI = require('../../supabase_config.js')
const useLocalStorage = await SupabaseAPI.testConnection()
console.log('使用本地存储:', useLocalStorage)
```

### 2. 测试商品上传

1. 进入闲置页面
2. 点击发布商品
3. 填写商品信息
4. 上传图片
5. 点击提交
6. 检查是否在市场页面显示

### 3. 测试数据同步

1. 在设备A上传商品
2. 在设备B查看市场页面
3. 确认新商品已显示

## 注意事项

1. **隐私保护**：用户手机号等敏感信息不会直接显示
2. **图片存储**：建议使用 Supabase Storage 存储商品图片
3. **数据验证**：前端进行了基本验证，数据库层面也应有约束
4. **性能优化**：商品列表支持分页加载（待实现）
5. **搜索功能**：支持按标题、描述搜索商品

## 示例数据

数据库初始化时会自动插入一些示例商品数据，包括：
- 婴儿手推车
- 安全座椅
- 婴儿床
- 早教玩具
- 宝宝衣物

这些数据用于测试系统功能，实际部署时可以删除。