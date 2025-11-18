package com.mombaby.service;

import com.mombaby.entity.MaternalFacility;

import java.math.BigDecimal;
import java.util.List;

/**
 * 母婴设施服务接口
 */
public interface MaternalFacilityService {

    /**
     * 创建母婴设施
     */
    MaternalFacility createFacility(Long userId, MaternalFacility facility);

    /**
     * 更新母婴设施
     */
    MaternalFacility updateFacility(Long facilityId, Long userId, MaternalFacility facility);

    /**
     * 删除母婴设施
     */
    void deleteFacility(Long facilityId, Long userId);

    /**
     * 根据ID获取设施信息
     */
    MaternalFacility getFacilityById(Long facilityId);

    /**
     * 获取附近设施
     */
    List<MaternalFacility> getNearbyFacilities(BigDecimal latitude, BigDecimal longitude, BigDecimal radius);

    /**
     * 根据类型获取附近设施
     */
    List<MaternalFacility> getNearbyFacilitiesByType(BigDecimal latitude, BigDecimal longitude, 
                                                      BigDecimal radius, MaternalFacility.FacilityType facilityType);

    /**
     * 根据类型获取设施列表
     */
    List<MaternalFacility> getFacilitiesByType(MaternalFacility.FacilityType facilityType);

    /**
     * 获取用户提交的设施
     */
    List<MaternalFacility> getUserFacilities(Long userId);

    /**
     * 获取热门设施
     */
    List<MaternalFacility> getTopRatedFacilities();

}