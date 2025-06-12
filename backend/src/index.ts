import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { connectDatabase, checkDatabaseHealth } from './config/database';
import { connectRedis } from './config/redis';
import { loadSecrets } from './config/secret-manager'; // ########## NEW IMPORT ################
import recommendRoutes from './routes/recommend.routes';
import menuRoutes from './routes/menu.routes';
import scraperRoutes from './routes/scraper.routes';
import restaurantRoutes from './routes/restaurant.routes';
import apiRoutes from './routes/api.routes';
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

// ########## APP ENGINE WARMUP HANDLER ################
app.get('/_ah/warmup', (req: Request, res: Response) => {
  console.log('Warmup request received');
  res.status(200).send('Warmed up');
});

// ########## APP ENGINE HEALTH CHECK ################
app.get('/_ah/health', async (req: Request, res: Response) => {
  res.status(200).send('healthy');
});

// ########## ROUTES ################
app.use('/api', recommendRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api', apiRoutes);

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
      environment: process.env.NODE_ENV,
      version: process.env.GAE_VERSION || 'local'
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

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const startServer = async () => {
  try {
    // ########## LOAD SECRETS FROM GOOGLE SECRET MANAGER ################
    if (process.env.NODE_ENV === 'production') {
      console.log('🔐 Loading secrets from Google Secret Manager...');
      await loadSecrets();
    }
    
    // Connect to MongoDB
    await connectDatabase();
    
    // Connect to Redis
    await connectRedis();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🎯 Frontend CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      
      if (process.env.GAE_SERVICE) {
        console.log(`☁️  Running on Google App Engine`);
        console.log(`📦 Service: ${process.env.GAE_SERVICE}`);
        console.log(`🏷️  Version: ${process.env.GAE_VERSION}`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ########## INITIALIZE SCRAPER SCHEDULER ################
const scraperScheduler = new ScraperScheduler();
if (process.env.SCRAPER_ENABLED === 'true') {
  scraperScheduler.initializeSchedule();
}

// Graceful shutdown handlers
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