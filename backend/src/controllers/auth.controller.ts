import { Request, Response } from 'express';
import User from '../models/User.model';
import { generateToken, setTokenCookie, clearTokenCookie } from '../config/jwt';
import { CacheService } from '../services/cache.service';


// @AuthController: Handles user registration and JWT token generation for users
export class AuthController {
  // User registration
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      // Create new user (password will be hashed by pre-save hook)
      const user = new User({
        email,
        password,
        name,
        dietaryRestrictions: [],
        nutritionalGoals: {}
      });

      await user.save();

      // Generate JWT token
      const token = generateToken(user._id.toString());
      
      // Set token as HTTP-only cookie
      setTokenCookie(res, token);

      // Cache user session
      await CacheService.set(
        CacheService.keys.userSession(user._id.toString()),
        { userId: user._id, email: user.email },
        CacheService.ttl.userSession
      );

      // Return user data (without password)
      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  }

  // User login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate JWT token
      const token = generateToken(user._id.toString());
      
      // Set token as HTTP-only cookie
      setTokenCookie(res, token);

      // Cache user session
      await CacheService.set(
        CacheService.keys.userSession(user._id.toString()),
        { userId: user._id, email: user.email },
        CacheService.ttl.userSession
      );

      // Return user data
      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          dietaryRestrictions: user.dietaryRestrictions,
          nutritionalGoals: user.nutritionalGoals
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }

  // User logout
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear cookie
      clearTokenCookie(res);

      // Clear cached session if user is authenticated
      if (req.user?.userId) {
        await CacheService.delete(
          CacheService.keys.userSession(req.user.userId)
        );
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      // Try to get from cache first
      const cacheKey = CacheService.keys.userSession(req.user.userId);
      const cached = await CacheService.get(cacheKey);
      
      if (cached) {
        // Get full user data from database
        const user = await User.findById(req.user.userId).select('-password');
        res.json({ user });
        return;
      }

      // Get from database
      const user = await User.findById(req.user.userId).select('-password');
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Cache the session
      await CacheService.set(
        cacheKey,
        { userId: user._id, email: user.email },
        CacheService.ttl.userSession
      );

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  // Update user profile
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const { name, dietaryRestrictions, nutritionalGoals } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        {
          ...(name && { name }),
          ...(dietaryRestrictions && { dietaryRestrictions }),
          ...(nutritionalGoals && { nutritionalGoals })
        },
        { new: true, runValidators: true }
      ).select('-password');

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Update cache
      await CacheService.set(
        CacheService.keys.userSession(user._id.toString()),
        { userId: user._id, email: user.email },
        CacheService.ttl.userSession
      );

      res.json({ user });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}