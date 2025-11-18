package com.mombaby.service.impl;

import com.mombaby.entity.SecondhandItem;
import com.mombaby.entity.User;
import com.mombaby.repository.SecondhandItemRepository;
import com.mombaby.repository.UserRepository;
import com.mombaby.service.SecondhandItemService;
import lombok.RequiredArgsConstructor;
import lombok.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 闲置物品服务实现类
 */
@Service
@RequiredArgsConstructor
@Transactional
public class SecondhandItemServiceImpl implements SecondhandItemService {

    private final SecondhandItemRepository itemRepository;
    private final UserRepository userRepository;

    @Override
    public SecondhandItem createItem(@NonNull Long userId, SecondhandItem item) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        item.setUser(user);
        item.setStatus(SecondhandItem.ItemStatus.AVAILABLE);
        item.setViewCount(0);
        item.setLikeCount(0);

        return itemRepository.save(item);
    }

    @Override
    public SecondhandItem updateItem(@NonNull Long itemId, @NonNull Long userId, SecondhandItem item) {
        SecondhandItem existingItem = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("物品不存在"));

        // 验证权限
        if (!existingItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权限修改该物品");
        }

        // 更新允许修改的字段
        existingItem.setTitle(item.getTitle());
        existingItem.setDescription(item.getDescription());
        existingItem.setCategory(item.getCategory());
        existingItem.setPrice(item.getPrice());
        existingItem.setOriginalPrice(item.getOriginalPrice());
        existingItem.setCondition(item.getCondition());
        existingItem.setPhotos(item.getPhotos());
        existingItem.setSterilizationProofUrl(item.getSterilizationProofUrl());
        existingItem.setAgeRange(item.getAgeRange());
        existingItem.setBrand(item.getBrand());
        existingItem.setLocation(item.getLocation());

        return itemRepository.save(existingItem);
    }

    @Override
    public void deleteItem(@NonNull Long itemId, @NonNull Long userId) {
        SecondhandItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("物品不存在"));

        // 验证权限
        if (!item.getUser().getId().equals(userId)) {
            throw new RuntimeException("无权限删除该物品");
        }

        // 软删除：设置为隐藏状态
        item.setStatus(SecondhandItem.ItemStatus.HIDDEN);
        itemRepository.save(item);
    }

    @Override
    @Transactional(readOnly = true)
    public SecondhandItem getItemById(@NonNull Long itemId) {
        SecondhandItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("物品不存在"));
        
        // 增加浏览次数
        item.setViewCount(item.getViewCount() + 1);
        itemRepository.save(item);
        
        return item;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SecondhandItem> getUserItems(@NonNull Long userId) {
        return itemRepository.findUserItemsByDate(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SecondhandItem> getAvailableItems(Pageable pageable) {
        return itemRepository.findAvailableItems(SecondhandItem.ItemStatus.AVAILABLE, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SecondhandItem> getItemsByCategory(SecondhandItem.ItemCategory category) {
        return itemRepository.findByCategoryAndStatus(category, SecondhandItem.ItemStatus.AVAILABLE);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SecondhandItem> searchItems(String search, 
                                              SecondhandItem.ItemCategory category, 
                                              Pageable pageable) {
        if (search == null || search.trim().isEmpty()) {
            search = "";
        }
        
        return itemRepository.searchItems(category, SecondhandItem.ItemStatus.AVAILABLE, search, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SecondhandItem> getPopularItems() {
        return itemRepository.findPopularItems(SecondhandItem.ItemStatus.AVAILABLE);
    }
}