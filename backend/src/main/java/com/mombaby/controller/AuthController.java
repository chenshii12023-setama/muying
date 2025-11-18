package com.mombaby.controller;

import com.mombaby.common.Result;
import com.mombaby.dto.UserLoginDTO;
import com.mombaby.dto.UserRegistrationDTO;
import com.mombaby.entity.User;
import com.mombaby.service.UserService;
import com.mombaby.util.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<Map<String, Object>> register(@Valid @RequestBody UserRegistrationDTO registrationDTO) {
        try {
            User user = userService.register(registrationDTO);
            String token = jwtTokenUtil.generateToken(user.getUsername(), user.getId());

            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("user", user);

            return Result.success("注册成功", data);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody UserLoginDTO loginDTO) {
        try {
            User user = userService.login(loginDTO);
            String token = jwtTokenUtil.generateToken(user.getUsername(), user.getId());

            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("user", user);

            return Result.success("登录成功", data);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 微信登录
     */
    @PostMapping("/wechat-login")
    public Result<Map<String, Object>> wechatLogin(@RequestParam String openid,
                                                  @RequestParam(required = false) String nickname,
                                                  @RequestParam(required = false) String avatarUrl) {
        try {
            User user = userService.loginWithWechat(openid, nickname, avatarUrl);
            String token = jwtTokenUtil.generateToken(user.getUsername(), user.getId());

            Map<String, Object> data = new HashMap<>();
            data.put("token", token);
            data.put("user", user);

            return Result.success("登录成功", data);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 刷新token
     */
    @PostMapping("/refresh-token")
    public Result<Map<String, Object>> refreshToken(@RequestHeader("Authorization") String authorization) {
        try {
            String token = authorization.substring(7); // 去掉 "Bearer "
            String newToken = jwtTokenUtil.refreshToken(token);

            Map<String, Object> data = new HashMap<>();
            data.put("token", newToken);

            return Result.success("Token刷新成功", data);
        } catch (Exception e) {
            return Result.error("Token刷新失败");
        }
    }

}