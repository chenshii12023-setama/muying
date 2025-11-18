package com.mombaby.controller;

import com.mombaby.common.Result;
import com.mombaby.entity.BabyFoodRecipe;
import com.mombaby.service.BabyFoodRecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 辅食食谱控制器
 */
@RestController
@RequestMapping("/baby-food-recipes")
@RequiredArgsConstructor
public class BabyFoodRecipeController {

    private final BabyFoodRecipeService recipeService;

    /**
     * 创建辅食食谱
     */
    @PostMapping
    public Result<BabyFoodRecipe> createRecipe(@Valid @RequestBody BabyFoodRecipe recipe,
                                               Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            BabyFoodRecipe created = recipeService.createRecipe(userId, recipe);
            return Result.success("食谱创建成功", created);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 更新辅食食谱
     */
    @PutMapping("/{id}")
    public Result<BabyFoodRecipe> updateRecipe(@PathVariable Long id,
                                              @Valid @RequestBody BabyFoodRecipe recipe,
                                              Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            BabyFoodRecipe updated = recipeService.updateRecipe(id, userId, recipe);
            return Result.success("食谱更新成功", updated);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除辅食食谱
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteRecipe(@PathVariable Long id, Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            recipeService.deleteRecipe(id, userId);
            return Result.success("食谱删除成功");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 根据ID获取食谱详情
     */
    @GetMapping("/{id}")
    public Result<BabyFoodRecipe> getRecipeById(@PathVariable Long id) {
        try {
            BabyFoodRecipe recipe = recipeService.getRecipeById(id);
            return Result.success(recipe);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 根据适用月龄获取食谱
     */
    @GetMapping("/by-age/{age}")
    public Result<List<BabyFoodRecipe>> getRecipesByAge(@PathVariable String age) {
        try {
            List<BabyFoodRecipe> recipes = recipeService.getRecipesBySuitableAge(age);
            return Result.success(recipes);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 根据难度获取食谱
     */
    @GetMapping("/by-difficulty/{difficulty}")
    public Result<List<BabyFoodRecipe>> getRecipesByDifficulty(@PathVariable String difficulty) {
        try {
            BabyFoodRecipe.Difficulty difficultyEnum = BabyFoodRecipe.Difficulty.valueOf(difficulty.toUpperCase());
            List<BabyFoodRecipe> recipes = recipeService.getRecipesByDifficulty(difficultyEnum);
            return Result.success(recipes);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取精选食谱
     */
    @GetMapping("/featured")
    public Result<List<BabyFoodRecipe>> getFeaturedRecipes() {
        try {
            List<BabyFoodRecipe> recipes = recipeService.getFeaturedRecipes();
            return Result.success(recipes);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 搜索食谱
     */
    @GetMapping("/search")
    public Result<List<BabyFoodRecipe>> searchRecipes(@RequestParam String keyword) {
        try {
            List<BabyFoodRecipe> recipes = recipeService.searchRecipes(keyword);
            return Result.success(recipes);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取过滤后的食谱
     */
    @GetMapping("/filtered")
    public Result<List<BabyFoodRecipe>> getFilteredRecipes(
            @RequestParam(required = false) String suitableAge,
            @RequestParam(required = false) String difficulty) {
        try {
            BabyFoodRecipe.Difficulty difficultyEnum = null;
            if (difficulty != null && !difficulty.isEmpty()) {
                difficultyEnum = BabyFoodRecipe.Difficulty.valueOf(difficulty.toUpperCase());
            }

            List<BabyFoodRecipe> recipes = recipeService.getFilteredRecipes(suitableAge, difficultyEnum);
            return Result.success(recipes);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId(Authentication authentication) {
        // 这里应该从JWT token中解析用户ID
        // 暂时返回1L，实际项目中需要实现
        return 1L;
    }

}