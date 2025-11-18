package com.mombaby.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 生长记录DTO
 */
@Data
public class GrowthRecordDTO {

    private Long id;

    @NotNull(message = "宝宝ID不能为空")
    private Long babyId;

    @NotNull(message = "记录日期不能为空")
    private LocalDate recordDate;

    @NotNull(message = "体重不能为空")
    private BigDecimal weight;

    @NotNull(message = "身高不能为空")
    private BigDecimal height;

    private BigDecimal headCircumference;

    private String notes;

}