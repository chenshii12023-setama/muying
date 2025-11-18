package com.mombaby.repository;

import com.mombaby.entity.BabyFoodRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 辅食食谱数据访问接口
 */
@Repository
public interface BabyFoodRecipeRepository extends JpaRepository<BabyFoodRecipe, Long> {

    List<BabyFoodRecipe> findBySuitableAge(String suitableAge);

    List<BabyFoodRecipe> findByDifficulty(BabyFoodRecipe.Difficulty difficulty);

    List<BabyFoodRecipe> findByIsFeatured(Boolean isFeatured);

    List<BabyFoodRecipe> findByCreatedById(Long createdById);

    @Query("SELECT r FROM BabyFoodRecipe r WHERE " +
           "(:suitableAge IS NULL OR r.suitableAge = :suitableAge) AND " +
           "(:difficulty IS NULL OR r.difficulty = :difficulty) ORDER BY r.viewCount DESC")
    List<BabyFoodRecipe> findFilteredRecipes(@Param("suitableAge") String suitableAge,
                                          @Param("difficulty") BabyFoodRecipe.Difficulty difficulty);

    @Query("SELECT r FROM BabyFoodRecipe r WHERE r.isFeatured = :isFeatured ORDER BY r.viewCount DESC")
    List<BabyFoodRecipe> findFeaturedRecipes(@Param("isFeatured") Boolean isFeatured);

    @Query("SELECT r FROM BabyFoodRecipe r WHERE LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY r.viewCount DESC")
    List<BabyFoodRecipe> searchRecipes(@Param("keyword") String keyword);

}