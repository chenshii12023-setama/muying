package com.mombaby.repository;

import com.mombaby.entity.Baby;
import com.mombaby.entity.GrowthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 生长记录数据访问接口
 */
@Repository
public interface GrowthRecordRepository extends JpaRepository<GrowthRecord, Long> {

    List<GrowthRecord> findByBaby(Baby baby);

    List<GrowthRecord> findByBabyId(Long babyId);

    List<GrowthRecord> findByBabyIdOrderByRecordDateDesc(Long babyId);

    Optional<GrowthRecord> findByBabyIdAndRecordDate(Long babyId, LocalDate recordDate);

    @Query("SELECT gr FROM GrowthRecord gr WHERE gr.baby.id = :babyId ORDER BY gr.recordDate DESC")
    List<GrowthRecord> findLatestRecordsByBabyId(@Param("babyId") Long babyId);

    @Query("SELECT gr FROM GrowthRecord gr WHERE gr.baby.id = :babyId AND gr.recordDate BETWEEN :startDate AND :endDate ORDER BY gr.recordDate")
    List<GrowthRecord> findRecordsByDateRange(@Param("babyId") Long babyId, 
                                             @Param("startDate") LocalDate startDate, 
                                             @Param("endDate") LocalDate endDate);

}