package com.mombaby.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.List;

/**
 * 里程碑记录实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "milestones")
public class Milestone extends BaseEntity {

    @NotNull(message = "宝宝ID不能为空")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "baby_id", nullable = false)
    private Baby baby;

    @NotNull(message = "里程碑类型不能为空")
    @Column(name = "milestone_type", nullable = false, length = 50)
    private String milestoneType;

    @NotNull(message = "里程碑日期不能为空")
    @Column(name = "milestone_date", nullable = false)
    private LocalDate milestoneDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "milestone_photos", joinColumns = @JoinColumn(name = "milestone_id"))
    @Column(name = "photo_url")
    private List<String> photos;

    @Column(name = "is_shared", nullable = false)
    private Boolean isShared = false;

}