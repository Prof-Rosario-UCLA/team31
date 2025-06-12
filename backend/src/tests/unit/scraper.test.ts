// src/utils/test-scraper-standalone.ts
import dotenv from 'dotenv';
import { BrowserManager } from '../../services/scraper/browser.manager';
import { MenuParser } from '../../services/scraper/parsers/menu.parser';
import { NutritionParser } from '../../services/scraper/parsers/nutrition.parser';

dotenv.config();

async function testScraperStandalone() {
  const browserManager = new BrowserManager();
  
  try {
    console.log('🚀 Starting standalone scraper test...');
    console.log('📅 Date:', new Date().toISOString());
    
    const page = await browserManager.newPage();
    const dateStr = new Date().toISOString().split('T')[0];
    const restaurant = 'de-neve';
    const formattedName = 'DeNeve';
    
    // Test menu page parsing
    const url = `https://menu.dining.ucla.edu/Menus/${formattedName}/${dateStr}`;
    console.log(`\n📍 Navigating to: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('⏳ Parsing menu structure...');
    const menuStructure = await MenuParser.parseMenuPage(page, restaurant);
    
    console.log('\n✅ Menu structure parsed!');
    console.log(`📊 Found ${Object.keys(menuStructure.mealPeriods).length} meal periods`);
    
    // Display meal periods
    for (const [period, stations] of Object.entries(menuStructure.mealPeriods)) {
      const itemCount = Object.values(stations).reduce((sum, items) => sum + (items as any[]).length, 0);
      console.log(`\n🍽️ ${period.toUpperCase()}: ${itemCount} items across ${Object.keys(stations).length} stations`);
      
      // Show first few items
      for (const [station, items] of Object.entries(stations)) {
        console.log(`  📍 ${station}:`);
        (items as any[]).slice(0, 3).forEach(item => {
          console.log(`     - ${item.name} (ID: ${item.recipeId})`);
        });
        if ((items as any[]).length > 3) {
          console.log(`     ... and ${(items as any[]).length - 3} more items`);
        }
      }
    }
    
    // Test nutrition parsing for first item
    const firstItem = Object.values(menuStructure.mealPeriods)[0]?.[Object.keys(Object.values(menuStructure.mealPeriods)[0])[0]]?.[0];
    
    if (firstItem) {
      console.log(`\n🥗 Testing nutrition parsing for: ${firstItem.name}`);
      const nutritionPage = await browserManager.newPage();
      const nutrition = await NutritionParser.parseNutritionPage(nutritionPage, firstItem.recipeId);
      
      if (nutrition) {
        console.log('\n✅ Nutrition data:');
        console.log(`  📊 Calories: ${nutrition.calories}`);
        console.log(`  🥩 Protein: ${nutrition.protein}g`);
        console.log(`  🍞 Carbs: ${nutrition.totalCarbs}g`);
        console.log(`  🧈 Fat: ${nutrition.totalFat}g`);
        console.log(`  🏷️ Dietary tags: ${nutrition.dietaryTags.join(', ') || 'none'}`);
      }
      
      await nutritionPage.close();
    }
    
    await page.close();
    console.log('\n✅ Test completed successfully!');
    console.log('💡 The scraper is working! To save data, set up MongoDB connection in .env');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error && error.message.includes('closed')) {
      console.log('💡 Tip: The dining hall might be closed or no menu available for today');
    }
  } finally {
    await browserManager.close();
    process.exit(0);
  }
}

// Run the test
testScraperStandalone();