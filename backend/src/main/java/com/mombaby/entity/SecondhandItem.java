package com.mombaby.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.List;

/**
 * 闲置物品实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "secondhand_items")
public class SecondhandItem extends BaseEntity {

    public enum ItemCategory {
        STROLLER("stroller", "婴儿车"),
        CAR_SEAT("car_seat", "安全座椅"),
        CRIB("crib", "婴儿床"),
        TOY("toy", "玩具"),
        CLOTHING("clothing", "衣物"),
        FEEDING("feeding", "喂养用品"),
        BATHING("bathing", "洗浴用品"),
        OTHER("other", "其他");

        private final String code;
        private final String description;

        ItemCategory(String code, String description) {
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

    public enum ItemCondition {
        NEW("new", "全新"),
        LIKE_NEW("like_new", "九成新"),
        GOOD("good", "良好"),
        FAIR("fair", "一般"),
        POOR("poor", "较差");

        private final String code;
        private final String description;

        ItemCondition(String code, String description) {
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

    public enum ItemStatus {
        AVAILABLE("available", "可售"),
        RESERVED("reserved", "已预订"),
        SOLD("sold", "已售出"),
        HIDDEN("hidden", "已隐藏");

        private final String code;
        private final String description;

        ItemStatus(String code, String description) {
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

    @NotNull(message = "用户ID不能为空")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "物品标题不能为空")
    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", length = 50)
    private ItemCategory category;

    private BigDecimal price;

    @Column(name = "original_price")
    private BigDecimal originalPrice;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ItemCondition condition;

    @ElementCollection
    @CollectionTable(name = "item_photos", joinColumns = @JoinColumn(name = "item_id"))
    @Column(name = "photo_url")
    private List<String> photos;

    @Column(name = "sterilization_proof_url")
    private String sterilizationProofUrl; // 消毒证明

    @Column(name = "age_range", length = 50)
    private String ageRange; // 适用年龄范围

    @Column(length = 100)
    private String brand;

    @Column(columnDefinition = "JSON")
    private String location; // JSON格式存储物品位置

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ItemStatus status = ItemStatus.AVAILABLE;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "like_count", nullable = false)
    private Integer likeCount = 0;

}