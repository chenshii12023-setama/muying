package com.mombaby.service;

import com.mombaby.dto.UserLoginDTO;
import com.mombaby.dto.UserRegistrationDTO;
import com.mombaby.entity.User;

/**
 * 用户服务接口
 */
public interface UserService {

    /**
     * 用户注册
     */
    User register(UserRegistrationDTO registrationDTO);

    /**
     * 用户登录
     */
    User login(UserLoginDTO loginDTO);

    /**
     * 根据用户名查找用户
     */
    User findByUsername(String username);

    /**
     * 根据ID查找用户
     */
    User findById(Long id);

    /**
     * 更新用户信息
     */
    User updateUser(Long userId, User userDetails);

    /**
     * 根据微信OpenID查找用户
     */
    User findByWechatOpenid(String wechatOpenid);

    /**
     * 微信登录/注册
     */
    User loginWithWechat(String wechatOpenid, String nickname, String avatarUrl);

}