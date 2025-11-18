package com.mombaby.repository;

import com.mombaby.entity.MaternalFacility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * 母婴设施数据访问接口
 */
@Repository
public interface MaternalFacilityRepository extends JpaRepository<MaternalFacility, Long> {

    List<MaternalFacility> findByFacilityType(MaternalFacility.FacilityType facilityType);

    List<MaternalFacility> findByIsVerified(Boolean isVerified);

    @Query("SELECT f FROM MaternalFacility f WHERE " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(f.latitude)) * " +
           "cos(radians(f.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(f.latitude)))) <= :radius")
    List<MaternalFacility> findNearbyFacilities(@Param("lat") BigDecimal latitude, 
                                                @Param("lng") BigDecimal longitude, 
                                                @Param("radius") BigDecimal radius);

    @Query("SELECT f FROM MaternalFacility f WHERE " +
           "f.facilityType = :facilityType AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(f.latitude)) * " +
           "cos(radians(f.longitude) - radians(:lng)) + sin(radians(:lat)) * " +
           "sin(radians(f.latitude)))) <= :radius")
    List<MaternalFacility> findNearbyFacilitiesByType(@Param("lat") BigDecimal latitude, 
                                                      @Param("lng") BigDecimal longitude, 
                                                      @Param("radius") BigDecimal radius,
                                                      @Param("facilityType") MaternalFacility.FacilityType facilityType);

    List<MaternalFacility> findBySubmittedById(Long userId);

    @Query("SELECT f FROM MaternalFacility f ORDER BY f.averageRating DESC, f.reviewCount DESC")
    List<MaternalFacility> findTopRatedFacilities();

}