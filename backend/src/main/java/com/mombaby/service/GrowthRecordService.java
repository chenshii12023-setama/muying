package com.mombaby.service;

import com.mombaby.dto.GrowthRecordDTO;
import com.mombaby.entity.GrowthRecord;

import java.time.LocalDate;
import java.util.List;

/**
 * 成长记录服务接口
 */
public interface GrowthRecordService {

    /**
     * 添加成长记录
     */
    GrowthRecord addGrowthRecord(Long userId, GrowthRecordDTO growthRecordDTO);

    /**
     * 更新成长记录
     */
    GrowthRecord updateGrowthRecord(Long recordId, Long userId, GrowthRecordDTO growthRecordDTO);

    /**
     * 删除成长记录
     */
    void deleteGrowthRecord(Long recordId, Long userId);

    /**
     * 获取宝宝的成长记录列表
     */
    List<GrowthRecord> getBabyGrowthRecords(Long userId, Long babyId);

    /**
     * 根据日期范围获取成长记录
     */
    List<GrowthRecord> getGrowthRecordsByDateRange(Long userId, Long babyId, LocalDate startDate, LocalDate endDate);

    /**
     * 获取最新的成长记录
     */
    GrowthRecord getLatestGrowthRecord(Long userId, Long babyId);

}