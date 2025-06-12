// src/services/scraper/parsers/nutrition.parser.ts
import { Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { DietaryTag } from '../../../models/MenuItem.model';

export interface NutritionInfo {
  name: string;
  servingSize: string;
  servingSizeOz: number;
  calories: number;
  totalFat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  totalCarbs: number;
  dietaryFiber: number;
  sugars: number;
  addedSugars: number;
  protein: number;
  vitaminD?: number;
  calcium?: number;
  iron?: number;
  potassium?: number;
  dietaryTags: DietaryTag[];
}

export class NutritionParser {
  private static dietaryTagMapping: Record<string, DietaryTag> = {
    'vegan': 'vegan',
    'vegetarian': 'vegetarian',
    'low-carbon': 'low-carbon',
    'low carbon': 'low-carbon',
    'halal': 'halal',
    'gluten': 'contains-gluten',
    'wheat': 'contains-wheat',
    'dairy': 'contains-dairy',
    'milk': 'contains-dairy',
    'eggs': 'contains-eggs',
    'egg': 'contains-eggs',
    'soy': 'contains-soy',
    'nuts': 'contains-nuts',
    'tree nuts': 'contains-nuts',
    'peanuts': 'contains-nuts',
    'peanut': 'contains-nuts',
    'fish': 'contains-fish',
    'shellfish': 'contains-shellfish',
    'sesame': 'contains-sesame',
    'alcohol': 'contains-alcohol',
    'high-carbon': 'high-carbon',
    'high carbon': 'high-carbon'
  };
  
  static async parseNutritionPage(page: Page, recipeId: string): Promise<NutritionInfo | null> {
    try {
      console.log(`🥗 Parsing nutrition for recipe ${recipeId}`);
      
      // Try different URL formats
      const urls = [
        `https://menu.dining.ucla.edu/Recipes/${recipeId}/1`,
        `https://menu.dining.ucla.edu/Recipes/${recipeId}`,
        `https://dining.ucla.edu/menu-item/?recipe=${recipeId}`
      ];
      
      let html = '';
      let loaded = false;
      
      for (const url of urls) {
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
          
          // Check if nutrition facts are present
          const hasNutrition = await page.$('.nutrition-facts, .nutritionLabel, #nutrition, .recipe-nutrition');
          if (hasNutrition) {
            html = await page.content();
            loaded = true;
            break;
          }
        } catch (error) {
          console.log(`Failed to load ${url}, trying next...`);
        }
      }
      
      if (!loaded || !html) {
        console.log(`❌ Could not load nutrition data for recipe ${recipeId}`);
        return null;
      }
      
      const $ = cheerio.load(html);
      
      // Extract item name
      const name = $('h1, h2, .recipe-name, .item-name').first().text().trim() || 'Unknown Item';
      
      // Extract serving size
      let servingSizeText = '';
      let servingSizeOz = 0;
      
      // Try different selectors for serving size
      const servingSizeSelectors = [
        '.serving-size',
        '.servingSize',
        'span:contains("Serving Size")',
        'td:contains("Serving Size")',
        '.nutrition-facts-serving'
      ];
      
      for (const selector of servingSizeSelectors) {
        const element = $(selector).first();
        if (element.length) {
          servingSizeText = element.text().replace(/Serving Size:?/i, '').trim();
          break;
        }
      }
      
      // Parse serving size in oz
      const ozMatch = servingSizeText.match(/(\d+\.?\d*)\s*oz/i);
      if (ozMatch) {
        servingSizeOz = parseFloat(ozMatch[1]);
      }
      
      // Extract nutrition values
      const nutrition: NutritionInfo = {
        name,
        servingSize: servingSizeText || '1 serving',
        servingSizeOz: servingSizeOz || 4.0, // Default 4oz if not found
        calories: this.parseNutrientValue($, ['calories', 'Calories']),
        totalFat: this.parseNutrientValue($, ['total-fat', 'totalFat', 'Total Fat', 'Fat']),
        saturatedFat: this.parseNutrientValue($, ['saturated-fat', 'saturatedFat', 'Saturated Fat']),
        transFat: this.parseNutrientValue($, ['trans-fat', 'transFat', 'Trans Fat']),
        cholesterol: this.parseNutrientValue($, ['cholesterol', 'Cholesterol']),
        sodium: this.parseNutrientValue($, ['sodium', 'Sodium']),
        totalCarbs: this.parseNutrientValue($, ['total-carbs', 'totalCarbs', 'Total Carbohydrate', 'Carbohydrate']),
        dietaryFiber: this.parseNutrientValue($, ['dietary-fiber', 'dietaryFiber', 'Dietary Fiber', 'Fiber']),
        sugars: this.parseNutrientValue($, ['sugars', 'Sugars', 'Sugar']),
        addedSugars: this.parseNutrientValue($, ['added-sugars', 'addedSugars', 'Added Sugars']),
        protein: this.parseNutrientValue($, ['protein', 'Protein']),
        vitaminD: this.parseNutrientValue($, ['vitamin-d', 'vitaminD', 'Vitamin D']),
        calcium: this.parseNutrientValue($, ['calcium', 'Calcium']),
        iron: this.parseNutrientValue($, ['iron', 'Iron']),
        potassium: this.parseNutrientValue($, ['potassium', 'Potassium']),
        dietaryTags: this.parseDietaryTags($)
      };
      
      console.log(`✅ Parsed nutrition for ${name}`);
      return nutrition;
      
    } catch (error) {
      console.error(`❌ Failed to parse nutrition for recipe ${recipeId}:`, error);
      return null;
    }
  }
  
  private static parseNutrientValue($: cheerio.CheerioAPI, selectors: string[]): number {
    for (const selector of selectors) {
      // Try class selector
      let element = $(`.${selector}`).first();
      if (!element.length) {
        // Try text contains
        element = $(`*:contains("${selector}")`).filter((_, el) => {
          const text = $(el).text();
          return text.includes(selector) && !$(el).children().length;
        }).first();
      }
      
      if (element.length) {
        const text = element.text();
        // Extract numeric value
        const match = text.match(/(\d+\.?\d*)/);
        if (match) {
          return parseFloat(match[1]);
        }
      }
    }
    
    return 0;
  }
  
  private static parseDietaryTags($: cheerio.CheerioAPI): DietaryTag[] {
    const tags: Set<DietaryTag> = new Set();
    
    // Look for dietary icons/images
    $('img[alt], img[title], .dietary-icon, .allergen-icon').each((_, element) => {
      const alt = $(element).attr('alt') || '';
      const title = $(element).attr('title') || '';
      const classes = $(element).attr('class') || '';
      
      const text = `${alt} ${title} ${classes}`.toLowerCase();
      
      Object.entries(this.dietaryTagMapping).forEach(([key, value]) => {
        if (text.includes(key)) {
          tags.add(value);
        }
      });
    });
    
    // Look for text indicators
    const pageText = $('body').text().toLowerCase();
    
    // Simple checks for common dietary tags
    if (pageText.includes('vegan') && !pageText.includes('non-vegan')) {
      tags.add('vegan');
    }
    if (pageText.includes('vegetarian')) {
      tags.add('vegetarian');
    }
    if (pageText.includes('halal')) {
      tags.add('halal');
    }
    
    // Check for allergens in ingredients or allergen sections
    const allergenSection = $('.allergens, .contains, [class*="allergen"]').text().toLowerCase();
    
    Object.entries(this.dietaryTagMapping).forEach(([key, value]) => {
      if (allergenSection.includes(key) && value.startsWith('contains-')) {
        tags.add(value);
      }
    });
    
    return Array.from(tags);
  }
}