package com.mombaby.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 宝宝信息DTO
 */
@Data
public class BabyDTO {

    private Long id;

    @NotBlank(message = "宝宝姓名不能为空")
    private String name;

    private String nickname;

    @NotNull(message = "出生日期不能为空")
    private LocalDate birthDate;

    private String gender;

    private String bloodType;

    private BigDecimal birthWeight;

    private BigDecimal birthHeight;

    private String avatarUrl;

    private Boolean isActive;

}