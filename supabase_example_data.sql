-- Supabase 示例数据初始化脚本
-- 用于填充宝妈育儿轻指南小程序的数据库

-- 插入示例用户资料（需要先创建用户）
INSERT INTO profiles (user_id, nickname, phone_number, email, birth_date, gender, location) VALUES
('00000000-0000-0000-0000-000000000001', '宝妈小张', '13800138000', 'zhang@example.com', '1990-05-15', 'female', '{"latitude": 31.2304, "longitude": 121.4737, "address": "上海市黄浦区"}'),
('00000000-0000-0000-0000-000000000002', '宝爸小李', '13900139000', 'li@example.com', '1988-08-20', 'male', '{"latitude": 31.2312, "longitude": 121.4745, "address": "上海市徐汇区"}'),
('00000000-0000-0000-0000-000000000003', '新手妈妈', '13600136000', 'mom@example.com', '1992-03-10', 'female', '{"latitude": 31.2298, "longitude": 121.4723, "address": "上海市长宁区"}');

-- 插入示例宝宝信息
INSERT INTO babies (profile_id, name, nickname, birth_date, gender, blood_type, birth_weight, birth_height) VALUES
(1, '小明', '明明', '2024-01-01', 'male', 'unknown', 3.2, 50.0),
(1, '小红', '红红', '2024-03-15', 'female', 'unknown', 3.5, 52.0),
(2, '小宝', '小宝', '2024-02-10', 'male', 'unknown', 3.8, 53.0);

-- 插入示例生长记录
INSERT INTO baby_growth_records (baby_id, record_date, weight, height, head_circumference, notes) VALUES
(1, '2024-01-15', 4.2, 55.0, 37.5, '满月体检，生长良好'),
(1, '2024-02-15', 5.8, 60.0, 39.0, '二月龄体检'),
(1, '2024-03-15', 7.2, 65.0, 41.0, '三月龄体检'),
(2, '2024-04-15', 5.5, 58.0, 38.0, '满月体检'),
(3, '2024-03-10', 6.0, 62.0, 40.0, '二月龄体检');

-- 插入示例里程碑
INSERT INTO milestones (baby_id, milestone_type, milestone_date, description) VALUES
(1, 'first_smile', '2024-01-20', '第一次对妈妈笑了'),
(1, 'first_rollover', '2024-02-10', '第一次翻身成功'),
(1, 'first_sit', '2024-04-01', '能独立坐立片刻'),
(2, 'first_smile', '2024-04-20', '第一次笑出声');

-- 插入示例疫苗接种记录
INSERT INTO vaccinations (baby_id, vaccine_name, vaccine_date, vaccine_type, dose_number, hospital_name) VALUES
(1, '乙肝疫苗', '2024-01-01', '一类疫苗', 1, '上海市儿童医院'),
(1, '卡介苗', '2024-01-01', '一类疫苗', 1, '上海市儿童医院'),
(1, '乙肝疫苗', '2024-02-01', '一类疫苗', 2, '社区医院');

-- 插入示例母婴设施
INSERT INTO maternal_facilities (name, facility_type, latitude, longitude, address, description, features) VALUES
('万达广场母婴室', 'nursing_room', 31.2304, 121.4737, '人民路188号万达广场3楼', '设施齐全的母婴室，提供免费服务', '{"has_diaper_table": true, "is_free": true, "has_breast_pump": true, "has_water": true}'),
('儿童主题乐园', 'playground', 31.2312, 121.4745, '中山北路456号', '室内儿童游乐场，安全设施完善', '{"has_rest_area": true, "has_monitor": true, "has_staff": true}'),
('儿童医院', 'hospital', 31.2298, 121.4723, '健康路789号', '专业儿童医院，儿科急诊', '{"has_emergency": true, "has_vaccination": true, "has_pediatrician": true}'),
('宜家家居', 'shopping_mall', 31.2321, 121.4752, '徐汇区漕溪路126号', '家庭友好型购物中心', '{"has_nursing_room": true, "has_play_area": true, "has_family_restroom": true}'),
('中山公园', 'park', 31.2300, 121.4760, '长宁路780号', '大型城市公园，儿童游乐区', '{"has_playground": true, "has_rest_area": true, "is_free": true}');

-- 插入示例设施评价
INSERT INTO facility_reviews (facility_id, profile_id, rating, review_text, cleanliness_rating, facility_rating, service_rating) VALUES
(1, 1, 5, '非常棒的母婴室，干净整洁，设备齐全', 5, 5, 5),
(1, 2, 4, '设施不错，但高峰期人比较多', 4, 4, 4),
(2, 1, 5, '孩子玩得很开心，安全措施到位', 5, 5, 5);

-- 插入示例闲置物品
INSERT INTO secondhand_items (profile_id, title, description, category, price, original_price, condition, age_range, brand, location) VALUES
(1, '婴儿推车', '9成新婴儿推车，使用半年', 'stroller', 200.00, 800.00, 'good', '0-3岁', '好孩子', '{"latitude": 31.2304, "longitude": 121.4737, "address": "上海市黄浦区"}'),
(1, '宝宝衣服套装', '全新未开封，0-6个月宝宝衣服', 'clothing', 50.00, 120.00, 'new', '0-6个月', '卡特', '{"latitude": 31.2304, "longitude": 121.4737, "address": "上海市黄浦区"}'),
(2, '婴儿床', '实木婴儿床，可调节高度', 'crib', 300.00, 1200.00, 'good', '0-3岁', '宜家', '{"latitude": 31.2312, "longitude": 121.4745, "address": "上海市徐汇区"}');

-- 插入示例辅食食谱
INSERT INTO baby_food_recipes (title, description, suitable_age, ingredients, steps, difficulty, nutrition_info) VALUES
('胡萝卜泥', '适合6个月以上宝宝的营养辅食', '6-8个月', '[{"name": "胡萝卜", "amount": "50g"}, {"name": "水", "amount": "适量"}]', '[{"step": 1, "description": "胡萝卜洗净去皮"}, {"step": 2, "description": "切块蒸熟"}, {"step": 3, "description": "捣成泥状"}]', 'easy', '{"calories": 50, "protein": "1g", "carbohydrate": "12g"}'),
('苹果泥', '天然甜味，促进消化', '6-8个月', '[{"name": "苹果", "amount": "1个"}]', '[{"step": 1, "description": "苹果洗净去皮"}, {"step": 2, "description": "蒸熟或直接捣泥"}]', 'easy', '{"calories": 60, "vitamin_c": "8mg"}'),
('南瓜小米粥', '营养丰富，易消化', '8-10个月', '[{"name": "南瓜", "amount": "100g"}, {"name": "小米", "amount": "30g"}, {"name": "水", "amount": "200ml"}]', '[{"step": 1, "description": "南瓜去皮切块"}, {"step": 2, "description": "小米洗净浸泡"}, {"step": 3, "description": "一起煮粥至软烂"}]', 'medium', '{"calories": 120, "fiber": "3g"}');

-- 插入示例AI问答记录
INSERT INTO ai_chat_records (profile_id, baby_id, question, answer, question_type) VALUES
(1, 1, '宝宝6个月应该添加什么辅食？', '6个月宝宝可以开始添加米粉、蔬菜泥、水果泥等单一辅食，每次从少量开始，观察宝宝反应。', 'feeding'),
(1, 1, '宝宝晚上哭闹怎么办？', '可能是饿了、尿布湿了或身体不适，检查宝宝需求并安抚。建立规律的睡眠习惯很重要。', 'sleep');

-- 更新设施评分统计
UPDATE maternal_facilities 
SET average_rating = (
  SELECT AVG(rating) FROM facility_reviews WHERE facility_id = maternal_facilities.id
),
review_count = (
  SELECT COUNT(*) FROM facility_reviews WHERE facility_id = maternal_facilities.id
);