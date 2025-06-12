/**
 * @fileoverview Menu business logic service implementation
 * @description provides core menu operations including retrieval, search, caching, and nutrition calculations for UCLA dining data
 * @since 6/7/2025 (last update)
 * @todo N/A
 */

import MenuItem, { IMenuItem, DietaryTag } from '../models/MenuItem.model';
import Restaurant from '../models/Restaurant.model';
import { CacheService } from './cache.service';

/**
 * @class MenuService
 * @description Business logic layer for menu operations with intelligent caching and data aggregation
 */
export class MenuService {
  /**
   * @method (static) Get today's menu for a specific restaurant
   * @description Retrieves current day's menu items with Redis caching for performance
   * @param restaurantId - UCLA restaurant identifier (e.g., 'bruin-plate', 'de-neve')
   * @param mealPeriod - Optional meal period filter ('breakfast', 'lunch', 'dinner', 'all-day')
   * @returns Promise resolving to array of menu items sorted by category and name
   */
  static async getTodaysMenu(restaurantId: string, mealPeriod?: string): Promise<IMenuItem[]> {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = CacheService.keys.menu(restaurantId, today);
    
    // Try Redis cache first for performance
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;
    
    // Build MongoDB query for today's date range
    const query: any = {
      restaurant: restaurantId,
      date: { 
        $gte: new Date(today), 
        $lt: new Date(today + 'T23:59:59.999Z') 
      }
    };
    
    // Add meal period filter if specified
    if (mealPeriod && mealPeriod !== 'all') {
      query.mealPeriod = mealPeriod;
    }
    
    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });
    
    // Cache results for 1 hour (menu updates are infrequent)
    await CacheService.set(cacheKey, menuItems, CacheService.ttl.menu);
    
    return menuItems;
  }

  /**
   * @method (static) Search menu items with advanced filtering
   * @description Full-text search across menu items with dietary and nutritional filters
   * @param searchTerm - Text to search in item names and categories
   * @param filters - Optional filters object
    ** @param filters.restaurant - Specific restaurant to search within
    ** @param filters.dietaryTags - Array of dietary restriction tags to match
    ** @param filters.maxCalories - Maximum calorie threshold for results
   * @returns Promise resolving to relevance-sorted array of menu items (max 20 results)
   */
  static async searchItems(searchTerm: string, filters?: {
    restaurant?: string;
    dietaryTags?: DietaryTag[];
    maxCalories?: number;
  }): Promise<IMenuItem[]> {
    // Build MongoDB text search query
    const query: any = {
      $text: { $search: searchTerm }
    };
    // Apply restaurant filter if specified
    if (filters?.restaurant) {
      query.restaurant = filters.restaurant;
    }
    
    // Apply dietary tag filters (must contain at least one of the specified tags)
    if (filters?.dietaryTags && filters.dietaryTags.length > 0) {
      query.dietaryTags = { $in: filters.dietaryTags };
    }
    
    // Apply calorie threshold filter
    if (filters?.maxCalories && filters.maxCalories > 0) {
      query['nutrition.calories'] = { $lte: filters.maxCalories };
    }
    
    // Execute search with relevance scoring and limit results
    return MenuItem.find(query)
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);
  }
  /**
   * @method (static) Calculate nutrition summary for multiple items
   * @description Aggregates nutritional data for meal planning and dietary tracking
   * @param itemIds - Array of MongoDB ObjectIds for menu items
   * @returns Promise resolving to object with individual items and summed totals
   */
  static async getNutritionSummary(itemIds: string[]): Promise<{
    items: IMenuItem[];
    summary: {
      totalCalories: number;
      totalProtein: number;
      totalCarbs: number;
      totalFat: number;
      totalSodium: number;
    };
    analytics: {
      averageCaloriesPerItem: number;
      proteinPercentage: number;
      carbPercentage: number;
      fatPercentage: number;
    };
  }> {
    // Fetch all requested menu items
    const items = await MenuItem.find({ _id: { $in: itemIds } });
    
    // Calculate aggregated nutrition totals
    const summary = items.reduce((acc, item) => ({
      totalCalories: acc.totalCalories + item.nutrition.calories,
      totalProtein: acc.totalProtein + item.nutrition.protein,
      totalCarbs: acc.totalCarbs + item.nutrition.totalCarbs,
      totalFat: acc.totalFat + item.nutrition.totalFat,
      totalSodium: acc.totalSodium + item.nutrition.sodium
    }), { 
      totalCalories: 0, 
      totalProtein: 0, 
      totalCarbs: 0, 
      totalFat: 0, 
      totalSodium: 0 
    });
    
    // Calculate nutritional analytics
    const analytics = {
      averageCaloriesPerItem: items.length > 0 ? summary.totalCalories / items.length : 0,
      proteinPercentage: summary.totalCalories > 0 ? (summary.totalProtein * 4 / summary.totalCalories) * 100 : 0,
      carbPercentage: summary.totalCalories > 0 ? (summary.totalCarbs * 4 / summary.totalCalories) * 100 : 0,
      fatPercentage: summary.totalCalories > 0 ? (summary.totalFat * 9 / summary.totalCalories) * 100 : 0
    };
    
    return { items, summary, analytics };
  }

  /**
   * @method (static) Get menu items by dietary preferences
   * @description Filters menu items based on user's dietary restrictions and preferences
   * @param preferences - Array of dietary tags to filter by
   * @param restaurantId - Optional restaurant filter
   * @param date - Optional date filter (defaults to today)
   * @returns Promise resolving to filtered menu items
   */
  static async getItemsByDietaryPreferences(
    preferences: DietaryTag[], 
    restaurantId?: string,
    date?: Date
  ): Promise<IMenuItem[]> {
    const filterDate = date || new Date();
    const dateString = filterDate.toISOString().split('T')[0];
    
    const query: any = {
      dietaryTags: { $in: preferences },
      date: {
        $gte: new Date(dateString),
        $lt: new Date(dateString + 'T23:59:59.999Z')
      }
    };
    
    if (restaurantId) {
      query.restaurant = restaurantId;
    }
    
    return MenuItem.find(query).sort({ restaurant: 1, category: 1, name: 1 });
  }

  /**
   * @method (static) Get nutrition statistics for a restaurant
   * @description Provides nutritional analytics and averages for restaurant menu over time
   * @param restaurantId - Restaurant identifier
   * @param startDate <Optional> - start date for analysis period
   * @param endDate <Optional> - end date for analysis period
   * @returns Promise resolving to nutrition statistics object
   */
  static async getRestaurantNutritionStats(
    restaurantId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const query: any = { restaurant: restaurantId };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
    
    // Aggregate nutrition statistics
    const stats = await MenuItem.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$restaurant',
          totalItems: { $sum: 1 },
          avgCalories: { $avg: '$nutrition.calories' },
          avgProtein: { $avg: '$nutrition.protein' },
          avgCarbs: { $avg: '$nutrition.totalCarbs' },
          avgFat: { $avg: '$nutrition.totalFat' },
          avgSodium: { $avg: '$nutrition.sodium' },
          minCalories: { $min: '$nutrition.calories' },
          maxCalories: { $max: '$nutrition.calories' },
          categoryCounts: { $addToSet: '$category' }
        }
      }
    ]);
    
    return stats[0] || null;
  }

  /**
   * @method (static) Save scraped menu items to database
   * @description Bulk upsert operation for importing UCLA dining data from web scraping
   * @param items - Array of partial menu item objects from scraping
   * @returns Promise resolving to number of items saved/updated
   */
  static async saveMenuItems(items: Partial<IMenuItem>[]): Promise<number> {
    // Build bulk write operations for efficient database updates
    const operations = items.map(item => ({
      updateOne: {
        filter: { 
          name: item.name, 
          restaurant: item.restaurant, 
          date: item.date 
        },
        update: { $set: item },
        upsert: true // Create if doesn't exist, update if it does
      }
    }));
    
    // Execute bulk write operation
    const result = await MenuItem.bulkWrite(operations);
    
    // Return total number of items processed
    return result.upsertedCount + result.modifiedCount;
  }

  /**
   * @method (static) Clear old menu data
   * @description Removes menu items older than specified days to maintain database size
   * @param daysToKeep - Number of days of menu history to retain (default: 30)
   * @returns Promise resolving to number of items deleted
   */
  static async clearOldMenuData(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await MenuItem.deleteMany({
      date: { $lt: cutoffDate }
    });
    
    return result.deletedCount;
  }

  /**
   * @method (static) Get menu items trending by popularity
   * @description Identifies frequently appeared menu items across restaurants
   * @param days - Number of days to analyze (default: 7)
   * @returns Promise resolving to trending menu items with frequency data
   */
  static async getTrendingItems(days: number = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return MenuItem.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$name',
          frequency: { $sum: 1 },
          restaurants: { $addToSet: '$restaurant' },
          avgCalories: { $avg: '$nutrition.calories' },
          categories: { $addToSet: '$category' }
        }
      },
      {
        $match: {
          frequency: { $gte: 2 } // Must appear at least twice
        }
      },
      {
        $sort: { frequency: -1 }
      },
      {
        $limit: 20
      }
    ]);
  }
}