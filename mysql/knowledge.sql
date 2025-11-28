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

 Date: 28/11/2025 09:20:10
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for knowledge
-- ----------------------------
DROP TABLE IF EXISTS `knowledge`;
CREATE TABLE `knowledge`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '知识ID',
  `title` varchar(200) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '标题',
  `description` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '简介',
  `content` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '详细内容',
  `category` enum('nutrition','health','sleep','safety','education','development','other') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '分类',
  `tags` json NULL COMMENT '标签数组',
  `cover_image` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '封面图片',
  `author` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '作者',
  `author_avatar` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '作者头像',
  `read_count` int NULL DEFAULT 0 COMMENT '阅读量',
  `like_count` int NULL DEFAULT 0 COMMENT '点赞量',
  `share_count` int NULL DEFAULT 0 COMMENT '分享量',
  `favorite_count` int NULL DEFAULT 0 COMMENT '收藏量',
  `suitable_age_min` int NULL DEFAULT NULL COMMENT '适合月龄(最小)',
  `suitable_age_max` int NULL DEFAULT NULL COMMENT '适合月龄(最大)',
  `difficulty` enum('beginner','intermediate','advanced') CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT 'beginner' COMMENT '难度',
  `source` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '来源',
  `external_url` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '外部链接',
  `is_published` tinyint NULL DEFAULT 1 COMMENT '是否发布(1:是,0:草稿)',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category`(`category` ASC) USING BTREE,
  INDEX `idx_suitable_age`(`suitable_age_min` ASC, `suitable_age_max` ASC) USING BTREE,
  INDEX `idx_published`(`is_published` ASC) USING BTREE,
  INDEX `idx_sort_order`(`sort_order` ASC) USING BTREE,
  FULLTEXT INDEX `idx_content`(`title`, `description`, `content`)
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '育儿知识库表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of knowledge
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
