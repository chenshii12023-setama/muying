package com.mombaby.service.impl;

import com.mombaby.entity.BabyFoodRecipe;
import com.mombaby.entity.User;
import com.mombaby.repository.BabyFoodRecipeRepository;
import com.mombaby.repository.UserRepository;
import com.mombaby.service.BabyFoodRecipeService;
import lombok.RequiredArgsConstructor;
import lombok.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 辅食食谱服务实现类
 */
@Service
@RequiredArgsConstructor
@Transactional
public class BabyFoodRecipeServiceImpl implements BabyFoodRecipeService {

    private final BabyFoodRecipeRepository recipeRepository;
    private final UserRepository userRepository;

    @Override
    public BabyFoodRecipe createRecipe(@NonNull Long userId, BabyFoodRecipe recipe) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        recipe.setCreatedBy(user);
        recipe.setViewCount(0);
        recipe.setLikeCount(0);
        recipe.setIsFeatured(false);

        return recipeRepository.save(recipe);
    }

    @Override
    public BabyFoodRecipe updateRecipe(@NonNull Long recipeId, @NonNull Long userId, BabyFoodRecipe recipe) {
        BabyFoodRecipe existingRecipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("食谱不存在"));

        // 验证权限（只有创建者或管理员可以修改）
        if (!existingRecipe.getCreatedBy().getId().equals(userId)) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("用户不存在"));
            if (!user.getRole().equals(User.Role.ADMIN)) {
                throw new RuntimeException("无权限修改该食谱");
            }
        }

        // 更新允许修改的字段
        existingRecipe.setTitle(recipe.getTitle());
        existingRecipe.setDescription(recipe.getDescription());
        existingRecipe.setSuitableAge(recipe.getSuitableAge());
        existingRecipe.setIngredients(recipe.getIngredients());
        existingRecipe.setSteps(recipe.getSteps());
        existingRecipe.setCookingTime(recipe.getCookingTime());
        existingRecipe.setDifficulty(recipe.getDifficulty());
        existingRecipe.setNutritionInfo(recipe.getNutritionInfo());
        existingRecipe.setAllergens(recipe.getAllergens());
        existingRecipe.setPhotos(recipe.getPhotos());

        return recipeRepository.save(existingRecipe);
    }

    @Override
    public void deleteRecipe(@NonNull Long recipeId, @NonNull Long userId) {
        BabyFoodRecipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("食谱不存在"));

        // 验证权限（只有创建者或管理员可以删除）
        if (!recipe.getCreatedBy().getId().equals(userId)) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("用户不存在"));
            if (!user.getRole().equals(User.Role.ADMIN)) {
                throw new RuntimeException("无权限删除该食谱");
            }
        }

        recipeRepository.delete(recipe);
    }

    @Override
    @Transactional(readOnly = true)
    public BabyFoodRecipe getRecipeById(@NonNull Long recipeId) {
        BabyFoodRecipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("食谱不存在"));

        // 增加浏览次数
        recipe.setViewCount(recipe.getViewCount() + 1);
        recipeRepository.save(recipe);

        return recipe;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BabyFoodRecipe> getRecipesBySuitableAge(String suitableAge) {
        return recipeRepository.findBySuitableAge(suitableAge);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BabyFoodRecipe> getRecipesByDifficulty(BabyFoodRecipe.Difficulty difficulty) {
        return recipeRepository.findByDifficulty(difficulty);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BabyFoodRecipe> getFeaturedRecipes() {
        return recipeRepository.findFeaturedRecipes(true);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BabyFoodRecipe> searchRecipes(String keyword) {
        return recipeRepository.searchRecipes(keyword);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BabyFoodRecipe> getFilteredRecipes(String suitableAge, BabyFoodRecipe.Difficulty difficulty) {
        return recipeRepository.findFilteredRecipes(suitableAge, difficulty);
    }
}