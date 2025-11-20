-- 宝妈育儿轻指南 - 初始数据（修复版）
-- 修复了字段匹配问题，适配测试表结构

-- 1. 插入示例辅食食谱（修复字段匹配）
INSERT INTO baby_food_recipes (title, description, suitable_age, ingredients, steps, cooking_time, difficulty, view_count) VALUES
('南瓜米糊', '适合6个月以上宝宝的第一次辅食', '6-8个月', 
 '[{"name": "南瓜", "amount": "50g"}, {"name": "米糊", "amount": "30g"}]', 
 '[{"step": 1, "description": "南瓜蒸熟压成泥"}, {"step": 2, "description": "与米糊混合调匀"}]', 
 15, 'easy', 156),
 
('苹果泥', '富含维生素的天然水果泥', '6-8个月', 
 '[{"name": "苹果", "amount": "1个"}]', 
 '[{"step": 1, "description": "苹果去皮去核"}, {"step": 2, "description": "蒸熟或蒸熟压成泥"}]', 
 10, 'easy', 234),

('香蕉泥', '天然甜味的宝宝辅食', '6-8个月', 
 '[{"name": "香蕉", "amount": "1根"}]', 
 '[{"step": 1, "description": "香蕉压成泥"}, {"step": 2, "description": "可直接食用或加米糊"}]', 
 5, 'easy', 189),

('胡萝卜泥', '富含维生素A的蔬菜泥', '7-12个月', 
 '[{"name": "胡萝卜", "amount": "1根"}, {"name": "清水", "amount": "少量"}]', 
 '[{"step": 1, "description": "胡萝卜去皮切块"}, {"step": 2, "description": "蒸煮至软烂"}, {"step": 3, "description": "压成泥"}]', 
 20, 'easy', 145),

('鸡蛋羹', '优质蛋白质补充', '7-12个月', 
 '[{"name": "鸡蛋", "amount": "1个"}, {"name": "清水", "amount": "适量"}]', 
 '[{"step": 1, "description": "鸡蛋打散"}, {"step": 2, "description": "加温水调匀"}, {"step": 3, "description": "蒸8-10分钟"}]', 
 15, 'medium', 267),

('小米粥', '营养丰富的传统辅食', '7-12个月', 
 '[{"name": "小米", "amount": "50g"}, {"name": "清水", "amount": "500ml"}]', 
 '[{"step": 1, "description": "小米洗净"}, {"step": 2, "description": "加水煮成粥"}, {"step": 3, "description": "可加少量盐调味"}]', 
 30, 'medium', 198),

('蔬菜粥', '多种蔬菜营养组合', '1-2岁', 
 '[{"name": "小米", "amount": "30g"}, {"name": "胡萝卜", "amount": "20g"}, {"name": "菠菜", "amount": "20g"}, {"name": "清水", "amount": "400ml"}]', 
 '[{"step": 1, "description": "小米和蔬菜洗净"}, {"step": 2, "description": "煮成粥"}]', 
 25, 'medium', 134),

('肉末粥', '补充铁质和蛋白质', '1-2岁', 
 '[{"name": "小米", "amount": "40g"}, {"name": "瘦肉", "amount": "30g"}, {"name": "清水", "amount": "400ml"}]', 
 '[{"step": 1, "description": "瘦肉剁成末"}, {"step": 2, "description": "与小米同煮"}]', 
 35, 'hard', 98),

('鱼泥', '富含DHA的海鲜辅食', '7-12个月', 
 '[{"name": "白鱼肉", "amount": "50g"}, {"name": "清水", "amount": "少量"}]', 
 '[{"step": 1, "description": "鱼肉去刺"}, {"step": 2, "description": "蒸熟压成泥"}]', 
 20, 'medium', 167),

('肝泥', '富含铁质的动物肝脏辅食', '7-12个月', 
 '[{"name": "鸡肝", "amount": "30g"}, {"name": "清水", "amount": "少量"}]', 
 '[{"step": 1, "description": "肝洗净去筋"}, {"step": 2, "description": "蒸熟压泥"}]', 
 25, 'hard', 89)

ON CONFLICT DO NOTHING;

-- 2. 插入示例母婴设施（修复字段匹配）
INSERT INTO maternal_facilities (name, facility_type, address, latitude, longitude, description, features, photos) VALUES
('万达广场母婴室', 'nursing_room', '人民路188号万达广场3楼', 31.2304, 121.4737, '宽敞舒适的母婴室，配备齐全的婴儿护理设施', 
 '{"has_diaper_table": true, "is_free": true, "has_hot_water": true, "has_disinfection": true, "has_sofa": true}',
 ARRAY['https://example.com/facility1.jpg']),

('儿童主题乐园', 'playground', '中山北路456号', 31.2312, 121.4745, '专为0-6岁儿童设计的安全室内游乐场',
 '{"is_indoor": true, "has_monitoring": true, "has_activities": true, "has_soft_floor": true}',
 ARRAY['https://example.com/facility2.jpg']),

('儿童医院', 'hospital', '健康路789号', 31.2298, 121.4723, '专业儿童医院，提供全方位医疗服务',
 '{"has_pediatrics": true, "has_emergency": true, "has_vaccination": true, "has_checkup": true}',
 ARRAY['https://example.com/facility3.jpg']),

('宜家家居', 'shopping_mall', '徐汇区漕溪路126号', 31.2321, 121.4752, '北欧风格家居，提供完善的母婴设施',
 '{"has_nursing_room": true, "has_play_area": true, "has_feeding_room": true, "has_family_parking": true}',
 ARRAY['https://example.com/facility4.jpg']),

('社区公园', 'park', '长宁路456号', 31.2205, 121.4255, '社区儿童公园，适合亲子活动',
 '{"is_free": true, "is_outdoor": true, "has_slide": true, "has_swing": true, "has_sandbox": true}',
 ARRAY['https://example.com/facility5.jpg'])

ON CONFLICT DO NOTHING;