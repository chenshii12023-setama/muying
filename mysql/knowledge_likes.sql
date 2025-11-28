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

 Date: 28/11/2025 09:20:21
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for knowledge_likes
-- ----------------------------
DROP TABLE IF EXISTS `knowledge_likes`;
CREATE TABLE `knowledge_likes`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '点赞ID',
  `knowledge_id` bigint NOT NULL COMMENT '知识ID',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `ip_address` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT 'IP地址(防刷)',
  `user_agent` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT 'User-Agent',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_knowledge`(`user_id` ASC, `knowledge_id` ASC) USING BTREE,
  INDEX `idx_knowledge_id`(`knowledge_id` ASC) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `knowledge_likes_ibfk_1` FOREIGN KEY (`knowledge_id`) REFERENCES `knowledge` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `knowledge_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '知识点赞记录表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of knowledge_likes
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
