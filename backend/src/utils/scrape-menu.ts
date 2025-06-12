// src/utils/scrape-menu.ts
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import { connectRedis } from '../config/redis';
import { ScraperService } from '../services/scraper/scraper.service';

dotenv.config();

async function runManualScrape() {
  try {
    console.log('🚀 Starting manual menu scrape...');
    console.log('📅 Date:', new Date().toISOString());
    
    // Connect to services
    await connectDatabase();
    await connectRedis();
    
    const scraper = new ScraperService();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const restaurants = args.includes('--all') 
      ? ['de-neve', 'bruin-plate', 'epicuria-covel', 'feast', 'rendezvous', 'the-study']
      : args.filter(arg => !arg.startsWith('--'));
    
    const forceRefresh = args.includes('--force');
    const tomorrow = args.includes('--tomorrow');
    
    // Determine dates
    const dates = [];
    if (tomorrow) {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      dates.push(date.toISOString().split('T')[0]);
    } else if (args.includes('--week')) {
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
    } else {
      dates.push(new Date().toISOString().split('T')[0]);
    }
    
    // Run scrape
    const result = await scraper.scrapeMenus({
      restaurants: restaurants.length > 0 ? restaurants : ['de-neve', 'bruin-plate', 'epicuria-covel'],
      dates,
      mode: forceRefresh ? 'full' : 'update',
      forceRefresh
    });
    
    // Display results
    console.log('\n📊 Scraping Results:');
    console.log(`✅ Success: ${result.success}`);
    console.log(`📥 Items scraped: ${result.itemsScraped}`);
    console.log(`💾 Items saved: ${result.itemsSaved}`);
    console.log(`⏱️ Duration: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`📈 Stats:`, result.stats);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(' -', error));
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    process.exit(1);
  }
}

// Show usage if --help
if (process.argv.includes('--help')) {
  console.log(`
Usage: npm run scrape [restaurants...] [options]

Restaurants:
  de-neve, bruin-plate, epicuria-covel, feast, rendezvous, the-study

Options:
  --all         Scrape all restaurants
  --force       Force refresh (ignore templates)
  --tomorrow    Scrape tomorrow's menu
  --week        Scrape entire week
  --help        Show this help message

Examples:
  npm run scrape                          # Scrape today's menu for default restaurants
  npm run scrape de-neve --tomorrow       # Scrape tomorrow's menu for De Neve
  npm run scrape --all --week --force     # Full refresh of all restaurants for the week
  `);
  process.exit(0);
}

// Run the scrape
runManualScrape();