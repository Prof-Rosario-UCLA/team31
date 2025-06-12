// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to optionally authenticate user from JWT or session
 * Continues regardless of whether user is authenticated
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  // Example: set req.user = null if not logged in
  req.user = null; // This would be set from session/JWT in real apps
  next();
}