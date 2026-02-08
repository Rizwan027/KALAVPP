import { createClient } from 'redis';
import logger from '../utils/logger';

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    // Don't exit - Redis is optional for basic functionality
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    logger.info('Redis disconnected');
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
  }
};

export default redisClient;
