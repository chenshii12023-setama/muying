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

 Date: 28/11/2025 09:20:30
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for milestones
-- ----------------------------
DROP TABLE IF EXISTS `milestones`;
CREATE TABLE `milestones`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '里程碑ID',
  `baby_id` bigint NOT NULL COMMENT '宝宝ID',
  `title` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '里程碑标题',
  `description` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '详细描述',
  `milestone_date` date NOT NULL COMMENT '达成日期',
  `age_months` int NULL DEFAULT NULL COMMENT '月龄',
  `category` enum('motor','cognitive','social','language','health','other') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '类别',
  `is_standard` tinyint NULL DEFAULT 0 COMMENT '是否标准里程碑(1:是,0:否)',
  `standard_age_min` int NULL DEFAULT NULL COMMENT '标准月龄范围(最小)',
  `standard_age_max` int NULL DEFAULT NULL COMMENT '标准月龄范围(最大)',
  `photos` json NULL COMMENT '相关照片数组',
  `video_url` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '相关视频',
  `is_completed` tinyint NULL DEFAULT 1 COMMENT '是否已完成(1:是,0:否)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_baby_id`(`baby_id` ASC) USING BTREE,
  INDEX `idx_milestone_date`(`milestone_date` ASC) USING BTREE,
  INDEX `idx_category`(`category` ASC) USING BTREE,
  CONSTRAINT `milestones_ibfk_1` FOREIGN KEY (`baby_id`) REFERENCES `babies` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '宝宝发育里程碑表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of milestones
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
