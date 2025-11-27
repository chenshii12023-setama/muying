-- 为宝宝表添加当前身高体重字段
-- 数据库升级脚本 - 添加当前身高体重字段

-- 添加当前体重字段 (current_weight)
ALTER TABLE babies ADD COLUMN IF NOT EXISTS current_weight DECIMAL(5,2);

-- 添加当前身高字段 (current_height)  
ALTER TABLE babies ADD COLUMN IF NOT EXISTS current_height DECIMAL(5,2);

-- 添加字段描述注释
COMMENT ON COLUMN babies.current_weight IS '当前体重(kg)';
COMMENT ON COLUMN babies.current_height IS '当前身高(cm)';

-- 更新已有数据（如果存在的话）
-- 如果有需要，可以在这里添加数据迁移逻辑
-- 例如：UPDATE babies SET current_weight = birth_weight WHERE current_weight IS NULL;

-- 验证字段添加成功
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'babies' 
    AND column_name IN ('current_weight', 'current_height');