import mongoose from 'mongoose';
import { connectDatabase, checkDatabaseHealth, closeDatabaseConnection } from '../../config/database';
import User from '../../models/User.model';
import Restaurant from '../../models/Restaurant.model';

// ########## REAL MONGODB ATLAS TESTS ################
describe('MongoDB Atlas Integration Tests', () => {
  beforeAll(async () => {
    // Use real MongoDB Atlas connection
    await connectDatabase();
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ email: { $regex: /test-/ } });
    await Restaurant.deleteMany({ name: { $regex: /Test-/ } });
    await closeDatabaseConnection();
  });

  describe('Database Connection', () => {
    test('should connect to MongoDB Atlas successfully', async () => {
      expect(mongoose.connection.readyState).toBe(1);
      console.log('✅ Connected to MongoDB Atlas');
    });

    test('should check database health correctly', async () => {
      const isHealthy = await checkDatabaseHealth();
      expect(isHealthy).toBe(true);
    });
  });

  describe('User Model Tests', () => {
    test('should create a new user in Atlas', async () => {
      const timestamp = Date.now();
      const userData = {
        email: `test-${timestamp}@ucla.edu`,
        password: 'password123',
        name: 'Test User',
        dietaryRestrictions: ['vegetarian'],
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(`test-${timestamp}@ucla.edu`);
      expect(savedUser.password).not.toBe('password123');

      // Clean up
      await User.deleteOne({ _id: savedUser._id });
    });

    test('should validate required fields', async () => {
      const user = new User({});
      
      try {
        await user.save();
        fail('Should have thrown validation error');
      } catch (e) {
        const error = e as mongoose.Error.ValidationError;
        expect(error.errors.email).toBeDefined();
        expect(error.errors.password).toBeDefined();
        expect(error.errors.name).toBeDefined();
      }
    });
  });

  describe('Restaurant Model Tests', () => {
    test('should create a restaurant in Atlas', async () => {
      const timestamp = Date.now();
      const restaurantData = {
        name: `Test-Restaurant-${timestamp}`,
        location: {
          type: 'Point' as const,
          coordinates: [-118.450089, 34.070266] as [number, number],
          address: 'Test Address',
        },
        mealPeriods: ['breakfast', 'lunch'],
      };

      const restaurant = new Restaurant(restaurantData);
      const savedRestaurant = await restaurant.save();

      expect(savedRestaurant._id).toBeDefined();
      expect(savedRestaurant.name).toBe(`Test-Restaurant-${timestamp}`);

      // Clean up
      await Restaurant.deleteOne({ _id: savedRestaurant._id });
    });
  });
});