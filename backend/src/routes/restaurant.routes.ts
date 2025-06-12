/**
 * @fileoverview Restaurant API route definitions
 * @description Handles restaurant listing, details, and location-based queries
 * @since 6/12/2025 (created for frontend integration)
 */

import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller';

const router = Router();

/**
 * @route GET /api/restaurants
 * @description Get all active restaurants with basic info
 * @access Public
 * @returns JSON with array of restaurants
 */
router.get('/', RestaurantController.getAllRestaurants);

/**
 * @route GET /api/restaurants/:id
 * @description Get detailed restaurant information
 * @access Public
 * @param id {string} - Restaurant identifier
 * @returns JSON with restaurant details
 */
router.get('/:id', RestaurantController.getRestaurantById);

/**
 * @route GET /api/restaurants/nearby/:lat/:lng
 * @description Find restaurants near coordinates
 * @access Public
 * @param lat {number} - Latitude
 * @param lng {number} - Longitude
 * @returns JSON with nearby restaurants sorted by distance
 */
router.get('/nearby/:lat/:lng', RestaurantController.getNearbyRestaurants);

/**
 * @route GET /api/restaurants/:id/menu/today
 * @description Get today's menu for a specific restaurant
 * @access Public
 * @param id {string} - Restaurant identifier
 * @returns JSON with today's menu items
 */
router.get('/:id/menu/today', RestaurantController.getTodaysMenu);

/**
 * @route GET /api/restaurants/:id/hours
 * @description Get restaurant operating hours
 * @access Public
 * @param id {string} - Restaurant identifier
 * @returns JSON with restaurant hours and current status
 */
router.get('/:id/hours', RestaurantController.getRestaurantHours);

export default router;