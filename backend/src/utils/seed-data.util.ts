import MenuItem from '../models/MenuItem.model';
import Restaurant from '../models/Restaurant.model';

export async function seedTestData() {
  // Clear existing data
  await MenuItem.deleteMany({});
  await Restaurant.deleteMany({});
  
  // Add test restaurant
  await Restaurant.create({
    id: 'bruin-cafe',
    name: 'Bruin Café',
    type: 'boutique',
    description: 'Quick grab-and-go options',
    location: {
      address: 'Sproul Hall, UCLA',
      coordinates: [-118.4441, 34.0709]
    },
    isActive: true
  });
  
  // Add test menu items
  await MenuItem.create({
    name: 'BBQ Beef Brisket Sandwich',
    servingSize: '11.4oz',
    servingSizeOz: 11.4,
    restaurant: 'bruin-cafe',
    restaurantType: 'boutique',
    category: 'TOASTED SANDWICHES',
    dietaryTags: ['high-carbon', 'contains-soy', 'contains-gluten', 'contains-wheat', 'contains-alcohol'],
    nutrition: {
      calories: 719,
      totalFat: 28.1,
      saturatedFat: 8.72,
      cholesterol: 91.11,
      sodium: 1578.34,
      totalCarbs: 74.31,
      dietaryFiber: 3.23,
      sugars: 6.46,
      protein: 37.15,
      calcium: 31.98,
      iron: 2.26,
      potassium: 187.07
    },
    date: new Date(),
    mealPeriod: 'all-day'
  });
  
  console.log('✅ Test data seeded');
}