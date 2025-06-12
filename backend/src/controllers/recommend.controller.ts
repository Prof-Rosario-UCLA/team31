import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import UserSession from '../models/UserSession.model';
import { RecommendService } from '../services/recommend.service';
import { CacheService } from '../services/cache.service';

export class RecommendController {
  static async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { goal, lat, lng } = req.body;
      
      // Validate goal
      if (!goal || !['cutting', 'bulking'].includes(goal)) {
        res.status(400).json({ error: 'Goal must be either "cutting" or "bulking"' });
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

      // Get recommendations
      const recommendations = await RecommendService.getRecommendations(
        goal as 'cutting' | 'bulking',
        { lat, lng }
      );

      // Save session
      await UserSession.findOneAndUpdate(
        { sessionId },
        {
          sessionId,
          dietChoice: goal,
          lastVisit: new Date(),
          savedRecommendations: recommendations,
          userLocation: lat && lng ? { lat, lng } : undefined
        },
        { upsert: true, new: true }
      );

      // Cache results
      await CacheService.set(cacheKey, recommendations, 3600); // 1 hour

      res.json(recommendations);
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }

  static async getTodaysMenuData(req: Request, res: Response): Promise<void> {
    try {
      // Simple endpoint to get all today's menu data
      const menuData = await RecommendService.getAllTodaysMenuItems();
      res.json(menuData);
    } catch (error) {
      console.error('Get menu data error:', error);
      res.status(500).json({ error: 'Failed to get menu data' });
    }
  }
}