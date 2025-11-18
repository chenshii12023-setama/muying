package com.mombaby.service.impl;

import com.mombaby.dto.BabyDTO;
import com.mombaby.entity.Baby;
import com.mombaby.entity.User;
import com.mombaby.repository.BabyRepository;
import com.mombaby.repository.UserRepository;
import com.mombaby.service.BabyService;
import lombok.RequiredArgsConstructor;
import lombok.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 宝宝服务实现类
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BabyServiceImpl implements BabyService {

    private final BabyRepository babyRepository;
    private final UserRepository userRepository;

    @Override
    public Baby createBaby(@NonNull Long userId, BabyDTO babyDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Baby baby = new Baby();
        baby.setUser(user);
        baby.setName(babyDTO.getName());
        baby.setNickname(babyDTO.getNickname());
        baby.setBirthDate(babyDTO.getBirthDate());
        baby.setGender(babyDTO.getGender());
        baby.setBloodType(babyDTO.getBloodType());
        baby.setBirthWeight(babyDTO.getBirthWeight());
        baby.setBirthHeight(babyDTO.getBirthHeight());
        baby.setAvatarUrl(babyDTO.getAvatarUrl());
        baby.setIsActive(babyDTO.getIsActive() != null ? babyDTO.getIsActive() : true);

        return babyRepository.save(baby);
    }

    @Override
    public Baby updateBaby(@NonNull Long babyId, @NonNull Long userId, BabyDTO babyDTO) {
        Baby baby = babyRepository.findByIdAndUserId(babyId, userId)
                .orElseThrow(() -> new RuntimeException("宝宝档案不存在或无权限访问"));

        if (babyDTO.getName() != null) {
            baby.setName(babyDTO.getName());
        }
        if (babyDTO.getNickname() != null) {
            baby.setNickname(babyDTO.getNickname());
        }
        if (babyDTO.getGender() != null) {
            baby.setGender(babyDTO.getGender());
        }
        if (babyDTO.getBloodType() != null) {
            baby.setBloodType(babyDTO.getBloodType());
        }
        if (babyDTO.getAvatarUrl() != null) {
            baby.setAvatarUrl(babyDTO.getAvatarUrl());
        }
        if (babyDTO.getIsActive() != null) {
            baby.setIsActive(babyDTO.getIsActive());
        }

        return babyRepository.save(baby);
    }

    @Override
    public void deleteBaby(@NonNull Long babyId, @NonNull Long userId) {
        Baby baby = babyRepository.findByIdAndUserId(babyId, userId)
                .orElseThrow(() -> new RuntimeException("宝宝档案不存在或无权限访问"));
        
        // 软删除：设置为不活跃状态
        baby.setIsActive(false);
        babyRepository.save(baby);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Baby> getUserBabies(Long userId) {
        return babyRepository.findActiveBabiesByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Baby getBabyById(@NonNull Long babyId, @NonNull Long userId) {
        return babyRepository.findByIdAndUserId(babyId, userId)
                .orElseThrow(() -> new RuntimeException("宝宝档案不存在或无权限访问"));
    }
}