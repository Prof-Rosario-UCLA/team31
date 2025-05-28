import { connectRedis, redisClient } from '../../config/redis';
import { CacheService } from '../../services/cache.service';

// ########## REAL REDIS CLOUD TESTS ################
describe('Redis Cloud Integration Tests', () => {
  beforeAll(async () => {
    // Use real Redis Cloud connection
    await connectRedis();
  });

  afterAll(async () => {
    // Clean up test keys
    if (redisClient.isReady) {
      const keys = await redisClient.keys('test-*');
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      await redisClient.quit();
    }
  });

  describe('Redis Connection', () => {
    test('should connect to Redis Cloud successfully', async () => {
      const pong = await redisClient.ping();
      expect(pong).toBe('PONG');
      console.log('✅ Connected to Redis Cloud');
    });

    test('should check Redis connection status', async () => {
      expect(redisClient.isOpen).toBe(true);
      expect(redisClient.isReady).toBe(true);
    });
  });

  describe('Basic Redis Operations', () => {
    test('should set and get string values', async () => {
      const timestamp = Date.now();
      const key = `test-string-${timestamp}`;
      const value = 'NutriBruin Test Value';

      await redisClient.set(key, value);
      const retrieved = await redisClient.get(key);
      
      expect(retrieved).toBe(value);

      // Clean up
      await redisClient.del(key);
    });

    test('should set values with TTL', async () => {
      const timestamp = Date.now();
      const key = `test-ttl-${timestamp}`;
      const value = 'Expires in 5 seconds';

      await redisClient.setEx(key, 5, value);
      const retrieved = await redisClient.get(key);
      expect(retrieved).toBe(value);

      // Check TTL
      const ttl = await redisClient.ttl(key);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(5);
    });

    test('should handle JSON data', async () => {
      const timestamp = Date.now();
      const key = `test-json-${timestamp}`;
      const data = {
        restaurant: 'De Neve',
        menu: ['Pizza', 'Salad', 'Pasta'],
        nutrition: { calories: 650, protein: 25 }
      };

      await redisClient.set(key, JSON.stringify(data));
      const retrieved = await redisClient.get(key);
      const parsed = JSON.parse(retrieved!);

      expect(parsed).toEqual(data);
      expect(parsed.restaurant).toBe('De Neve');
      expect(parsed.nutrition.calories).toBe(650);

      // Clean up
      await redisClient.del(key);
    });
  });

  describe('CacheService Integration', () => {
    test('should cache menu data using CacheService', async () => {
      const restaurantId = 'deneve';
      const date = '2025-05-28';
      const menuData = {
        breakfast: ['Pancakes', 'Eggs', 'Bacon'],
        lunch: ['Burger', 'Fries', 'Salad'],
        dinner: ['Steak', 'Vegetables', 'Rice']
      };

      const cacheKey = CacheService.keys.menu(restaurantId, date);
      
      // Set cache
      await CacheService.set(cacheKey, menuData, CacheService.ttl.menu);
      
      // Retrieve from cache
      const cached = await CacheService.get(cacheKey);
      
      expect(cached).toEqual(menuData);
      expect(cached.breakfast).toContain('Pancakes');

      // Clean up
      await CacheService.delete(cacheKey);
    });

    test('should cache nutrition data', async () => {
      const itemId = 'pizza-margherita';
      const nutritionData = {
        itemName: 'Pizza Margherita',
        calories: 285,
        macros: { protein: 12, carbs: 35, fat: 10 },
        allergens: ['gluten', 'dairy']
      };

      const cacheKey = CacheService.keys.nutrition(itemId);
      
      await CacheService.set(cacheKey, nutritionData, CacheService.ttl.nutrition);
      const cached = await CacheService.get(cacheKey);
      
      expect(cached).toEqual(nutritionData);
      expect(cached.calories).toBe(285);
      expect(cached.allergens).toContain('gluten');

      // Clean up
      await CacheService.delete(cacheKey);
    });

    test('should return null for non-existent keys', async () => {
      const result = await CacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    test('should handle cache misses gracefully', async () => {
      const timestamp = Date.now();
      const key = `test-miss-${timestamp}`;
      
      // Try to get non-existent key
      const result = await CacheService.get(key);
      expect(result).toBeNull();
      
      // Should not throw error
      await expect(CacheService.delete(key)).resolves.not.toThrow();
    });
  });
});