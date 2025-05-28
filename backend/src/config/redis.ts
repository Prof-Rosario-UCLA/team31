import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
});

redisClient.on('error', err => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('🔄 Redis connecting...'));
redisClient.on('ready', () => console.log('✅ Redis connected!'));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    // Test connection
    await redisClient.ping();
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return null;
  }
};

export { redisClient };