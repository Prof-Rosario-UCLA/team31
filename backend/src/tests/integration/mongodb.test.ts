import mongoose from 'mongoose';
import { connectDatabase, checkDatabaseHealth, closeDatabaseConnection } from '../../config/database';
import MenuItem from '../../models/MenuItem.model';

describe('MongoDB Atlas Integration Tests', () => {
  beforeAll(async () => {
    await connectDatabase();
  }, 30000);

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  describe('Database Connection', () => {
    test('should connect to MongoDB Atlas successfully', async () => {
      expect(mongoose.connection.readyState).toBe(1);
    });
  });
});