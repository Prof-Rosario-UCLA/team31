// src/routes/scraper.routes.ts
import { Router } from 'express';
import { ScraperController } from '../controllers/scraper.controller';

const router = Router();

router.get('/mock', ScraperController.runMockScraper); 

// ########## ADD HEALTH CHECK ROUTE ################
router.get('/health', ScraperController.healthCheck);

// Manual scrape trigger
router.post('/run', ScraperController.runScraper);

// Get scraping status (all jobs or specific job)
router.get('/status/:jobId?', ScraperController.getScraperStatus);

// Force refresh templates
router.post('/refresh-templates', ScraperController.refreshTemplates);

// Get scraper statistics
router.get('/stats', ScraperController.getScraperStats);

// Run scheduled scrape immediately
router.post('/run-scheduled', ScraperController.runScheduledScrape);

export default router;