/*
 Navicat Premium Data Transfer

 Source Server         : baby
 Source Server Type    : MySQL
 Source Server Version : 80028 (8.0.28)
 Source Host           : localhost:3306
 Source Schema         : baby

 Target Server Type    : MySQL
 Target Server Version : 80028 (8.0.28)
 File Encoding         : 65001

 Date: 28/11/2025 09:20:00
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for growth_records
-- ----------------------------
DROP TABLE IF EXISTS `growth_records`;
CREATE TABLE `growth_records`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `baby_id` bigint NOT NULL COMMENT '宝宝ID',
  `record_type` enum('weight','height','head_circumference','temperature') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '记录类型',
  `value` decimal(8, 2) NOT NULL COMMENT '测量值',
  `unit` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '单位(kg/cm/℃)',
  `record_date` date NOT NULL COMMENT '记录日期',
  `age_months` int NULL DEFAULT NULL COMMENT '月龄',
  `note` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '备注',
  `doctor_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '医生姓名',
  `hospital` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '医院名称',
  `is_abnormal` tinyint NULL DEFAULT 0 COMMENT '是否异常(1:是,0:否)',
  `reference_min` decimal(8, 2) NULL DEFAULT NULL COMMENT '参考范围最小值',
  `reference_max` decimal(8, 2) NULL DEFAULT NULL COMMENT '参考范围最大值',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_baby_id`(`baby_id` ASC) USING BTREE,
  INDEX `idx_record_date`(`record_date` ASC) USING BTREE,
  INDEX `idx_record_type`(`record_type` ASC) USING BTREE,
  CONSTRAINT `growth_records_ibfk_1` FOREIGN KEY (`baby_id`) REFERENCES `babies` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '宝宝成长记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of growth_records
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
