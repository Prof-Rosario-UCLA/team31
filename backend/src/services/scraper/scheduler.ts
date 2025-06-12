// src/services/scraper/scheduler.ts
import cron from 'node-cron';
import { ScraperService } from './scraper.service';

export class ScraperScheduler {
  private scraperService: ScraperService;
  private dailyJob: cron.ScheduledTask | null = null;
  private weeklyJob: cron.ScheduledTask | null = null;
  
  constructor() {
    this.scraperService = new ScraperService();
  }
  
  initializeSchedule() {
    // Daily scrape at 4 AM PST (11 AM UTC)
    this.dailyJob = cron.schedule('0 11 * * *', async () => {
      console.log('🌅 Starting daily menu scrape...');
      
      try {
        const result = await this.scraperService.scrapeMenus({
          restaurants: ['de-neve', 'bruin-plate', 'epicuria-covel'],
          dates: [new Date().toISOString().split('T')[0]],
          mode: 'update'
        });
        
        console.log(`✅ Daily scrape completed: ${result.itemsSaved} items saved`);
      } catch (error) {
        console.error('❌ Daily scrape failed:', error);
      }
    }, {
      scheduled: true,
      timezone: "America/Los_Angeles"
    });
    
    // Weekly full refresh on Sunday at 2 AM PST (9 AM UTC)
    this.weeklyJob = cron.schedule('0 9 * * 0', async () => {
      console.log('🔄 Starting weekly full refresh...');
      
      try {
        // Scrape entire week to update templates
        const dates = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
        
        const result = await this.scraperService.scrapeMenus({
          restaurants: ['de-neve', 'bruin-plate', 'epicuria-covel'],
          dates,
          mode: 'full',
          forceRefresh: true
        });
        
        console.log(`✅ Weekly refresh completed: ${result.itemsSaved} items saved`);
      } catch (error) {
        console.error('❌ Weekly refresh failed:', error);
      }
    }, {
      scheduled: true,
      timezone: "America/Los_Angeles"
    });
    
    console.log('📅 Scraping schedule initialized');
    console.log('  - Daily scrape: 4:00 AM PST');
    console.log('  - Weekly refresh: Sunday 2:00 AM PST');
  }
  
  stop() {
    if (this.dailyJob) {
      this.dailyJob.stop();
      this.dailyJob = null;
    }
    
    if (this.weeklyJob) {
      this.weeklyJob.stop();
      this.weeklyJob = null;
    }
    
    console.log('🛑 Scraping schedule stopped');
  }
  
  async runImmediately() {
    console.log('🚀 Running immediate scrape...');
    
    return this.scraperService.scrapeMenus({
      restaurants: ['de-neve', 'bruin-plate', 'epicuria-covel'],
      dates: [new Date().toISOString().split('T')[0]],
      mode: 'update'
    });
  }
}