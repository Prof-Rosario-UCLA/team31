// src/services/scraper/data.transformer.ts
import { IMenuItem, DietaryTag } from '../../models/MenuItem.model'; // ########## ADDED DIETARYTAG IMPORT ################
import { ParsedMenuItem } from './parsers/menu.parser';
import { NutritionInfo } from './parsers/nutrition.parser';

export class DataTransformer {
  private static restaurantTypes: Record<string, 'residential' | 'boutique'> = {
    'bruin-plate': 'residential',
    'de-neve': 'residential',
    'epicuria-covel': 'residential',
    'epicuria': 'residential',
    'bruin-cafe': 'boutique',
    'cafe-1919': 'boutique',
    'epicuria-ackerman': 'boutique',
    'rendezvous': 'boutique',
    'the-drey': 'boutique',
    'the-study': 'boutique',
    'spice-kitchen': 'boutique',
    'feast': 'boutique'
  };
  
  static transformToMenuItem(
    parsedItem: ParsedMenuItem,
    nutrition: NutritionInfo | null,
    restaurant: string,
    date: Date
  ): Partial<IMenuItem> | null {
    if (!nutrition) {
      console.log(`⚠️ No nutrition data for ${parsedItem.name}, skipping...`);
      return null;
    }
    
    // Use nutrition name if available (more accurate), otherwise use parsed name
    const itemName = nutrition.name || parsedItem.name;
    
    return {
      name: itemName,
      servingSize: nutrition.servingSize,
      servingSizeOz: nutrition.servingSizeOz,
      restaurant: restaurant.toLowerCase().replace(/\s+/g, '-'),
      restaurantType: this.restaurantTypes[restaurant.toLowerCase().replace(/\s+/g, '-')] || 'boutique',
      category: parsedItem.category,
      station: parsedItem.station,
      dietaryTags: nutrition.dietaryTags as DietaryTag[], // ########## EXPLICIT CAST ################
      nutrition: {
        calories: nutrition.calories,
        protein: nutrition.protein,
        totalFat: nutrition.totalFat,
        saturatedFat: nutrition.saturatedFat,
        cholesterol: nutrition.cholesterol,
        sodium: nutrition.sodium,
        totalCarbs: nutrition.totalCarbs,
        dietaryFiber: nutrition.dietaryFiber,
        sugars: nutrition.sugars,
        calcium: nutrition.calcium ?? 0,
        iron: nutrition.iron ?? 0,
        potassium: nutrition.potassium ?? 0
      },
      date,
      mealPeriod: parsedItem.mealPeriod
    };
  }
  
  static transformToRecipeMaster(recipeId: string, nutrition: NutritionInfo) {
    return {
      recipeId,
      name: nutrition.name,
      servingSize: nutrition.servingSize,
      servingSizeOz: nutrition.servingSizeOz,
      nutrition: {
        calories: nutrition.calories,
        totalFat: nutrition.totalFat,
        saturatedFat: nutrition.saturatedFat,
        transFat: nutrition.transFat,
        cholesterol: nutrition.cholesterol,
        sodium: nutrition.sodium,
        totalCarbs: nutrition.totalCarbs,
        dietaryFiber: nutrition.dietaryFiber,
        sugars: nutrition.sugars,
        addedSugars: nutrition.addedSugars,
        protein: nutrition.protein,
        vitaminD: nutrition.vitaminD,
        calcium: nutrition.calcium,
        iron: nutrition.iron,
        potassium: nutrition.potassium
      },
      dietaryTags: nutrition.dietaryTags as DietaryTag[], // ########## EXPLICIT CAST ################
      lastUpdated: new Date()
    };
  }
}