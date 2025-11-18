package com.mombaby.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 宝宝实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "babies")
public class Baby extends BaseEntity {

    @NotNull(message = "用户ID不能为空")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "宝宝姓名不能为空")
    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "nickname", length = 50)
    private String nickname;

    @NotNull(message = "出生日期不能为空")
    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(length = 10)
    private String gender;

    @Column(name = "blood_type", length = 5)
    private String bloodType;

    @Column(name = "birth_weight", precision = 5, scale = 2)
    private BigDecimal birthWeight; // 出生体重(kg)

    @Column(name = "birth_height", precision = 5, scale = 2)
    private BigDecimal birthHeight; // 出生身高(cm)

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

}