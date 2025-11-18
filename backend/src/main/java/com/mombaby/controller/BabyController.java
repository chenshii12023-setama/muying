package com.mombaby.controller;

import com.mombaby.common.Result;
import com.mombaby.dto.BabyDTO;
import com.mombaby.entity.Baby;
import com.mombaby.service.BabyService;
import com.mombaby.util.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 宝宝管理控制器
 */
@RestController
@RequestMapping("/babies")
@RequiredArgsConstructor
public class BabyController {

    private final BabyService babyService;
    private final JwtTokenUtil jwtTokenUtil;

    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId(Authentication authentication) {
        return jwtTokenUtil.getUserIdFromToken(jwtTokenUtil.generateToken(authentication.getName(), null));
    }

    /**
     * 创建宝宝档案
     */
    @PostMapping
    public Result<Baby> createBaby(@Valid @RequestBody BabyDTO babyDTO, Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            Baby baby = babyService.createBaby(userId, babyDTO);
            return Result.success("宝宝档案创建成功", baby);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取用户的宝宝列表
     */
    @GetMapping
    public Result<List<Baby>> getUserBabies(Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            List<Baby> babies = babyService.getUserBabies(userId);
            return Result.success(babies);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 根据ID获取宝宝信息
     */
    @GetMapping("/{id}")
    public Result<Baby> getBabyById(@PathVariable Long id, Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            Baby baby = babyService.getBabyById(id, userId);
            return Result.success(baby);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新宝宝信息
     */
    @PutMapping("/{id}")
    public Result<Baby> updateBaby(@PathVariable Long id, 
                                   @Valid @RequestBody BabyDTO babyDTO, 
                                   Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            Baby baby = babyService.updateBaby(id, userId, babyDTO);
            return Result.success("宝宝信息更新成功", baby);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除宝宝档案
     */
    @DeleteMapping("/{id}")
    public Result<String> deleteBaby(@PathVariable Long id, Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            babyService.deleteBaby(id, userId);
            return Result.success("宝宝档案删除成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

}