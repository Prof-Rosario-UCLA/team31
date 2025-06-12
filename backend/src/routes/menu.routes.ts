/**
 * @fileoverview Menu API route definitions
 * @description Defines HTTP endpoints for menu operations, maps URLs to controller methods with appropriate middleware
 * @since 6/7/2025 (last update)
 * @todo N/A
 */

import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { optionalAuth } from '../middleware/auth.middleware';

/**
 * @var router Express router instance for menu endpoints
 * @description Handles all /api/menu/* routes with proper middleware chain
 */
const router = Router();

/** ==================== @public routes (no auth) ==================== */

/**
 * @route GET /api/menu/search
 * @description Search menu items across all restaurants with filters
 * @access Public
 * @param query {string} - Search term (required)
 * @param restaurant {string} - Filter by specific restaurant (optional)
 * @param dietary {string} - dietary tags (optional)
 * @param maxCalories {number} - Max calorie filter (optional)
 * @returns JSON with search results and metadata
 */
router.get('/search', MenuController.searchMenu);

/**
 * @route GET /api/menu/:restaurantId
 * @description Get today's menu for a specific restaurant
 * @access Public
 * @param restaurantId {string} - Restaurant identifier (bruin-plate, de-neve, etc.)
 * @param mealPeriod {string} - Optional meal period filter (breakfast, lunch, dinner, all-day)
 * @returns JSON with menu items for specified restaurant
 */
router.get('/:restaurantId', MenuController.getRestaurantMenu);

/**
 * @route GET /api/menu/dietary/:preferences
 * @description Get menu items filtered by dietary preferences
 * @access Public
 * @param preferences {string} - Comma-separated dietary tags
 * @param restaurant {string} - Optional restaurant filter
 * @param date {string} - Optional date filter (YYYY-MM-DD)
 * @returns JSON with filtered menu items
 */
router.get('/dietary/:preferences', MenuController.getMenuByDietaryPreferences);

/**
 * @route GET /api/menu/:restaurantId/stats
 * @description Get nutritional statistics for a restaurant
 * @access Public
 * @param restaurantId {string} - Restaurant identifier
 * @param startDate {string} - Optional start date for stats period
 * @param endDate {string} - Optional end date for stats period
 * @returns JSON with nutrition analytics and averages
 */
router.get('/:restaurantId/stats', MenuController.getRestaurantNutritionStats);

/** ================ @protected routes (auth is optional) ================ */
/**
 * @route POST /api/menu/nutrition-summary
 * @description Calculate aggregated nutrition for multiple menu items
 * @access Public (enhanced with user context if authenticated)
 * @middleware optionalAuth - Provides user context for personalized recommendations
 * @body itemIds {string[]} - Array of menu item IDs to summarize
 * @returns JSON with individual items and total nutrition breakdown
 */
router.post('/nutrition-summary', optionalAuth, MenuController.getNutritionSummary);

export default router;