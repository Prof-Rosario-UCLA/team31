import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDatabase, checkDatabaseHealth } from './config/database';
import { connectRedis } from './config/redis';
import recommendRoutes from './routes/recommend.routes';
import menuRoutes from './routes/menu.routes';
import scraperRoutes from './routes/scraper.routes';
import restaurantRoutes from './routes/restaurant.routes'; // ########## NEW RESTAURANT ROUTES ################
import apiRoutes from './routes/api.routes'; // ########## NEW API ROUTES ################
import { ScraperScheduler } from './services/scraper/scheduler';
// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;

// ########## UPDATED MIDDLEWARE WITH CORS FOR FRONTEND ################
app.use(helmet({
  contentSecurityPolicy: false // Disable for development
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ########## UPDATED ROUTES WITH NEW ENDPOINTS ################
app.use('/api', recommendRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/restaurants', restaurantRoutes); // ########## NEW RESTAURANT ENDPOINTS ################
app.use('/api', apiRoutes); // ########## NEW UNIFIED API ENDPOINTS ################

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbHealthy = await checkDatabaseHealth();
    res.status(dbHealthy ? 200 : 503).json({
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'operational',
        database: dbHealthy ? 'connected' : 'disconnected',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
    });
  }
});

// Root endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'NutriBruin API is running!',
    version: '2.0.0',
    endpoints: {
      recommendations: 'POST /api/recommendations',
      restaurants: 'GET /api/restaurants',
      todaysMenu: 'GET /api/menu/today',
      health: 'GET /api/health'
    }
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Connect to Redis
    await connectRedis();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🎯 Frontend CORS enabled for: http://localhost:3000`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ########## INITIALIZE SCRAPER SCHEDULER ################
const scraperScheduler = new ScraperScheduler();
scraperScheduler.initializeSchedule();

// Update graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  scraperScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  scraperScheduler.stop();
  process.exit(0);
});

// Start the server
startServer();

export default app;