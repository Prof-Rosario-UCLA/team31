/**
 * @fileoverview Unified API routes for frontend integration
 * @description Provides endpoints that match frontend expectations
 * @since 6/12/2025 (created for frontend integration)
 */

import { Router } from 'express';
import { ApiController } from '../controllers/api.controller';

const router = Router();

/**
 * @route POST /api/recommendations
 * @description Get personalized recommendations based on user goals
 * @access Public
 * @body { goal: string, lat?: number, lng?: number }
 * @returns JSON with restaurant and food recommendations
 */
router.post('/recommendations', ApiController.getRecommendations);

/**
 * @route GET /api/today-menu
 * @description Get today's menu data across all restaurants
 * @access Public
 * @returns JSON with today's menu items
 */
router.get('/today-menu', ApiController.getTodayMenu);

/**
 * @route GET /api/dining-halls
 * @description Get all dining halls with location and status info
 * @access Public
 * @returns JSON with dining halls array formatted for frontend
 */
router.get('/dining-halls', ApiController.getDiningHalls);

/**
 * @route POST /api/calculate-nutrition
 * @description Calculate nutrition metrics using WebAssembly
 * @access Public
 * @body { items: Array<{calories: number, protein: number}> }
 * @returns JSON with calculated nutrition ratios
 */
router.post('/calculate-nutrition', ApiController.calculateNutrition);

/**
 * @route GET /api/search
 * @description Search across menu items and restaurants
 * @access Public
 * @query { q: string, type?: string, restaurant?: string }
 * @returns JSON with search results
 */
router.get('/search', ApiController.search);

export default router;