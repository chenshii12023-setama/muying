package com.mombaby.service;

import com.mombaby.dto.BabyDTO;
import com.mombaby.entity.Baby;

import java.util.List;

/**
 * 宝宝服务接口
 */
public interface BabyService {

    /**
     * 创建宝宝档案
     */
    Baby createBaby(Long userId, BabyDTO babyDTO);

    /**
     * 更新宝宝信息
     */
    Baby updateBaby(Long babyId, Long userId, BabyDTO babyDTO);

    /**
     * 删除宝宝档案
     */
    void deleteBaby(Long babyId, Long userId);

    /**
     * 获取用户的宝宝列表
     */
    List<Baby> getUserBabies(Long userId);

    /**
     * 根据ID获取宝宝信息
     */
    Baby getBabyById(Long babyId, Long userId);

}