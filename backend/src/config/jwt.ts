import jwt from 'jsonwebtoken';
import { Response } from 'express';

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';
export const JWT_EXPIRES_IN = '7d'; // Matches Redis session TTL

// Cookie configuration for security
export const COOKIE_OPTIONS = {
  httpOnly: true,           // Prevents JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict' as const,  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/'
};

// Generate JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId, iat: Date.now() },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Set token as HTTP-only cookie
export const setTokenCookie = (res: Response, token: string): void => {
  res.cookie('auth_token', token, COOKIE_OPTIONS);
};

// Clear authentication cookie
export const clearTokenCookie = (res: Response): void => {
  res.clearCookie('auth_token', COOKIE_OPTIONS);
};