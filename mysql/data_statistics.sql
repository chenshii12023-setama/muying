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

 Date: 28/11/2025 09:19:50
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for data_statistics
-- ----------------------------
DROP TABLE IF EXISTS `data_statistics`;
CREATE TABLE `data_statistics`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '统计ID',
  `stat_type` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '统计类型',
  `stat_key` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '统计键',
  `stat_value` bigint NULL DEFAULT 0 COMMENT '统计值',
  `stat_date` date NOT NULL COMMENT '统计日期',
  `extra_data` json NULL COMMENT '扩展数据',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_type_key_date`(`stat_type` ASC, `stat_key` ASC, `stat_date` ASC) USING BTREE,
  INDEX `idx_stat_date`(`stat_date` ASC) USING BTREE,
  INDEX `idx_stat_type`(`stat_type` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '数据统计表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of data_statistics
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
