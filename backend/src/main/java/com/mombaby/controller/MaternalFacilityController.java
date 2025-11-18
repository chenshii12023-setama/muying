package com.mombaby.controller;

import com.mombaby.common.Result;
import com.mombaby.entity.MaternalFacility;
import com.mombaby.service.MaternalFacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;

/**
 * 母婴设施控制器
 */
@RestController
@RequestMapping("/facilities")
@RequiredArgsConstructor
public class MaternalFacilityController {

    private final MaternalFacilityService facilityService;

    /**
     * 创建母婴设施
     */
    @PostMapping
    public Result<MaternalFacility> createFacility(@Valid @RequestBody MaternalFacility facility, 
                                                Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            MaternalFacility created = facilityService.createFacility(userId, facility);
            return Result.success("设施创建成功", created);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新母婴设施
     */
    @PutMapping("/{id}")
    public Result<MaternalFacility> updateFacility(@PathVariable Long id, 
                                               @Valid @RequestBody MaternalFacility facility,
                                               Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            MaternalFacility updated = facilityService.updateFacility(id, userId, facility);
            return Result.success("设施更新成功", updated);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除母婴设施
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteFacility(@PathVariable Long id, Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            facilityService.deleteFacility(id, userId);
            return Result.success("设施删除成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 根据ID获取设施信息
     */
    @GetMapping("/{id}")
    public Result<MaternalFacility> getFacilityById(@PathVariable Long id) {
        try {
            MaternalFacility facility = facilityService.getFacilityById(id);
            return Result.success(facility);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取附近设施
     */
    @GetMapping("/nearby")
    public Result<List<MaternalFacility>> getNearbyFacilities(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(defaultValue = "5") BigDecimal radius) {
        try {
            List<MaternalFacility> facilities = facilityService.getNearbyFacilities(latitude, longitude, radius);
            return Result.success(facilities);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 根据类型获取附近设施
     */
    @GetMapping("/nearby/by-type")
    public Result<List<MaternalFacility>> getNearbyFacilitiesByType(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(defaultValue = "5") BigDecimal radius,
            @RequestParam String type) {
        try {
            MaternalFacility.FacilityType facilityType = MaternalFacility.FacilityType.valueOf(type.toUpperCase());
            List<MaternalFacility> facilities = facilityService.getNearbyFacilitiesByType(
                    latitude, longitude, radius, facilityType);
            return Result.success(facilities);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 根据类型获取设施列表
     */
    @GetMapping("/by-type/{type}")
    public Result<List<MaternalFacility>> getFacilitiesByType(@PathVariable String type) {
        try {
            MaternalFacility.FacilityType facilityType = MaternalFacility.FacilityType.valueOf(type.toUpperCase());
            List<MaternalFacility> facilities = facilityService.getFacilitiesByType(facilityType);
            return Result.success(facilities);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取用户提交的设施
     */
    @GetMapping("/my-facilities")
    public Result<List<MaternalFacility>> getUserFacilities(Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            List<MaternalFacility> facilities = facilityService.getUserFacilities(userId);
            return Result.success(facilities);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取热门设施
     */
    @GetMapping("/top-rated")
    public Result<List<MaternalFacility>> getTopRatedFacilities() {
        try {
            List<MaternalFacility> facilities = facilityService.getTopRatedFacilities();
            return Result.success(facilities);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取当前用户ID（简化版，实际应该从JWT中获取）
     */
    private Long getCurrentUserId(Authentication authentication) {
        // 这里应该从JWT token中解析用户ID
        // 暂时返回1L，实际项目中需要实现
        return 1L;
    }

}