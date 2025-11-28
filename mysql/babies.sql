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

 Date: 28/11/2025 09:19:30
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for babies
-- ----------------------------
DROP TABLE IF EXISTS `babies`;
CREATE TABLE `babies`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '宝宝ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '宝宝姓名',
  `nickname` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '宝宝昵称',
  `gender` enum('male','female') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '性别',
  `birth_date` date NOT NULL COMMENT '出生日期',
  `avatar_text` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '头像emoji字符',
  `avatar_url` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '头像URL',
  `blood_type` enum('A','B','AB','O','unknown') CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT 'unknown' COMMENT '血型',
  `weight` decimal(5, 2) NULL DEFAULT NULL COMMENT '出生体重(kg)',
  `height` decimal(5, 1) NULL DEFAULT NULL COMMENT '出生身高(cm)',
  `head_circumference` decimal(5, 1) NULL DEFAULT NULL COMMENT '头围(cm)',
  `allergies` json NULL COMMENT '过敏信息数组',
  `is_default` tinyint NULL DEFAULT 0 COMMENT '是否默认宝宝(1:是,0:否)',
  `status` tinyint NULL DEFAULT 1 COMMENT '状态(1:正常,0:禁用)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_birth_date`(`birth_date` ASC) USING BTREE,
  CONSTRAINT `babies_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '宝宝基础信息表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of babies
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
