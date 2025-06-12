/**
 * @fileoverview Restaurant business logic service implementation
 * @description Provides restaurant operations, location queries, and data processing
 * @since 6/12/2025 (created for frontend integration)
 */

import Restaurant, { IRestaurant } from '../models/Restaurant.model';
import { CacheService } from './cache.service';

/**
 * @class RestaurantService
 * @description Business logic layer for restaurant operations
 */
export class RestaurantService {
  
  /**
   * @method (static) Get all restaurants
   * @description Retrieves all active restaurants, optionally filtered by type
   * @param type - Optional restaurant type filter ('residential' | 'boutique')
   * @returns Promise resolving to array of restaurants
   */
  static async getAllRestaurants(type?: string): Promise<IRestaurant[]> {
    const cacheKey = `restaurants:all:${type || 'all'}`;
    
    // Try cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;
    
    const query: any = { isActive: true };
    if (type && ['residential', 'boutique'].includes(type)) {
      query.type = type;
    }
    
    const restaurants = await Restaurant.find(query).sort({ name: 1 });
    
    // Cache for 2 hours (restaurant data changes infrequently)
    await CacheService.set(cacheKey, restaurants, 7200);
    
    return restaurants;
  }

  /**
   * @method (static) Get restaurant by ID
   * @description Retrieves a specific restaurant by its identifier
   * @param id - Restaurant identifier
   * @returns Promise resolving to restaurant or null
   */
  static async getRestaurantById(id: string): Promise<IRestaurant | null> {
    const cacheKey = `restaurant:${id}`;
    
    // Try cache first
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;
    
    const restaurant = await Restaurant.findOne({ 
      $or: [{ id }, { _id: id }], 
      isActive: true 
    });
    
    if (restaurant) {
      // Cache for 1 hour
      await CacheService.set(cacheKey, restaurant, 3600);
    }
    
    return restaurant;
  }

  /**
   * @method (static) Find nearby restaurants
   * @description Finds restaurants within specified distance of coordinates
   * @param longitude - Longitude coordinate
   * @param latitude - Latitude coordinate
   * @param maxDistance - Maximum distance in meters (default: 5000)
   * @returns Promise resolving to nearby restaurants
   */
  static async findNearbyRestaurants(
    longitude: number, 
    latitude: number, 
    maxDistance: number = 5000
  ): Promise<IRestaurant[]> {
    const cacheKey = `restaurants:nearby:${latitude}:${longitude}:${maxDistance}`;
    
    // Try cache first (short cache for location-based queries)
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;
    
    const restaurants = await Restaurant.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      },
      isActive: true
    });
    
    // Cache for 30 minutes
    await CacheService.set(cacheKey, restaurants, 1800);
    
    return restaurants;
  }

  /**
   * @method (static) Calculate distance between coordinates
   * @description Uses Haversine formula to calculate distance
   * @param lat1 - First latitude
   * @param lon1 - First longitude  
   * @param lat2 - Second latitude
   * @param lon2 - Second longitude
   * @returns Distance in miles
   */
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * @method (static) Convert degrees to radians
   * @param deg - Degrees
   * @returns Radians
   */
  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * @method (static) Get restaurants by type
   * @description Retrieves restaurants filtered by type with caching
   * @param type - Restaurant type ('residential' | 'boutique')
   * @param activeOnly - Only return active restaurants (default: true)
   * @returns Promise resolving to filtered restaurants
   */
  static async getRestaurantsByType(
    type: 'residential' | 'boutique',
    activeOnly: boolean = true
  ): Promise<IRestaurant[]> {
    const cacheKey = `restaurants:type:${type}:${activeOnly}`;
    
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;
    
    const query: any = { type };
    if (activeOnly) query.isActive = true;
    
    const restaurants = await Restaurant.find(query).sort({ name: 1 });
    
    // Cache for 2 hours
    await CacheService.set(cacheKey, restaurants, 7200);
    
    return restaurants;
  }

  /**
   * @method (static) Seed initial restaurant data
   * @description Creates default UCLA dining locations if they don't exist
   * @returns Promise resolving to number of restaurants created
   */
  static async seedRestaurantData(): Promise<number> {
    const existingCount = await Restaurant.countDocuments();
    if (existingCount > 0) {
      console.log(`✅ Found ${existingCount} existing restaurants`);
      return 0;
    }

    const defaultRestaurants = [
      {
        id: 'bruin-plate',
        name: 'BPlate',
        type: 'residential' as const,
        description: 'Sustainable dining with fresh, local ingredients',
        location: {
          address: 'UCLA Bruin Plate, Los Angeles, CA 90095',
          coordinates: [-118.4499, 34.0718] as [number, number]
        },
        hours: new Map([
          ['monday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['tuesday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['wednesday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['thursday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['friday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['saturday', { lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['sunday', { lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }]
        ]),
        isActive: true
      },
      {
        id: 'de-neve',
        name: 'De Neve',
        type: 'residential' as const,
        description: 'Classic dining hall with diverse menu options',
        location: {
          address: 'De Neve Plaza, UCLA, Los Angeles, CA 90095',
          coordinates: [-118.4502, 34.0704] as [number, number]
        },
        hours: new Map([
          ['monday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['tuesday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['wednesday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['thursday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['friday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['saturday', { lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['sunday', { lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }]
        ]),
        isActive: true
      },
      {
        id: 'epicuria-covel',
        name: 'Epicuria at Covel',
        type: 'residential' as const,
        description: 'Mediterranean-inspired dining experience',
        location: {
          address: 'Covel Commons, UCLA, Los Angeles, CA 90095',
          coordinates: [-118.4442, 34.0704] as [number, number]
        },
        hours: new Map([
          ['monday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['tuesday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['wednesday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['thursday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['friday', { breakfast: { start: '07:00', end: '10:00' }, lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['saturday', { lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }],
          ['sunday', { lunch: { start: '11:00', end: '15:00' }, dinner: { start: '17:00', end: '21:00' } }]
        ]),
        isActive: true
      },
      {
        id: 'bruin-cafe',
        name: 'Bruin Café',
        type: 'boutique' as const,
        description: 'Quick grab-and-go options and coffee',
        location: {
          address: 'Sproul Hall, UCLA, Los Angeles, CA 90095',
          coordinates: [-118.4503, 34.0726] as [number, number]
        },
        hours: new Map([
          ['monday', { allDay: { start: '07:00', end: '19:00' } }],
          ['tuesday', { allDay: { start: '07:00', end: '19:00' } }],
          ['wednesday', { allDay: { start: '07:00', end: '19:00' } }],
          ['thursday', { allDay: { start: '07:00', end: '19:00' } }],
          ['friday', { allDay: { start: '07:00', end: '19:00' } }],
          ['saturday', { allDay: { start: '09:00', end: '17:00' } }],
          ['sunday', { allDay: { start: '09:00', end: '17:00' } }]
        ]),
        isActive: true
      },
      {
        id: 'the-study',
        name: 'The Study',
        type: 'boutique' as const,
        description: 'Late-night study spot with snacks and beverages',
        location: {
          address: 'Powell Library, UCLA, Los Angeles, CA 90095',
          coordinates: [-118.4522, 34.0732] as [number, number]
        },
        hours: new Map([
          ['monday', { allDay: { start: '12:00', end: '02:00' } }],
          ['tuesday', { allDay: { start: '12:00', end: '02:00' } }],
          ['wednesday', { allDay: { start: '12:00', end: '02:00' } }],
          ['thursday', { allDay: { start: '12:00', end: '02:00' } }],
          ['friday', { allDay: { start: '12:00', end: '02:00' } }],
          ['saturday', { allDay: { start: '14:00', end: '24:00' } }],
          ['sunday', { allDay: { start: '14:00', end: '24:00' } }]
        ]),
        isActive: true
      }
    ];

    let createdCount = 0;
    for (const restaurantData of defaultRestaurants) {
      try {
        await Restaurant.create(restaurantData);
        createdCount++;
        console.log(`✅ Created restaurant: ${restaurantData.name}`);
      } catch (error) {
        console.error(`❌ Failed to create restaurant ${restaurantData.name}:`, error);
      }
    }

    console.log(`🎯 Seeded ${createdCount} restaurants`);
    return createdCount;
  }
}