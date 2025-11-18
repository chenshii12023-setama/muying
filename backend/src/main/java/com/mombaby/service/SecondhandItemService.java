package com.mombaby.service;

import com.mombaby.entity.SecondhandItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 闲置物品服务接口
 */
public interface SecondhandItemService {

    /**
     * 创建闲置物品
     */
    SecondhandItem createItem(Long userId, SecondhandItem item);

    /**
     * 更新闲置物品
     */
    SecondhandItem updateItem(Long itemId, Long userId, SecondhandItem item);

    /**
     * 删除闲置物品
     */
    void deleteItem(Long itemId, Long userId);

    /**
     * 根据ID获取物品信息
     */
    SecondhandItem getItemById(Long itemId);

    /**
     * 获取用户的闲置物品列表
     */
    List<SecondhandItem> getUserItems(Long userId);

    /**
     * 获取可用物品列表（分页）
     */
    Page<SecondhandItem> getAvailableItems(Pageable pageable);

    /**
     * 根据分类获取物品列表
     */
    List<SecondhandItem> getItemsByCategory(SecondhandItem.ItemCategory category);

    /**
     * 搜索物品
     */
    Page<SecondhandItem> searchItems(String search, 
                                  SecondhandItem.ItemCategory category, 
                                  Pageable pageable);

    /**
     * 获取热门物品
     */
    List<SecondhandItem> getPopularItems();

}