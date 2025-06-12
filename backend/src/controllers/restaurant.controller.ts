import { Request, Response } from 'express';
import { RestaurantService } from '../services/restaurant.service';
import { MenuService } from '../services/menu.service';
import { CacheService } from '../services/cache.service';
import RestaurantModel from '../models/Restaurant.model';

export class RestaurantController {
  static async getAllRestaurants(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query;
      const cacheKey = `restaurants:all:${type || 'all'}`;
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        res.json(cached);
        return;
      }

      const restaurants = await RestaurantService.getAllRestaurants(type as string);

      const formattedRestaurants = restaurants.map(r => {
        const restaurant = new RestaurantModel(r);
        return {
          id: restaurant.id,
          name: restaurant.name,
          type: restaurant.type,
          description: restaurant.description,
          location: restaurant.location,
          isActive: restaurant.isActive,
          coords: {
            lat: restaurant.location?.coordinates?.[1] || 0,
            lng: restaurant.location?.coordinates?.[0] || 0
          },
          avgPC: 0.5,
          allFoods: []
        };
      });

      const response = {
        restaurants: formattedRestaurants,
        count: formattedRestaurants.length,
        timestamp: new Date().toISOString()
      };

      await CacheService.set(cacheKey, response, 3600);
      res.json(response);
    } catch (error) {
      console.error('Get all restaurants error:', error);
      res.status(500).json({ error: 'Failed to get restaurants' });
    }
  }

  static async getRestaurantById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Restaurant ID is required' });
        return;
      }

      const result = await RestaurantService.getRestaurantById(id);
      if (!result) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      const restaurant = new RestaurantModel(result);

      const formattedRestaurant = {
        id: restaurant.id,
        name: restaurant.name,
        type: restaurant.type,
        description: restaurant.description,
        location: restaurant.location,
        hours: restaurant.hours,
        isActive: restaurant.isActive,
        coords: {
          lat: restaurant.location?.coordinates?.[1] || 0,
          lng: restaurant.location?.coordinates?.[0] || 0
        },
        currentlyOpen: restaurant.isCurrentlyOpen(),
        currentMealPeriod: restaurant.getCurrentMealPeriod()
      };

      res.json(formattedRestaurant);
    } catch (error) {
      console.error('Get restaurant by ID error:', error);
      res.status(500).json({ error: 'Failed to get restaurant' });
    }
  }

  static async getNearbyRestaurants(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lng } = req.params;
      const { maxDistance } = req.query;
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        res.status(400).json({ error: 'Valid latitude and longitude are required' });
        return;
      }

      const maxDist = maxDistance ? parseInt(maxDistance as string) : 5000;
      const restaurants = await RestaurantService.findNearbyRestaurants(longitude, latitude, maxDist);

      const restaurantsWithDistance = restaurants.map(r => {
        const restaurant = new RestaurantModel(r);
        const distance = RestaurantService.calculateDistance(
          latitude, longitude,
          restaurant.location?.coordinates?.[1] || 0,
          restaurant.location?.coordinates?.[0] || 0
        );
        return {
          id: restaurant.id,
          name: restaurant.name,
          type: restaurant.type,
          location: restaurant.location,
          distance: Number(distance.toFixed(2)),
          coords: {
            lat: restaurant.location?.coordinates?.[1] || 0,
            lng: restaurant.location?.coordinates?.[0] || 0
          },
          isActive: restaurant.isActive,
          currentlyOpen: restaurant.isCurrentlyOpen()
        };
      });

      restaurantsWithDistance.sort((a, b) => a.distance - b.distance);
      res.json({
        restaurants: restaurantsWithDistance,
        userLocation: { lat: latitude, lng: longitude },
        count: restaurantsWithDistance.length
      });
    } catch (error) {
      console.error('Get nearby restaurants error:', error);
      res.status(500).json({ error: 'Failed to find nearby restaurants' });
    }
  }

  static async getTodaysMenu(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { mealPeriod } = req.query;
      if (!id) {
        res.status(400).json({ error: 'Restaurant ID is required' });
        return;
      }

      const menuItems = await MenuService.getTodaysMenu(id, mealPeriod as string);
      res.json({
        restaurant: id,
        date: new Date().toISOString().split('T')[0],
        mealPeriod: mealPeriod || 'all',
        items: menuItems,
        count: menuItems.length
      });
    } catch (error) {
      console.error('Get restaurant menu error:', error);
      res.status(500).json({ error: 'Failed to get restaurant menu' });
    }
  }

  static async getRestaurantHours(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ error: 'Restaurant ID is required' });
        return;
      }

      const result = await RestaurantService.getRestaurantById(id);
      if (!result) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      const restaurant = new RestaurantModel(result);
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      res.json({
        restaurant: {
          id: restaurant.id,
          name: restaurant.name
        },
        hours: restaurant.hours,
        todaysHours: (restaurant.hours as any)?.get?.(currentDay) || null,
        currentlyOpen: restaurant.isCurrentlyOpen(),
        currentMealPeriod: restaurant.getCurrentMealPeriod(),
        currentTime: now.toISOString()
      });
    } catch (error) {
      console.error('Get restaurant hours error:', error);
      res.status(500).json({ error: 'Failed to get restaurant hours' });
    }
  }
}
