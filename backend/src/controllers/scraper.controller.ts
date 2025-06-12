// src/controllers/scraper.controller.ts
import { Request, Response } from 'express';
import { ScraperService } from '../services/scraper/scraper.service';
import { ScraperScheduler } from '../services/scraper/scheduler';

export class ScraperController {
  private static scraperService = new ScraperService();
  private static scraperScheduler = new ScraperScheduler();
  private static activeJobs = new Map<string, any>();
  
  // ########## HEALTH CHECK FOR CLOUD RUN ################
  static async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({ 
      status: 'healthy',
      service: 'nutri-bruin-scraper',
      timestamp: new Date().toISOString()
    });
  }
  
  static async runScraper(req: Request, res: Response): Promise<void> {
    try {
      const { restaurants, dates, mode = 'update', forceRefresh = false } = req.body;
      
      // Validate input
      if (restaurants && !Array.isArray(restaurants)) {
        res.status(400).json({ error: 'restaurants must be an array' });
        return;
      }
      
      if (dates && !Array.isArray(dates)) {
        res.status(400).json({ error: 'dates must be an array' });
        return;
      }
      
      // Generate job ID
      const jobId = `scrape_${Date.now()}`;
      
      // ########## CLOUD RUN TIMEOUT PROTECTION ################
      // Respond immediately and process in background
      res.status(202).json({
        jobId,
        status: 'accepted',
        message: 'Scraping job accepted and will run in background',
        statusUrl: `/api/scraper/status/${jobId}`,
        config: { restaurants, dates, mode, forceRefresh }
      });
      
      // Store initial job status
      ScraperController.activeJobs.set(jobId, {
        jobId,
        status: 'running',
        startedAt: new Date(),
        config: { restaurants, dates, mode, forceRefresh }
      });
      
      // Run scraping in background
      setImmediate(async () => {
        try {
          const result = await ScraperController.scraperService.scrapeMenus({
            restaurants: restaurants || ['de-neve', 'bruin-plate', 'epicuria-covel'],
            dates: dates || [new Date().toISOString().split('T')[0]],
            mode,
            forceRefresh
          });
          
          // Update job with results
          ScraperController.activeJobs.set(jobId, {
            ...ScraperController.activeJobs.get(jobId),
            completedAt: new Date(),
            result,
            status: 'completed'
          });
          
          // Clean up old jobs after 1 hour
          setTimeout(() => {
            ScraperController.activeJobs.delete(jobId);
          }, 3600000);
          
        } catch (error) {
          console.error(`Scraper job ${jobId} failed:`, error);
          
          // Update job with error
          ScraperController.activeJobs.set(jobId, {
            ...ScraperController.activeJobs.get(jobId),
            completedAt: new Date(),
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          });
          
          // Clean up failed jobs after 1 hour
          setTimeout(() => {
            ScraperController.activeJobs.delete(jobId);
          }, 3600000);
        }
      });
      
    } catch (error) {
      console.error('Scraper controller error:', error);
      res.status(500).json({ 
        error: 'Failed to start scraper',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async getScraperStatus(req: Request, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      
      // If specific job ID provided
      if (jobId) {
        const job = ScraperController.activeJobs.get(jobId);
        
        if (!job) {
          res.status(404).json({ 
            error: 'Job not found',
            message: 'The job may have completed and been cleaned up'
          });
          return;
        }
        
        res.json(job);
        return;
      }
      
      // Get all jobs
      const jobs = Array.from(ScraperController.activeJobs.entries()).map(
        ([id, job]) => ({
          jobId: id,
          status: job.status || 'unknown',
          startedAt: job.startedAt,
          completedAt: job.completedAt,
          config: job.config,
          result: job.result,
          error: job.error
        })
      );
      
      // Get scraper statistics
      const stats = await ScraperService.getScraperStats();
      
      res.json({
        activeJobs: jobs.filter(j => j.status === 'running'),
        recentJobs: jobs.filter(j => j.status !== 'running').slice(-10),
        stats,
        summary: {
          totalActive: jobs.filter(j => j.status === 'running').length,
          totalCompleted: jobs.filter(j => j.status === 'completed').length,
          totalFailed: jobs.filter(j => j.status === 'failed').length
        }
      });
    } catch (error) {
      console.error('Status error:', error);
      res.status(500).json({ 
        error: 'Failed to get scraper status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async refreshTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { restaurants } = req.body;
      
      // Validate input
      if (restaurants && !Array.isArray(restaurants)) {
        res.status(400).json({ error: 'restaurants must be an array' });
        return;
      }
      
      // ########## FIXED: Explicitly type the dates array ################
      const dates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      const jobId = `refresh_${Date.now()}`;
      
      // Respond immediately
      res.status(202).json({
        jobId,
        status: 'accepted',
        message: 'Template refresh started',
        statusUrl: `/api/scraper/status/${jobId}`,
        config: {
          restaurants: restaurants || ['de-neve', 'bruin-plate', 'epicuria-covel'],
          dates,
          mode: 'full',
          forceRefresh: true
        }
      });
      
      // Store initial job status
      ScraperController.activeJobs.set(jobId, {
        jobId,
        status: 'running',
        startedAt: new Date(),
        config: { 
          restaurants: restaurants || ['de-neve', 'bruin-plate', 'epicuria-covel'], 
          dates, 
          mode: 'full', 
          forceRefresh: true 
        }
      });
      
      // Run refresh in background
      setImmediate(async () => {
        try {
          const result = await ScraperController.scraperService.scrapeMenus({
            restaurants: restaurants || ['de-neve', 'bruin-plate', 'epicuria-covel'],
            dates,
            mode: 'full',
            forceRefresh: true
          });
          
          // Update job with results
          ScraperController.activeJobs.set(jobId, {
            ...ScraperController.activeJobs.get(jobId),
            completedAt: new Date(),
            result,
            status: 'completed'
          });
          
          // Clean up after 1 hour
          setTimeout(() => {
            ScraperController.activeJobs.delete(jobId);
          }, 3600000);
          
        } catch (error) {
          console.error(`Refresh job ${jobId} failed:`, error);
          
          // Update job with error
          ScraperController.activeJobs.set(jobId, {
            ...ScraperController.activeJobs.get(jobId),
            completedAt: new Date(),
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          });
          
          // Clean up after 1 hour
          setTimeout(() => {
            ScraperController.activeJobs.delete(jobId);
          }, 3600000);
        }
      });
      
    } catch (error) {
      console.error('Refresh error:', error);
      res.status(500).json({ 
        error: 'Failed to refresh templates',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async getScraperStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await ScraperService.getScraperStats();
      
      // Add current job counts
      const jobs = Array.from(ScraperController.activeJobs.values());
      const jobStats = {
        activeJobs: jobs.filter(j => j.status === 'running').length,
        completedJobs: jobs.filter(j => j.status === 'completed').length,
        failedJobs: jobs.filter(j => j.status === 'failed').length
      };
      
      res.json({
        ...stats,
        currentJobs: jobStats,
        serverTime: new Date().toISOString()
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ 
        error: 'Failed to get scraper stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async runScheduledScrape(req: Request, res: Response): Promise<void> {
    try {
      // This endpoint is for manual triggering of the scheduled scrape
      const jobId = `scheduled_${Date.now()}`;
      
      res.status(202).json({
        jobId,
        status: 'accepted',
        message: 'Scheduled scrape started',
        statusUrl: `/api/scraper/status/${jobId}`
      });
      
      // Store initial job status
      ScraperController.activeJobs.set(jobId, {
        jobId,
        status: 'running',
        startedAt: new Date(),
        type: 'scheduled'
      });
      
      // Run in background
      setImmediate(async () => {
        try {
          const result = await ScraperController.scraperScheduler.runImmediately();
          
          // Update job with results
          ScraperController.activeJobs.set(jobId, {
            ...ScraperController.activeJobs.get(jobId),
            completedAt: new Date(),
            result,
            status: 'completed'
          });
          
          // Clean up after 1 hour
          setTimeout(() => {
            ScraperController.activeJobs.delete(jobId);
          }, 3600000);
          
        } catch (error) {
          console.error(`Scheduled scrape ${jobId} failed:`, error);
          
          // Update job with error
          ScraperController.activeJobs.set(jobId, {
            ...ScraperController.activeJobs.get(jobId),
            completedAt: new Date(),
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          });
          
          // Clean up after 1 hour
          setTimeout(() => {
            ScraperController.activeJobs.delete(jobId);
          }, 3600000);
        }
      });
      
    } catch (error) {
      console.error('Scheduled scrape error:', error);
      res.status(500).json({ 
        error: 'Failed to run scheduled scrape',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}