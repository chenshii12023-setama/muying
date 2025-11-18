package com.mombaby.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

import java.util.List;

/**
 * 母婴设施实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "maternal_facilities")
public class MaternalFacility extends BaseEntity {

    public enum FacilityType {
        NURSING_ROOM("nursing_room", "母婴室"),
        PLAYGROUND("playground", "游乐区"),
        HOSPITAL("hospital", "医院"),
        SHOPPING_MALL("shopping_mall", "商场"),
        PARK("park", "公园");

        private final String code;
        private final String description;

        FacilityType(String code, String description) {
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

    @NotBlank(message = "设施名称不能为空")
    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "facility_type", length = 50)
    private FacilityType facilityType;

    @NotNull(message = "纬度不能为空")
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;

    @NotNull(message = "经度不能为空")
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;

    @NotBlank(message = "地址不能为空")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "opening_hours", columnDefinition = "JSON")
    private String openingHours; // JSON格式存储营业时间

    @Column(columnDefinition = "JSON")
    private String features; // JSON格式存储设施特点

    @ElementCollection
    @CollectionTable(name = "facility_photos", joinColumns = @JoinColumn(name = "facility_id"))
    @Column(name = "photo_url")
    private List<String> photos;

    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by")
    private User submittedBy;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

}