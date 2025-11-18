package com.mombaby.service.impl;

import com.mombaby.dto.GrowthRecordDTO;
import com.mombaby.entity.Baby;
import com.mombaby.entity.GrowthRecord;
import com.mombaby.repository.BabyRepository;
import com.mombaby.repository.GrowthRecordRepository;
import com.mombaby.service.GrowthRecordService;
import lombok.RequiredArgsConstructor;
import lombok.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 成长记录服务实现类
 */
@Service
@RequiredArgsConstructor
@Transactional
public class GrowthRecordServiceImpl implements GrowthRecordService {

    private final GrowthRecordRepository growthRecordRepository;
    private final BabyRepository babyRepository;

    @Override
    public GrowthRecord addGrowthRecord(@NonNull Long userId, GrowthRecordDTO growthRecordDTO) {
        // 验证宝宝是否属于当前用户
        Baby baby = babyRepository.findByIdAndUserId(growthRecordDTO.getBabyId(), userId)
                .orElseThrow(() -> new RuntimeException("宝宝档案不存在或无权限访问"));

        // 检查该日期是否已有记录
        if (growthRecordRepository.findByBabyIdAndRecordDate(growthRecordDTO.getBabyId(), 
                growthRecordDTO.getRecordDate()).isPresent()) {
            throw new RuntimeException("该日期已有成长记录");
        }

        GrowthRecord growthRecord = new GrowthRecord();
        growthRecord.setBaby(baby);
        growthRecord.setRecordDate(growthRecordDTO.getRecordDate());
        growthRecord.setWeight(growthRecordDTO.getWeight());
        growthRecord.setHeight(growthRecordDTO.getHeight());
        growthRecord.setHeadCircumference(growthRecordDTO.getHeadCircumference());
        growthRecord.setNotes(growthRecordDTO.getNotes());

        return growthRecordRepository.save(growthRecord);
    }

    @Override
    public GrowthRecord updateGrowthRecord(@NonNull Long recordId, @NonNull Long userId, GrowthRecordDTO growthRecordDTO) {
        GrowthRecord growthRecord = growthRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("成长记录不存在"));

        // 验证宝宝是否属于当前用户
        if (!babyRepository.existsByIdAndUserId(growthRecord.getBaby().getId(), userId)) {
            throw new RuntimeException("无权限访问该记录");
        }

        // 检查是否与其他记录日期冲突
        if (!growthRecord.getRecordDate().equals(growthRecordDTO.getRecordDate())) {
            if (growthRecordRepository.findByBabyIdAndRecordDate(growthRecordDTO.getBabyId(), 
                    growthRecordDTO.getRecordDate()).isPresent()) {
                throw new RuntimeException("该日期已有成长记录");
            }
        }

        growthRecord.setRecordDate(growthRecordDTO.getRecordDate());
        growthRecord.setWeight(growthRecordDTO.getWeight());
        growthRecord.setHeight(growthRecordDTO.getHeight());
        growthRecord.setHeadCircumference(growthRecordDTO.getHeadCircumference());
        growthRecord.setNotes(growthRecordDTO.getNotes());

        return growthRecordRepository.save(growthRecord);
    }

    @Override
    public void deleteGrowthRecord(@NonNull Long recordId, @NonNull Long userId) {
        GrowthRecord growthRecord = growthRecordRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("成长记录不存在"));

        // 验证宝宝是否属于当前用户
        if (!babyRepository.existsByIdAndUserId(growthRecord.getBaby().getId(), userId)) {
            throw new RuntimeException("无权限访问该记录");
        }

        growthRecordRepository.delete(growthRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrowthRecord> getBabyGrowthRecords(@NonNull Long userId, @NonNull Long babyId) {
        // 验证宝宝是否属于当前用户
        if (!babyRepository.existsByIdAndUserId(babyId, userId)) {
            throw new RuntimeException("宝宝档案不存在或无权限访问");
        }

        return growthRecordRepository.findByBabyIdOrderByRecordDateDesc(babyId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrowthRecord> getGrowthRecordsByDateRange(@NonNull Long userId, @NonNull Long babyId, 
                                                         LocalDate startDate, LocalDate endDate) {
        // 验证宝宝是否属于当前用户
        if (!babyRepository.existsByIdAndUserId(babyId, userId)) {
            throw new RuntimeException("宝宝档案不存在或无权限访问");
        }

        return growthRecordRepository.findRecordsByDateRange(babyId, startDate, endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public GrowthRecord getLatestGrowthRecord(@NonNull Long userId, @NonNull Long babyId) {
        // 验证宝宝是否属于当前用户
        if (!babyRepository.existsByIdAndUserId(babyId, userId)) {
            throw new RuntimeException("宝宝档案不存在或无权限访问");
        }

        List<GrowthRecord> records = growthRecordRepository.findLatestRecordsByBabyId(babyId);
        return records.isEmpty() ? null : records.get(0);
    }
}