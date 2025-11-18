package com.mombaby.service.impl;

import com.mombaby.entity.MaternalFacility;
import com.mombaby.entity.User;
import com.mombaby.repository.MaternalFacilityRepository;
import com.mombaby.repository.UserRepository;
import com.mombaby.service.MaternalFacilityService;
import lombok.RequiredArgsConstructor;
import lombok.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * 母婴设施服务实现类
 */
@Service
@RequiredArgsConstructor
@Transactional
public class MaternalFacilityServiceImpl implements MaternalFacilityService {

    private final MaternalFacilityRepository facilityRepository;
    private final UserRepository userRepository;

    @Override
    public MaternalFacility createFacility(@NonNull Long userId, MaternalFacility facility) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        facility.setSubmittedBy(user);
        facility.setIsVerified(false);
        facility.setAverageRating(BigDecimal.ZERO);
        facility.setReviewCount(0);

        return facilityRepository.save(facility);
    }

    @Override
    public MaternalFacility updateFacility(@NonNull Long facilityId, @NonNull Long userId, MaternalFacility facility) {
        MaternalFacility existingFacility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("设施不存在"));

        // 只有管理员或设施提交者可以修改
        if (!existingFacility.getSubmittedBy().getId().equals(userId)) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("用户不存在"));
            if (!user.getRole().equals(User.Role.ADMIN)) {
                throw new RuntimeException("无权限修改该设施");
            }
        }

        // 更新设施信息
        existingFacility.setName(facility.getName());
        existingFacility.setFacilityType(facility.getFacilityType());
        existingFacility.setLatitude(facility.getLatitude());
        existingFacility.setLongitude(facility.getLongitude());
        existingFacility.setAddress(facility.getAddress());
        existingFacility.setDescription(facility.getDescription());
        existingFacility.setOpeningHours(facility.getOpeningHours());
        existingFacility.setFeatures(facility.getFeatures());
        existingFacility.setPhotos(facility.getPhotos());

        return facilityRepository.save(existingFacility);
    }

    @Override
    public void deleteFacility(@NonNull Long facilityId, @NonNull Long userId) {
        MaternalFacility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("设施不存在"));

        // 只有管理员或设施提交者可以删除
        if (!facility.getSubmittedBy().getId().equals(userId)) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("用户不存在"));
            if (!user.getRole().equals(User.Role.ADMIN)) {
                throw new RuntimeException("无权限删除该设施");
            }
        }

        facilityRepository.delete(facility);
    }

    @Override
    @Transactional(readOnly = true)
    public MaternalFacility getFacilityById(@NonNull Long facilityId) {
        return facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("设施不存在"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaternalFacility> getNearbyFacilities(BigDecimal latitude, BigDecimal longitude, BigDecimal radius) {
        return facilityRepository.findNearbyFacilities(latitude, longitude, radius);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaternalFacility> getNearbyFacilitiesByType(BigDecimal latitude, BigDecimal longitude, 
                                                            BigDecimal radius, MaternalFacility.FacilityType facilityType) {
        return facilityRepository.findNearbyFacilitiesByType(latitude, longitude, radius, facilityType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaternalFacility> getFacilitiesByType(MaternalFacility.FacilityType facilityType) {
        return facilityRepository.findByFacilityType(facilityType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaternalFacility> getUserFacilities(@NonNull Long userId) {
        return facilityRepository.findBySubmittedById(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaternalFacility> getTopRatedFacilities() {
        return facilityRepository.findTopRatedFacilities();
    }
}