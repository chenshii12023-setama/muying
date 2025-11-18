package com.mombaby.service;

import com.mombaby.entity.BabyFoodRecipe;

import java.util.List;

/**
 * 辅食食谱服务接口
 */
public interface BabyFoodRecipeService {

    /**
     * 创建辅食食谱
     */
    BabyFoodRecipe createRecipe(Long userId, BabyFoodRecipe recipe);

    /**
     * 更新辅食食谱
     */
    BabyFoodRecipe updateRecipe(Long recipeId, Long userId, BabyFoodRecipe recipe);

    /**
     * 删除辅食食谱
     */
    void deleteRecipe(Long recipeId, Long userId);

    /**
     * 根据ID获取食谱
     */
    BabyFoodRecipe getRecipeById(Long recipeId);

    /**
     * 根据适用月龄获取食谱
     */
    List<BabyFoodRecipe> getRecipesBySuitableAge(String suitableAge);

    /**
     * 根据难度获取食谱
     */
    List<BabyFoodRecipe> getRecipesByDifficulty(BabyFoodRecipe.Difficulty difficulty);

    /**
     * 获取精选食谱
     */
    List<BabyFoodRecipe> getFeaturedRecipes();

    /**
     * 搜索食谱
     */
    List<BabyFoodRecipe> searchRecipes(String keyword);

    /**
     * 获取过滤后的食谱
     */
    List<BabyFoodRecipe> getFilteredRecipes(String suitableAge, BabyFoodRecipe.Difficulty difficulty);

}