// src/services/scraper/fake-scraper.ts
import MenuItemModel from '../../models/MenuItem.model';
import { IMenuItem } from '../../models/MenuItem.model';

export const dummyMenuData: Partial<IMenuItem>[] = [
  {
    name: 'Lemon Herb Chicken',
    servingSize: '6 oz',
    servingSizeOz: 6,
    restaurant: 'bruin-plate',
    restaurantType: 'residential',
    category: 'Entrees',
    station: 'Grill Station',
    dietaryTags: ['halal', 'contains-dairy'],
    nutrition: {
      calories: 220,
      protein: 28,
      totalFat: 8,
      saturatedFat: 2.5,
      cholesterol: 75,
      sodium: 300,
      totalCarbs: 2,
      dietaryFiber: 0,
      sugars: 1,
      calcium: 20,
      iron: 1.5,
      potassium: 280
    },
    date: new Date(),
    mealPeriod: 'lunch'
  },
  {
    name: 'Tofu Stir Fry',
    servingSize: '5 oz',
    servingSizeOz: 5,
    restaurant: 'epicuria-covel',
    restaurantType: 'residential',
    category: 'Vegan',
    station: 'Global Kitchen',
    dietaryTags: ['vegan', 'low-carbon', 'contains-soy'],
    nutrition: {
      calories: 180,
      protein: 14,
      totalFat: 6,
      saturatedFat: 1,
      cholesterol: 0,
      sodium: 400,
      totalCarbs: 15,
      dietaryFiber: 4,
      sugars: 3,
      calcium: 200,
      iron: 3.2,
      potassium: 320
    },
    date: new Date(),
    mealPeriod: 'dinner'
  },
  {
    name: 'Scrambled Eggs',
    servingSize: '4 oz',
    servingSizeOz: 4,
    restaurant: 'de-neve',
    restaurantType: 'residential',
    category: 'Breakfast',
    station: 'Breakfast Grill',
    dietaryTags: ['contains-eggs', 'contains-dairy'],
    nutrition: {
      calories: 140,
      protein: 10,
      totalFat: 10,
      saturatedFat: 3,
      cholesterol: 185,
      sodium: 160,
      totalCarbs: 1,
      dietaryFiber: 0,
      sugars: 0.5,
      calcium: 50,
      iron: 1.2,
      potassium: 95
    },
    date: new Date(),
    mealPeriod: 'breakfast'
  }
];

export async function simulateScraper(): Promise<void> {
  for (const item of dummyMenuData) {
    const exists = await MenuItemModel.findOne({ name: item.name, date: item.date });
    if (!exists) {
      await MenuItemModel.create(item);
      console.log(`✅ Inserted: ${item.name}`);
    } else {
      console.log(`ℹ️ Already exists: ${item.name}`);
    }
  }
}
