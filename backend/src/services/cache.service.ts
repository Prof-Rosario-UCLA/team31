import { redisClient } from '../config/redis';

export class CacheService {
  // Cache keys with consistent naming
  static keys = {
    menu: (restaurantId: string, date: string) => `menu:${restaurantId}:${date}`,
    nutrition: (itemId: string) => `nutrition:${itemId}`,
    aiInsight: (query: string) => `ai:${Buffer.from(query).toString('base64')}`,
    userSession: (userId: string) => `session:${userId}`
  };

  // TTL in seconds
  static ttl = {
    menu: 3600,        // 1 hour
    nutrition: 86400,  // 24 hours
    aiInsight: 604800, // 7 days
    userSession: 604800 // 7 days
  };

  static async get(key: string): Promise<any> {
    try {
      if (!redisClient.isReady) return null;
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      if (!redisClient.isReady) return;
      await redisClient.setEx(key, ttl || 3600, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      if (!redisClient.isReady) return;
      await redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      if (!redisClient.isReady) return;
      await redisClient.flushAll();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}