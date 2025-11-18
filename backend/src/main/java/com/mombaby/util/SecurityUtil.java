package com.mombaby.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * 安全工具类
 */
@Slf4j
@Component
public class SecurityUtil {

    /**
     * 获取当前认证的用户名
     */
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }

    /**
     * 获取当前用户ID（从JWT token中解析）
     * 注意：这里需要根据实际的JWT实现来解析
     */
    public static Long getCurrentUserId() {
        // 实际项目中，这里应该从JWT token中解析用户ID
        // 暂时返回一个示例值，实际使用时需要实现完整的JWT解析逻辑
        return 1L;
    }

    /**
     * 检查当前用户是否为管理员
     */
    public static boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && 
               authentication.getAuthorities().stream()
                   .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }

    /**
     * 检查当前用户是否有权限访问指定资源
     */
    public static boolean hasAccessToResource(Long resourceUserId) {
        if (isAdmin()) {
            return true;
        }
        
        Long currentUserId = getCurrentUserId();
        return currentUserId != null && currentUserId.equals(resourceUserId);
    }

}