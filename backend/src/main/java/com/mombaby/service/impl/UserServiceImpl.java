package com.mombaby.service.impl;

import com.mombaby.dto.UserLoginDTO;
import com.mombaby.dto.UserRegistrationDTO;
import com.mombaby.entity.User;
import com.mombaby.repository.UserRepository;
import com.mombaby.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 用户服务实现类
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User register(UserRegistrationDTO registrationDTO) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(registrationDTO.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        // 检查手机号是否已存在
        if (registrationDTO.getPhoneNumber() != null && 
            userRepository.existsByPhoneNumber(registrationDTO.getPhoneNumber())) {
            throw new RuntimeException("手机号已被注册");
        }

        // 检查邮箱是否已存在
        if (registrationDTO.getEmail() != null && 
            userRepository.existsByEmail(registrationDTO.getEmail())) {
            throw new RuntimeException("邮箱已被注册");
        }

        User user = new User();
        user.setUsername(registrationDTO.getUsername());
        user.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        user.setNickname(registrationDTO.getNickname());
        user.setPhoneNumber(registrationDTO.getPhoneNumber());
        user.setEmail(registrationDTO.getEmail());
        user.setWechatOpenid(registrationDTO.getWechatOpenid());
        user.setEnabled(true);
        user.setRole(User.Role.USER);

        return userRepository.save(user);
    }

    @Override
    public User login(UserLoginDTO loginDTO) {
        User user = userRepository.findByUsernameOrPhoneOrEmail(loginDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 验证密码
        if (!passwordEncoder.matches(loginDTO.getPassword(), user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        if (!user.getEnabled()) {
            throw new RuntimeException("账户已被禁用");
        }

        return user;
    }

    @Override
    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    @Override
    @Transactional(readOnly = true)
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    @Override
    public User updateUser(@NonNull Long userId, User userDetails) {
        User user = findById(userId);

        // 更新用户信息
        if (userDetails.getNickname() != null) {
            user.setNickname(userDetails.getNickname());
        }
        if (userDetails.getAvatarUrl() != null) {
            user.setAvatarUrl(userDetails.getAvatarUrl());
        }
        if (userDetails.getPhoneNumber() != null && !userDetails.getPhoneNumber().equals(user.getPhoneNumber())) {
            if (userRepository.existsByPhoneNumber(userDetails.getPhoneNumber())) {
                throw new RuntimeException("手机号已被使用");
            }
            user.setPhoneNumber(userDetails.getPhoneNumber());
        }
        if (userDetails.getEmail() != null && !userDetails.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userDetails.getEmail())) {
                throw new RuntimeException("邮箱已被使用");
            }
            user.setEmail(userDetails.getEmail());
        }
        if (userDetails.getGender() != null) {
            user.setGender(userDetails.getGender());
        }
        if (userDetails.getLocation() != null) {
            user.setLocation(userDetails.getLocation());
        }

        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User findByWechatOpenid(String wechatOpenid) {
        return userRepository.findByWechatOpenid(wechatOpenid).orElse(null);
    }

    @Override
    public User loginWithWechat(@NonNull String wechatOpenid, String nickname, String avatarUrl) {
        User user = findByWechatOpenid(wechatOpenid);
        
        if (user == null) {
            // 新用户，自动注册
            user = new User();
            user.setUsername("wx_" + wechatOpenid.substring(wechatOpenid.length() - 8));
            user.setPassword(passwordEncoder.encode(wechatOpenid)); // 使用openid作为初始密码
            user.setNickname(nickname);
            user.setAvatarUrl(avatarUrl);
            user.setWechatOpenid(wechatOpenid);
            user.setEnabled(true);
            user.setRole(User.Role.USER);
        } else {
            // 更新用户信息
            user.setNickname(nickname);
            user.setAvatarUrl(avatarUrl);
        }

        return userRepository.save(user);
    }
}