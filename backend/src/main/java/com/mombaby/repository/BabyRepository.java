package com.mombaby.repository;

import com.mombaby.entity.Baby;
import com.mombaby.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 宝宝数据访问接口
 */
@Repository
public interface BabyRepository extends JpaRepository<Baby, Long> {

    List<Baby> findByUser(User user);

    List<Baby> findByUserId(Long userId);

    List<Baby> findByUserIdAndIsActive(Long userId, Boolean isActive);

    Optional<Baby> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    @Query("SELECT b FROM Baby b WHERE b.user.id = :userId AND b.isActive = true ORDER BY b.createdAt DESC")
    List<Baby> findActiveBabiesByUserId(@Param("userId") Long userId);

}