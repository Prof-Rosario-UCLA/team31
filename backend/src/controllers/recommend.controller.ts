import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import UserSession from '../models/UserSession.model';
import { RecommendService } from '../services/recommend.service';
import { CacheService } from '../services/cache.service';

export class RecommendController {
  static async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { goal, lat, lng } = req.body;
      
      // Validate goal - ########## UPDATED FOR FRONTEND COMPATIBILITY ################
      if (!goal || !['cutting', 'bulking', 'volume'].includes(goal)) {
        res.status(400).json({ error: 'Goal must be either "cutting", "bulking", or "volume"' });
        return;
      }
      
      // Get or create session
      let sessionId = req.cookies.session_id;
      if (!sessionId) {
        sessionId = uuidv4();
        res.cookie('session_id', sessionId, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          sameSite: 'strict'
        });
      }

      // Check cache first
      const cacheKey = CacheService.keys.recommendations(sessionId, goal);
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      // ########## HANDLE VOLUME GOAL (map to cutting for now) ################
      const mappedGoal = goal === 'volume' ? 'cutting' : goal;

      // Get recommendations
      const recommendations = await RecommendService.getRecommendations(
        mappedGoal as 'cutting' | 'bulking',
        { lat, lng }
      );

      // ########## FORMAT RESPONSE FOR FRONTEND COMPATIBILITY ################
      const formattedResponse = {
        goal,
        restaurants: recommendations.restaurants.map((restaurant, index) => ({
          ...restaurant,
          medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
        })),
        topFoods: recommendations.topFoods.map((food, index) => ({
          ...food,
          medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
        })),
        timestamp: recommendations.timestamp,
        userLocation: lat && lng ? { lat, lng } : null
      };

      // Save session
      await UserSession.findOneAndUpdate(
        { sessionId },
        {
          sessionId,
          dietChoice: goal,
          lastVisit: new Date(),
          savedRecommendations: recommendations,
          userLocation: lat && lng ? { lat, lng, timestamp: new Date() } : undefined
        },
        { upsert: true, new: true }
      );

      // Cache results
      await CacheService.set(cacheKey, formattedResponse, 3600); // 1 hour

      res.json(formattedResponse);
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }

  static async getTodaysMenuData(req: Request, res: Response): Promise<void> {
    try {
      // ########## ENHANCED WITH RESTAURANT FILTER ################
      const { restaurant } = req.query;
      
      // Check cache first
      const cacheKey = `todays-menu:${restaurant || 'all'}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      let menuData;
      if (restaurant) {
        menuData = await RecommendService.getAllTodaysMenuItems();
        // Filter by restaurant if specified
        menuData = menuData.filter(item => item.restaurant === restaurant);
      } else {
        menuData = await RecommendService.getAllTodaysMenuItems();
      }

      const response = {
        date: new Date().toISOString().split('T')[0],
        restaurant: restaurant || 'all',
        items: menuData,
        count: menuData.length
      };

      // Cache for 1 hour
      await CacheService.set(cacheKey, response, 3600);

      res.json(response);
    } catch (error) {
      console.error('Get menu data error:', error);
      res.status(500).json({ error: 'Failed to get menu data' });
    }
  }
}