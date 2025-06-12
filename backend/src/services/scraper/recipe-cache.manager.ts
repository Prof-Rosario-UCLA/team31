// src/services/scraper/recipe-cache.manager.ts
import RecipeMaster, { IRecipeMaster } from '../../models/RecipeMaster.model';
import { NutritionParser } from './parsers/nutrition.parser';
import { DataTransformer } from './data.transformer';
import { CacheService } from '../cache.service';
import { Page } from 'puppeteer';

export class RecipeCacheManager {
  private static recipeCache = new Map<string, IRecipeMaster>();
  
  static async getRecipe(recipeId: string): Promise<IRecipeMaster | null> {
    // Check in-memory cache first
    if (this.recipeCache.has(recipeId)) {
      return this.recipeCache.get(recipeId)!;
    }
    
    // Check Redis cache - using existing cache service pattern
    const cacheKey = `recipe:${recipeId}`;
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      this.recipeCache.set(recipeId, cached);
      return cached;
    }
    
    // Check database
    const recipe = await RecipeMaster.findOne({ recipeId });
    if (recipe) {
      this.recipeCache.set(recipeId, recipe);
      await CacheService.set(cacheKey, recipe.toObject(), 86400); // 24 hours
      return recipe;
    }
    
    return null;
  }
  
  static async fetchAndCacheRecipe(recipeId: string, page: Page): Promise<IRecipeMaster | null> {
    // Check if already exists
    const existingRecipe = await this.getRecipe(recipeId);
    if (existingRecipe) {
      console.log(`✅ Recipe ${recipeId} already cached`);
      return existingRecipe;
    }
    
    // Fetch from website
    console.log(`🔄 Fetching new recipe ${recipeId}`);
    const nutrition = await NutritionParser.parseNutritionPage(page, recipeId);
    
    if (!nutrition) {
      console.log(`❌ Failed to fetch nutrition for recipe ${recipeId}`);
      return null;
    }
    
    // Transform and save
    const recipeData = DataTransformer.transformToRecipeMaster(recipeId, nutrition);
    
    try {
      const recipe = await RecipeMaster.create(recipeData);
      
      // Cache in all layers
      this.recipeCache.set(recipeId, recipe);
      await CacheService.set(`recipe:${recipeId}`, recipe.toObject(), 86400);
      
      console.log(`💾 Saved recipe ${recipeId}: ${recipe.name}`);
      return recipe;
    } catch (error) {
      console.error(`❌ Failed to save recipe ${recipeId}:`, error);
      return null;
    }
  }
  
  static clearMemoryCache(): void {
    this.recipeCache.clear();
    console.log('🗑️ Cleared recipe memory cache');
  }
  
  static async getRecipeCount(): Promise<number> {
    return RecipeMaster.countDocuments();
  }
}