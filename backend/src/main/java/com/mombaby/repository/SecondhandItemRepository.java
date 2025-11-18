package com.mombaby.repository;

import com.mombaby.entity.SecondhandItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 闲置物品数据访问接口
 */
@Repository
public interface SecondhandItemRepository extends JpaRepository<SecondhandItem, Long> {

    List<SecondhandItem> findByUserId(Long userId);

    List<SecondhandItem> findByCategory(SecondhandItem.ItemCategory category);

    List<SecondhandItem> findByCategoryAndStatus(SecondhandItem.ItemCategory category, 
                                                SecondhandItem.ItemStatus status);

    List<SecondhandItem> findByStatus(SecondhandItem.ItemStatus status);

    @Query("SELECT i FROM SecondhandItem i WHERE i.status = :status ORDER BY i.createdAt DESC")
    Page<SecondhandItem> findAvailableItems(@Param("status") SecondhandItem.ItemStatus status, Pageable pageable);

    @Query("SELECT i FROM SecondhandItem i WHERE " +
           "(:category IS NULL OR i.category = :category) AND " +
           "i.status = :status AND " +
           "(LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<SecondhandItem> searchItems(@Param("category") SecondhandItem.ItemCategory category,
                                     @Param("status") SecondhandItem.ItemStatus status,
                                     @Param("search") String search,
                                     Pageable pageable);

    @Query("SELECT i FROM SecondhandItem i WHERE i.user.id = :userId ORDER BY i.createdAt DESC")
    List<SecondhandItem> findUserItemsByDate(@Param("userId") Long userId);

    @Query("SELECT i FROM SecondhandItem i WHERE i.status = :status ORDER BY i.viewCount DESC")
    List<SecondhandItem> findPopularItems(@Param("status") SecondhandItem.ItemStatus status);

}