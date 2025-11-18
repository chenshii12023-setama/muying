package com.mombaby.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 宝宝生长记录实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "baby_growth_records", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"baby_id", "record_date"}))
public class GrowthRecord extends BaseEntity {

    @NotNull(message = "宝宝ID不能为空")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "baby_id", nullable = false)
    private Baby baby;

    @NotNull(message = "记录日期不能为空")
    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @NotNull(message = "体重不能为空")
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal weight; // 体重(kg)

    @NotNull(message = "身高不能为空")
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal height; // 身高(cm)

    @Column(name = "head_circumference", precision = 5, scale = 2)
    private BigDecimal headCircumference; // 头围(cm)

    @Column(columnDefinition = "TEXT")
    private String notes;

}