// src/services/scraper/scraper.service.ts
import { BrowserManager } from './browser.manager';
import { MenuParser } from './parsers/menu.parser';
import { RecipeCacheManager } from './recipe-cache.manager';
import { DataTransformer } from './data.transformer';
import { ScrapeQueue } from './scraper.queue';
import { MenuService } from '../menu.service';
import { CacheService } from '../cache.service';
import WeeklyMenu from '../../models/WeeklyMenu.model';
import MenuItem from '../../models/MenuItem.model';

export interface ScrapeConfig {
  restaurants?: string[];
  dates?: string[];
  mode: 'full' | 'update';
  forceRefresh?: boolean;
}

export interface ScrapeResult {
  success: boolean;
  itemsScraped: number;
  itemsSaved: number;
  errors: any[];
  duration: number;
  stats: {
    restaurantsScraped: number;
    recipesCreated: number;
    recipesReused: number;
    templatesUpdated: number;
  };
}

export class ScraperService {
  private browserManager: BrowserManager;
  private queue: ScrapeQueue;
  private weeklyTemplateCache = new Map<string, any>();
  
  // Restaurant name mappings - consistent with existing code
  private static restaurantMappings: Record<string, string> = {
    'de-neve': 'DeNeve',
    'bruin-plate': 'BruinPlate',
    'epicuria-covel': 'Epicuria',
    'epicuria': 'Epicuria',
    'bruin-cafe': 'BruinCafe',
    'cafe-1919': 'Cafe1919',
    'rendezvous': 'Rendezvous',
    'the-study': 'TheStudy',
    'feast': 'FEAST',
    'spice-kitchen': 'SpiceKitchen'
  };
  
  constructor() {
    this.browserManager = new BrowserManager();
    this.queue = new ScrapeQueue({ concurrency: 2, interval: 3000 });
  }
  
  async scrapeMenus(config: ScrapeConfig): Promise<ScrapeResult> {
    const startTime = Date.now();
    const errors: any[] = [];
    let itemsScraped = 0;
    let itemsSaved = 0;
    const stats = {
      restaurantsScraped: 0,
      recipesCreated: 0,
      recipesReused: 0,
      templatesUpdated: 0
    };
    
    try {
      // Default restaurants - matching existing restaurant IDs
      const restaurants = config.restaurants || [
        'de-neve', 'bruin-plate', 'epicuria-covel'
      ];
      
      // Default to today if not specified
      const dates = config.dates || [new Date().toISOString().split('T')[0]];
      
      console.log(`\n🚀 Starting scrape for ${restaurants.length} restaurants, ${dates.length} dates`);
      console.log(`📅 Dates: ${dates.join(', ')}`);
      console.log(`🍽️ Restaurants: ${restaurants.join(', ')}`);
      
      // Process each restaurant
      for (const restaurant of restaurants) {
        for (const dateStr of dates) {
          const dayOfWeek = new Date(dateStr).getDay();
          
          try {
            // Check if we should use template
            const template = await this.getWeeklyTemplate(restaurant, dayOfWeek);
            
            if (template && !config.forceRefresh) {
              console.log(`\n📋 Using cached template for ${restaurant} on ${dateStr}`);
              const processed = await this.processTemplateMenu(template, dateStr);
              itemsSaved += processed;
              stats.recipesReused += processed;
            } else {
              console.log(`\n🔄 Scraping fresh menu for ${restaurant} on ${dateStr}`);
              const result = await this.scrapeRestaurant(restaurant, dateStr);
              
              if (result) {
                itemsScraped += result.totalItems;
                itemsSaved += result.savedItems;
                stats.recipesCreated += result.newRecipes;
                stats.recipesReused += result.existingRecipes;
                stats.restaurantsScraped++;
                
                // Update weekly template
                if (result.menuStructure) {
                  await this.updateWeeklyTemplate(restaurant, dayOfWeek, result.menuStructure);
                  stats.templatesUpdated++;
                }
              }
            }
            
            // Clear menu cache for this date - using existing cache service
            await CacheService.delete(CacheService.keys.menu(restaurant, dateStr));
            
          } catch (error) {
            console.error(`❌ Failed to process ${restaurant} on ${dateStr}:`, error);
            errors.push({
              restaurant,
              date: dateStr,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
      }
      
      // Wait for all queued tasks to complete
      await this.queue.onIdle();
      
      console.log('\n✅ Scraping completed!');
      console.log(`📊 Stats:`, stats);
      
    } catch (error) {
      console.error('❌ Scraper failed:', error);
      errors.push({ general: error instanceof Error ? error.message : String(error) });
    } finally {
      await this.browserManager.close();
      RecipeCacheManager.clearMemoryCache();
    }
    
    return {
      success: errors.length === 0,
      itemsScraped,
      itemsSaved,
      errors,
      duration: Date.now() - startTime,
      stats
    };
  }
  
  private async getWeeklyTemplate(restaurant: string, dayOfWeek: number) {
    const cacheKey = `${restaurant}-${dayOfWeek}`;
    
    if (this.weeklyTemplateCache.has(cacheKey)) {
      return this.weeklyTemplateCache.get(cacheKey);
    }
    
    const template = await WeeklyMenu.findOne({ restaurant, dayOfWeek });
    
    if (template) {
      this.weeklyTemplateCache.set(cacheKey, template);
    }
    
    return template;
  }
  
  private async processTemplateMenu(template: any, dateStr: string): Promise<number> {
    let itemCount = 0;
    const menuItems = [];
    
    // Build menu items from template and cached recipes
    for (const [mealPeriod, stations] of Object.entries(template.mealPeriods)) {
      for (const [stationName, recipeIds] of Object.entries(stations as any)) {
        for (const recipeId of recipeIds as string[]) {
          const recipe = await RecipeCacheManager.getRecipe(recipeId);
          
          if (recipe) {
            menuItems.push({
              name: recipe.name,
              servingSize: recipe.servingSize,
              servingSizeOz: recipe.servingSizeOz,
              restaurant: template.restaurant,
              restaurantType: this.getRestaurantType(template.restaurant),
              category: stationName,
              station: stationName,
              dietaryTags: recipe.dietaryTags,
              nutrition: recipe.nutrition,
              date: new Date(dateStr),
              mealPeriod
            });
            itemCount++;
          }
        }
      }
    }
    
    // Save menu items using existing menu service
    if (menuItems.length > 0) {
      await MenuService.saveMenuItems(menuItems);
      console.log(`✅ Processed ${itemCount} items from template`);
    }
    
    return itemCount;
  }
  
  private async scrapeRestaurant(restaurantId: string, dateStr: string) {
    const page = await this.browserManager.newPage();
    let totalItems = 0;
    let savedItems = 0;
    let newRecipes = 0;
    let existingRecipes = 0;
    let menuStructure = null;
    
    try {
      // Build URL
      const formattedName = ScraperService.restaurantMappings[restaurantId] || restaurantId;
      const url = `https://menu.dining.ucla.edu/Menus/${formattedName}/${dateStr}`;
      
      console.log(`📍 Navigating to: ${url}`);
      
      // Navigate with retry logic
      await this.browserManager.retry(async () => {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      });
      
      // Check if menu exists
      const pageContent = await page.content();
      if (pageContent.includes('No menu') || pageContent.includes('closed')) {
        console.log(`⚠️ No menu available for ${restaurantId} on ${dateStr}`);
        return null;
      }
      
      // Parse menu structure
      menuStructure = await MenuParser.parseMenuPage(page, restaurantId);
      
      // Extract all unique recipe IDs
      const uniqueRecipeIds = new Set<string>();
      const itemMap = new Map<string, any>();
      
      for (const [mealPeriod, stations] of Object.entries(menuStructure.mealPeriods)) {
        for (const [station, items] of Object.entries(stations)) {
          for (const item of items as any[]) {
            uniqueRecipeIds.add(item.recipeId);
            itemMap.set(item.recipeId, { ...item, mealPeriod, station });
          }
        }
      }
      
      console.log(`🔍 Found ${uniqueRecipeIds.size} unique recipes`);
      
      // Fetch nutrition for each recipe
      const menuItems = [];
      const nutritionPage = await this.browserManager.newPage();
      
      for (const recipeId of uniqueRecipeIds) {
        totalItems++;
        
        const recipe = await this.queue.add(async () => {
          const existingRecipe = await RecipeCacheManager.getRecipe(recipeId);
          
          if (existingRecipe) {
            existingRecipes++;
            return existingRecipe;
          }
          
          const newRecipe = await RecipeCacheManager.fetchAndCacheRecipe(recipeId, nutritionPage);
          if (newRecipe) {
            newRecipes++;
          }
          return newRecipe;
        });
        
        if (recipe && itemMap.has(recipeId)) {
          const itemInfo = itemMap.get(recipeId);
          const menuItem = DataTransformer.transformToMenuItem(
            itemInfo,
            {
              name: recipe.name,
              servingSize: recipe.servingSize,
              servingSizeOz: recipe.servingSizeOz,
              calories: recipe.nutrition.calories,
              totalFat: recipe.nutrition.totalFat,
              saturatedFat: recipe.nutrition.saturatedFat,
              transFat: recipe.nutrition.transFat,
              cholesterol: recipe.nutrition.cholesterol,
              sodium: recipe.nutrition.sodium,
              totalCarbs: recipe.nutrition.totalCarbs,
              dietaryFiber: recipe.nutrition.dietaryFiber,
              sugars: recipe.nutrition.sugars,
              addedSugars: recipe.nutrition.addedSugars,
              protein: recipe.nutrition.protein,
              vitaminD: recipe.nutrition.vitaminD,
              calcium: recipe.nutrition.calcium,
              iron: recipe.nutrition.iron,
              potassium: recipe.nutrition.potassium,
              dietaryTags: recipe.dietaryTags
            },
            restaurantId,
            new Date(dateStr)
          );
          
          if (menuItem) {
            menuItems.push(menuItem);
          }
        }
      }
      
      await nutritionPage.close();
      
      // Save menu items using existing service
      if (menuItems.length > 0) {
        savedItems = await MenuService.saveMenuItems(menuItems);
        console.log(`💾 Saved ${savedItems} menu items`);
      }
      
      return {
        menuStructure,
        totalItems,
        savedItems,
        newRecipes,
        existingRecipes
      };
      
    } catch (error) {
      console.error(`❌ Error scraping ${restaurantId}:`, error);
      throw error;
    } finally {
      await page.close();
    }
  }
  
  private async updateWeeklyTemplate(restaurant: string, dayOfWeek: number, menuStructure: any) {
    const template = {
      restaurant,
      dayOfWeek,
      mealPeriods: {} as any,
      lastUpdated: new Date()
    };
    
    // Transform menu structure to template format
    for (const [mealPeriod, stations] of Object.entries(menuStructure.mealPeriods)) {
      template.mealPeriods[mealPeriod] = {};
      
      for (const [station, items] of Object.entries(stations as any)) {
        template.mealPeriods[mealPeriod][station] = (items as any[]).map(item => item.recipeId);
      }
    }
    
    // Save or update template
    await WeeklyMenu.findOneAndUpdate(
      { restaurant, dayOfWeek },
      template,
      { upsert: true, new: true }
    );
    
    // Update cache
    const cacheKey = `${restaurant}-${dayOfWeek}`;
    this.weeklyTemplateCache.set(cacheKey, template);
    
    console.log(`📋 Updated weekly template for ${restaurant} (${this.getDayName(dayOfWeek)})`);
  }
  
  private getRestaurantType(restaurant: string): 'residential' | 'boutique' {
    const residentialHalls = ['bruin-plate', 'de-neve', 'epicuria-covel', 'epicuria'];
    return residentialHalls.includes(restaurant) ? 'residential' : 'boutique';
  }
  
  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }
  
  static async getScraperStats() {
    const recipeCount = await RecipeCacheManager.getRecipeCount();
    const templateCount = await WeeklyMenu.countDocuments();
    const todayMenuCount = await MenuItem.countDocuments({
      date: {
        $gte: new Date(new Date().toISOString().split('T')[0]),
        $lt: new Date(new Date().toISOString().split('T')[0] + 'T23:59:59.999Z')
      }
    });
    
    return {
      cachedRecipes: recipeCount,
      weeklyTemplates: templateCount,
      todaysMenuItems: todayMenuCount,
      lastUpdated: new Date()
    };
  }
}