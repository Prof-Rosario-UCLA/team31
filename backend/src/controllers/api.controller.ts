import { Request, Response } from 'express';
import { RecommendService } from '../services/recommend.service';
import { RestaurantService } from '../services/restaurant.service';
import { MenuService } from '../services/menu.service';
import { CacheService } from '../services/cache.service';
import { v4 as uuidv4 } from 'uuid';
import UserSession from '../models/UserSession.model';
import RestaurantModel from '../models/Restaurant.model';

export class ApiController {
  static async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { goal, lat, lng } = req.body;
      if (!goal || !['cutting', 'bulking', 'volume'].includes(goal)) {
        res.status(400).json({ error: 'Goal must be one of: cutting, bulking, volume' });
        return;
      }

      let sessionId = req.cookies.session_id;
      if (!sessionId) {
        sessionId = uuidv4();
        res.cookie('session_id', sessionId, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
          sameSite: 'strict'
        });
      }

      const cacheKey = CacheService.keys.recommendations(sessionId, goal);
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const userLocation = lat && lng ? { lat, lng } : undefined;
      const recommendations = await RecommendService.getRecommendations(goal as 'cutting' | 'bulking', userLocation);

      const formattedResponse = {
        goal,
        restaurants: recommendations.restaurants.map((r, index) => ({
          ...r,
          rank: index + 1,
          medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
        })),
        topFoods: recommendations.topFoods.map((f, index) => ({
          ...f,
          rank: index + 1,
          medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
        })),
        timestamp: recommendations.timestamp,
        userLocation
      };

      await UserSession.findOneAndUpdate(
        { sessionId },
        {
          sessionId,
          dietChoice: goal,
          lastVisit: new Date(),
          savedRecommendations: recommendations,
          userLocation: userLocation ? { ...userLocation, timestamp: new Date() } : undefined
        },
        { upsert: true, new: true }
      );

      await CacheService.set(cacheKey, formattedResponse, 1800);

      res.json(formattedResponse);
    } catch (error) {
      console.error('Get recommendations error:', error);
      res.status(500).json({ error: 'Failed to get recommendations' });
    }
  }

  static async getDiningHalls(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lng } = req.query;
      const cacheKey = `dining-halls:${lat || 'none'}:${lng || 'none'}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const restaurants = await RestaurantService.getAllRestaurants();

      const diningHalls = restaurants.map(r => {
        const restaurant = new RestaurantModel(r);
        let distance = 0;
        if (lat && lng) {
          distance = RestaurantService.calculateDistance(
            parseFloat(lat as string),
            parseFloat(lng as string),
            restaurant.location?.coordinates?.[1] || 0,
            restaurant.location?.coordinates?.[0] || 0
          );
        }
        return {
          id: restaurant.id,
          name: restaurant.name,
          coords: {
            lat: restaurant.location?.coordinates?.[1] || 0,
            lng: restaurant.location?.coordinates?.[0] || 0
          },
          avgPC: 0.5,
          allFoods: [],
          type: restaurant.type,
          description: restaurant.description,
          distance: Number(distance.toFixed(2)),
          isActive: restaurant.isActive,
          currentlyOpen: restaurant.isCurrentlyOpen(),
          currentMealPeriod: restaurant.getCurrentMealPeriod()
        };
      });

      if (lat && lng) {
        diningHalls.sort((a, b) => a.distance - b.distance);
      }

      const response = {
        diningHalls,
        count: diningHalls.length,
        userLocation: lat && lng ? { lat: parseFloat(lat as string), lng: parseFloat(lng as string) } : null
      };

      await CacheService.set(cacheKey, response, 1800);
      res.json(response);
    } catch (error) {
      console.error('Get dining halls error:', error);
      res.status(500).json({ error: 'Failed to get dining halls' });
    }
  }
  static async getTodayMenu(req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Not implemented: getTodayMenu' });
  }
  
  static async calculateNutrition(req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Not implemented: calculateNutrition' });
  }
  
  static async search(req: Request, res: Response): Promise<void> {
    res.status(501).json({ message: 'Not implemented: search' });
  }
  
}
