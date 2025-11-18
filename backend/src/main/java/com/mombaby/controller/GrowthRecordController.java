package com.mombaby.controller;

import com.mombaby.common.Result;
import com.mombaby.dto.GrowthRecordDTO;
import com.mombaby.entity.GrowthRecord;
import com.mombaby.service.GrowthRecordService;
import com.mombaby.util.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

/**
 * 成长记录控制器
 */
@RestController
@RequestMapping("/growth-records")
@RequiredArgsConstructor
public class GrowthRecordController {

    private final GrowthRecordService growthRecordService;
    private final JwtTokenUtil jwtTokenUtil;

    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId(Authentication authentication) {
        // 从认证信息中获取用户名，然后从用户服务中获取用户ID
        return jwtTokenUtil.getUserIdFromToken(jwtTokenUtil.generateToken(authentication.getName(), null));
    }

    /**
     * 添加成长记录
     */
    @PostMapping
    public Result<GrowthRecord> addGrowthRecord(@Valid @RequestBody GrowthRecordDTO growthRecordDTO, 
                                                Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            GrowthRecord record = growthRecordService.addGrowthRecord(userId, growthRecordDTO);
            return Result.success("成长记录添加成功", record);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新成长记录
     */
    @PutMapping("/{id}")
    public Result<GrowthRecord> updateGrowthRecord(@PathVariable Long id, 
                                                    @Valid @RequestBody GrowthRecordDTO growthRecordDTO, 
                                                    Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            GrowthRecord record = growthRecordService.updateGrowthRecord(id, userId, growthRecordDTO);
            return Result.success("成长记录更新成功", record);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除成长记录
     */
    @DeleteMapping("/{id}")
    public Result<String> deleteGrowthRecord(@PathVariable Long id, Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            growthRecordService.deleteGrowthRecord(id, userId);
            return Result.success("成长记录删除成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取宝宝的成长记录列表
     */
    @GetMapping("/baby/{babyId}")
    public Result<List<GrowthRecord>> getBabyGrowthRecords(@PathVariable Long babyId, 
                                                           Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            List<GrowthRecord> records = growthRecordService.getBabyGrowthRecords(userId, babyId);
            return Result.success(records);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 根据日期范围获取成长记录
     */
    @GetMapping("/baby/{babyId}/range")
    public Result<List<GrowthRecord>> getGrowthRecordsByDateRange(
            @PathVariable Long babyId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            List<GrowthRecord> records = growthRecordService.getGrowthRecordsByDateRange(
                    userId, babyId, startDate, endDate);
            return Result.success(records);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取最新的成长记录
     */
    @GetMapping("/baby/{babyId}/latest")
    public Result<GrowthRecord> getLatestGrowthRecord(@PathVariable Long babyId, 
                                                     Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            GrowthRecord record = growthRecordService.getLatestGrowthRecord(userId, babyId);
            return Result.success(record);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

}