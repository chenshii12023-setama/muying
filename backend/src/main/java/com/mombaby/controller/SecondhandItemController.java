package com.mombaby.controller;

import com.mombaby.common.Result;
import com.mombaby.entity.SecondhandItem;
import com.mombaby.service.SecondhandItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 闲置物品控制器
 */
@RestController
@RequestMapping("/secondhand-items")
@RequiredArgsConstructor
public class SecondhandItemController {

    private final SecondhandItemService itemService;

    /**
     * 创建闲置物品
     */
    @PostMapping
    public Result<SecondhandItem> createItem(@Valid @RequestBody SecondhandItem item,
                                              Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            SecondhandItem created = itemService.createItem(userId, item);
            return Result.success("物品发布成功", created);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新闲置物品
     */
    @PutMapping("/{id}")
    public Result<SecondhandItem> updateItem(@PathVariable Long id,
                                             @Valid @RequestBody SecondhandItem item,
                                             Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            SecondhandItem updated = itemService.updateItem(id, userId, item);
            return Result.success("物品更新成功", updated);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除闲置物品
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteItem(@PathVariable Long id, Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            itemService.deleteItem(id, userId);
            return Result.success("物品删除成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 根据ID获取物品详情
     */
    @GetMapping("/{id}")
    public Result<SecondhandItem> getItemById(@PathVariable Long id) {
        try {
            SecondhandItem item = itemService.getItemById(id);
            return Result.success(item);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取用户的闲置物品列表
     */
    @GetMapping("/my-items")
    public Result<List<SecondhandItem>> getUserItems(Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            List<SecondhandItem> items = itemService.getUserItems(userId);
            return Result.success(items);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取可用物品列表（分页）
     */
    @GetMapping
    public Result<Page<SecondhandItem>> getAvailableItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<SecondhandItem> items = itemService.getAvailableItems(pageable);
            return Result.success(items);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 根据分类获取物品列表
     */
    @GetMapping("/category/{category}")
    public Result<List<SecondhandItem>> getItemsByCategory(@PathVariable String category) {
        try {
            SecondhandItem.ItemCategory categoryEnum = SecondhandItem.ItemCategory.valueOf(category.toUpperCase());
            List<SecondhandItem> items = itemService.getItemsByCategory(categoryEnum);
            return Result.success(items);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 搜索物品
     */
    @GetMapping("/search")
    public Result<Page<SecondhandItem>> searchItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            SecondhandItem.ItemCategory categoryEnum = null;
            if (category != null && !category.isEmpty()) {
                categoryEnum = SecondhandItem.ItemCategory.valueOf(category.toUpperCase());
            }

            Pageable pageable = PageRequest.of(page, size);
            Page<SecondhandItem> items = itemService.searchItems(search, categoryEnum, pageable);
            return Result.success(items);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取热门物品
     */
    @GetMapping("/popular")
    public Result<List<SecondhandItem>> getPopularItems() {
        try {
            List<SecondhandItem> items = itemService.getPopularItems();
            return Result.success(items);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取当前用户ID（简化版）
     */
    private Long getCurrentUserId(Authentication authentication) {
        // 这里应该从JWT token中解析用户ID
        // 暂时返回1L，实际项目中需要实现
        return 1L;
    }

}