/**
 * @fileoverview Menu API controller implementation
 * @description handles HTTP requests for menu data retrieval, search, and nutrition analysis
 * @since 6/7/2025 (last update)
 * @todo N/A
 */

import { Request, Response } from 'express';
import { MenuService } from '../services/menu.service';
import { DietaryTag } from '../models/MenuItem.model';

/**
 * @class MenuController
 * @description REST API controller for UCLA dining menu operations
 */
export class MenuController {
  
  /**
   * @method (static) Get restaurant's daily menu
   * @description Retrieves today's menu items for a specific restaurant, optionally filtered by meal period
   * @route GET /api/menu/:restaurantId
   * @param req - Express request object with restaurantId param and optional mealPeriod query
   * @param res - Express response object
   * @returns JSON response with menu items, metadata, and count
   */
  static async getRestaurantMenu(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { mealPeriod } = req.query;
      
      // Validate restaurant ID parameter
      if (!restaurantId || typeof restaurantId !== 'string') {
        res.status(400).json({ error: 'Valid restaurant ID is required' });
        return;
      }
      
      const menuItems = await MenuService.getTodaysMenu(
        restaurantId, 
        mealPeriod as string
      );
      
      res.json({
        restaurant: restaurantId,
        date: new Date().toISOString().split('T')[0],
        mealPeriod: mealPeriod || 'all',
        items: menuItems,
        count: menuItems.length
      });
    } catch (error) {
      console.error('Get menu error:', error);
      res.status(500).json({ error: 'Failed to get menu' });
    }
  }

  /**
   * @method (static) Search menu items across restaurants
   * @description Full-text search with dietary and nutritional filters
   * @route GET /api/menu/search
   * @param req - Express request object with query parameters: q, restaurant, dietary, maxCalories
   * @param res - Express response object
   * @returns JSON response with search results and applied filters
   */
  static async searchMenu(req: Request, res: Response): Promise<void> {
    try {
      const { q, restaurant, dietary, maxCalories } = req.query;
      
      // Validate required search query
      if (!q || typeof q !== 'string' || q.trim().length === 0) {
        res.status(400).json({ error: 'Search query required' });
        return;
      }
      
      // Parse and validate filters
      const filters = {
        restaurant: restaurant as string,
        dietaryTags: dietary ? (dietary as string).split(',') as DietaryTag[] : undefined,
        maxCalories: maxCalories ? parseInt(maxCalories as string) : undefined
      };
      
      // Validate maxCalories if provided
      if (filters.maxCalories && (isNaN(filters.maxCalories) || filters.maxCalories < 0)) {
        res.status(400).json({ error: 'maxCalories must be a positive number' });
        return;
      }
      
      const results = await MenuService.searchItems(q as string, filters);
      
      res.json({
        query: q,
        filters,
        results,
        count: results.length
      });
    } catch (error) {
      console.error('Search menu error:', error);
      res.status(500).json({ error: 'Failed to search menu' });
    }
  }

  /**
   * @method (static) Calculate nutritional summary for multiple items
   * @description Aggregates nutrition data for meal planning and dietary tracking
   * @route POST /api/menu/nutrition-summary
   * @param req - Express request object with itemIds array in body
   * @param res - Express response object
   * @returns JSON response with individual items and aggregated nutrition totals
   */
  static async getNutritionSummary(req: Request, res: Response): Promise<void> {
    try {
      const { itemIds } = req.body;
      
      // Validate itemIds array
      if (!Array.isArray(itemIds)) {
        res.status(400).json({ error: 'itemIds must be an array' });
        return;
      }
      
      if (itemIds.length === 0) {
        res.status(400).json({ error: 'At least one item ID is required' });
        return;
      }
      
      // Validate array length to prevent excessive queries
      if (itemIds.length > 50) {
        res.status(400).json({ error: 'Cannot process more than 50 items at once' });
        return;
      }
      
      // Validate that all itemIds are strings
      if (!itemIds.every(id => typeof id === 'string' && id.trim().length > 0)) {
        res.status(400).json({ error: 'All item IDs must be valid strings' });
        return;
      }
      
      const summary = await MenuService.getNutritionSummary(itemIds);
      
      res.json(summary);
    } catch (error) {
      console.error('Nutrition summary error:', error);
      res.status(500).json({ error: 'Failed to get nutrition summary' });
    }
  }

  /**
   * @method (static) Get menu items by dietary preferences
   * @description Filters menu items based on user's dietary restrictions and preferences
   * @route GET /api/menu/dietary/:preferences
   * @param req - Express request obj with dietary preferences stored in params
   * @param res - Express response obj
   * @returns JSON response with filtered menu items
   */
  static async getMenuByDietaryPreferences(req: Request, res: Response): Promise<void> {
    try {
      const { preferences } = req.params;
      const { restaurant, date } = req.query;
      
      if (!preferences) {
        res.status(400).json({ error: 'Dietary preferences are required' });
        return;
      }
      
      const dietaryTags = preferences.split(',') as DietaryTag[];
      const filterDate = date ? new Date(date as string) : new Date();
      
      const menuItems = await MenuService.getItemsByDietaryPreferences(
        dietaryTags,
        restaurant as string,
        filterDate
      );
      
      res.json({
        preferences: dietaryTags,
        restaurant: restaurant || 'all',
        date: filterDate.toISOString().split('T')[0],
        items: menuItems,
        count: menuItems.length
      });
    } catch (error) {
      console.error('Dietary preferences error:', error);
      res.status(500).json({ error: 'Failed to get dietary menu items' });
    }
  }

  /**
   * @method (static) Get nutrition statistics for a restaurant
   * @description Provides nutritional analytics and averages for restaurant menu
   * @route GET /api/menu/:restaurantId/stats
   * @param req - Express request object with restaurantId and optional date range
   * @param res - Express response object
   * @returns JSON response with nutrition statistics and analytics
   */
  static async getRestaurantNutritionStats(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!restaurantId) {
        res.status(400).json({ error: 'Restaurant ID is required' });
        return;
      }
      
      const stats = await MenuService.getRestaurantNutritionStats(
        restaurantId,
        startDate as string,
        endDate as string
      );
      
      res.json({
        restaurant: restaurantId,
        period: {
          start: startDate || 'all-time',
          end: endDate || 'current'
        },
        statistics: stats
      });
    } catch (error) {
      console.error('Restaurant stats error:', error);
      res.status(500).json({ error: 'Failed to get restaurant statistics' });
    }
  }
}