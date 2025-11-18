package com.mombaby.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * 辅食食谱实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "baby_food_recipes")
public class BabyFoodRecipe extends BaseEntity {

    public enum Difficulty {
        EASY("easy", "简单"),
        MEDIUM("medium", "中等"),
        HARD("hard", "困难");

        private final String code;
        private final String description;

        Difficulty(String code, String description) {
            this.code = code;
            this.description = description;
        }

        public String getCode() {
            return code;
        }

        public String getDescription() {
            return description;
        }
    }

    @NotBlank(message = "食谱标题不能为空")
    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "suitable_age", length = 50)
    private String suitableAge; // 适用月龄

    @Column(name = "ingredients", columnDefinition = "JSON", nullable = false)
    private String ingredients; // JSON格式存储食材列表

    @Column(name = "steps", columnDefinition = "JSON", nullable = false)
    private String steps; // JSON格式存储制作步骤

    @Column(name = "cooking_time")
    private Integer cookingTime; // 烹饪时间(分钟)

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Difficulty difficulty;

    @Column(name = "nutrition_info", columnDefinition = "JSON")
    private String nutritionInfo; // JSON格式存储营养信息

    @ElementCollection
    @CollectionTable(name = "recipe_allergens", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "allergen")
    private List<String> allergens; // 过敏原提醒

    @ElementCollection
    @CollectionTable(name = "recipe_photos", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "photo_url")
    private List<String> photos;

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "like_count", nullable = false)
    private Integer likeCount = 0;

}