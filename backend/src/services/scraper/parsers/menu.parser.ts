// src/services/scraper/parsers/menu.parser.ts
import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';

export interface ParsedMenuItem {
  name: string;
  recipeId: string;
  category: string;
  mealPeriod: string;
  station?: string;
}

export interface MenuStructure {
  restaurant: string;
  date: string;
  dayOfWeek: number;
  mealPeriods: {
    [period: string]: {
      [station: string]: ParsedMenuItem[];
    };
  };
}

export class MenuParser {
  static async parseMenuPage(page: Page, restaurantId: string): Promise<MenuStructure> {
    console.log(`📄 Parsing menu for ${restaurantId}`);
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Get page content
    const html = await page.content();
    const $ = cheerio.load(html);
    
    // Extract date from page
    const dateText = $('h2').first().text() || '';
    const dateMatch = dateText.match(/(\w+,\s+\w+\s+\d+,\s+\d+)/);
    const date = dateMatch ? new Date(dateMatch[1]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date(date).getDay();
    
    const mealPeriods: any = {};
    
    // Find all meal period sections
    $('h3').each((_, mealHeader) => {
      const mealPeriodText = $(mealHeader).text().trim();
      let mealPeriod = 'all-day';
      
      if (mealPeriodText.toLowerCase().includes('breakfast')) {
        mealPeriod = 'breakfast';
      } else if (mealPeriodText.toLowerCase().includes('lunch')) {
        mealPeriod = 'lunch';
      } else if (mealPeriodText.toLowerCase().includes('dinner')) {
        mealPeriod = 'dinner';
      } else if (mealPeriodText.toLowerCase().includes('late')) {
        mealPeriod = 'lateNight';
      }
      
      mealPeriods[mealPeriod] = {};
      
      // Find the menu content after this header
      let currentElement = $(mealHeader).next();
      let currentStation = 'General';
      
      while (currentElement.length && !currentElement.is('h3')) {
        // Check if it's a station header
        if (currentElement.is('h4') || currentElement.hasClass('station-header')) {
          currentStation = currentElement.text().trim();
          if (!mealPeriods[mealPeriod][currentStation]) {
            mealPeriods[mealPeriod][currentStation] = [];
          }
        }
        
        // Check for menu items
        const menuItems = currentElement.find('a').filter((_, el) => {
          const href = $(el).attr('href') || '';
          return href.includes('/Recipes/') || href.includes('RecipeDetails');
        });
        
        menuItems.each((_, itemElement) => {
          const $item = $(itemElement);
          const name = $item.text().trim();
          const href = $item.attr('href') || '';
          
          // Extract recipe ID from various URL formats
          let recipeId = '';
          
          // Format 1: /Recipes/077003/1
          const format1Match = href.match(/\/Recipes\/(\d+)/);
          if (format1Match) {
            recipeId = format1Match[1];
          }
          
          // Format 2: RecipeDetails.aspx?RecipeNumber=077003
          const format2Match = href.match(/RecipeNumber=(\d+)/);
          if (format2Match) {
            recipeId = format2Match[1];
          }
          
          // Format 3: recipe=2066
          const format3Match = href.match(/recipe=(\d+)/);
          if (format3Match) {
            recipeId = format3Match[1];
          }
          
          if (name && recipeId) {
            if (!mealPeriods[mealPeriod][currentStation]) {
              mealPeriods[mealPeriod][currentStation] = [];
            }
            
            mealPeriods[mealPeriod][currentStation].push({
              name,
              recipeId,
              category: currentStation,
              mealPeriod,
              station: currentStation
            });
          }
        });
        
        currentElement = currentElement.next();
      }
    });
    
    // If no meal periods found, try alternative parsing
    if (Object.keys(mealPeriods).length === 0) {
      console.log('⚠️ No meal periods found, trying alternative parsing...');
      
      // Look for all recipe links on the page
      const allLinks = $('a').filter((_, el) => {
        const href = $(el).attr('href') || '';
        return href.includes('/Recipes/') || href.includes('RecipeDetails') || href.includes('recipe=');
      });
      
      const defaultPeriod = 'all-day';
      mealPeriods[defaultPeriod] = { 'General': [] };
      
      allLinks.each((_, element) => {
        const $item = $(element);
        const name = $item.text().trim();
        const href = $item.attr('href') || '';
        
        // Extract recipe ID
        let recipeId = '';
        const matches = href.match(/(?:\/Recipes\/|RecipeNumber=|recipe=)(\d+)/);
        if (matches) {
          recipeId = matches[1];
        }
        
        if (name && recipeId) {
          mealPeriods[defaultPeriod]['General'].push({
            name,
            recipeId,
            category: 'General',
            mealPeriod: defaultPeriod,
            station: 'General'
          });
        }
      });
    }
    
    console.log(`✅ Found ${Object.keys(mealPeriods).length} meal periods`);
    
    return {
      restaurant: restaurantId,
      date,
      dayOfWeek,
      mealPeriods
    };
  }
}