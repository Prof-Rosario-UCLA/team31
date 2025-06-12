import MenuItem, { IMenuItem } from '../models/MenuItem.model';
import Restaurant from '../models/Restaurant.model';

interface Location {
  lat: number;
  lng: number;
}

interface RestaurantRecommendation {
  name: string;
  displayName: string;
  avgProteinCalorieRatio: number;
  itemCount: number;
  qualityItemCount: number; // Items above average P/C ratio
  distance: number;
  caloriesBurned: number;
  rank: number;
}

interface FoodRecommendation {
  name: string;
  restaurant: string;
  restaurantDisplayName: string;
  proteinCalorieRatio: number;
  calories: number;
  protein: number;
  servingSize: string;
}

export class RecommendService {
  // Constants for calculations
  private static readonly CALORIES_PER_MILE_WALKING = 100;
  private static readonly WALKING_SPEED_MPH = 3;

  static async getRecommendations(goal: 'cutting' | 'bulking', userLocation?: Location) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all menu items for today
    const menuItems = await MenuItem.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    // Get all restaurants
    const restaurants = await Restaurant.find({ isActive: true });

    // Calculate recommendations based on goal
    const restaurantRecs = await this.calculateRestaurantRecommendations(
      menuItems,
      restaurants,
      goal,
      userLocation
    );

    const foodRecs = this.calculateTopFoods(menuItems, goal);

    return {
      goal,
      restaurants: restaurantRecs.slice(0, 3), // Top 3 restaurants
      topFoods: foodRecs.slice(0, 3), // Top 3 foods
      timestamp: new Date()
    };
  }

  private static async calculateRestaurantRecommendations(
    menuItems: IMenuItem[],
    restaurants: any[],
    goal: 'cutting' | 'bulking',
    userLocation?: Location
  ): Promise<RestaurantRecommendation[]> {
    const restaurantMap = new Map<string, any>();
    restaurants.forEach(r => restaurantMap.set(r.id, r));

    // Group items by restaurant
    const itemsByRestaurant = new Map<string, IMenuItem[]>();
    menuItems.forEach(item => {
      if (!itemsByRestaurant.has(item.restaurant)) {
        itemsByRestaurant.set(item.restaurant, []);
      }
      itemsByRestaurant.get(item.restaurant)!.push(item);
    });

    // Calculate metrics for each restaurant
    const recommendations: RestaurantRecommendation[] = [];

    for (const [restaurantId, items] of itemsByRestaurant) {
      const restaurant = restaurantMap.get(restaurantId);
      if (!restaurant) continue;

      // Calculate protein/calorie ratios
      const proteinCalorieRatios = items.map(item => 
        (item.nutrition.protein * 10) / item.nutrition.calories
      );
      
      const avgRatio = proteinCalorieRatios.reduce((a, b) => a + b, 0) / proteinCalorieRatios.length;
      const overallAvg = menuItems.reduce((sum, item) => 
        sum + (item.nutrition.protein * 10) / item.nutrition.calories, 0
      ) / menuItems.length;
      
      const qualityItemCount = proteinCalorieRatios.filter(ratio => ratio > overallAvg).length;

      // Calculate distance if user location provided
      let distance = 0;
      let caloriesBurned = 0;
      
      if (userLocation && restaurant.location?.coordinates) {
        distance = this.calculateDistance(
          userLocation.lat,
          userLocation.lng,
          restaurant.location.coordinates[1], // latitude
          restaurant.location.coordinates[0]  // longitude
        );
        caloriesBurned = Math.round(distance * this.CALORIES_PER_MILE_WALKING);
      }

      // Calculate composite score based on goal
      let score = 0;
      if (goal === 'cutting') {
        // Prioritize high protein/calorie ratio and calories burned
        score = avgRatio * 0.4 + 
                (qualityItemCount / items.length) * 0.3 + 
                (caloriesBurned / 100) * 0.3;
      } else { // bulking
        // Prioritize calorie density
        const avgCaloriesPerOz = items.reduce((sum, item) => 
          sum + (item.nutrition.calories / item.servingSizeOz), 0
        ) / items.length;
        score = (avgCaloriesPerOz / 100) * 0.5 + 
                avgRatio * 0.3 + 
                (items.length / 50) * 0.2;
      }

      recommendations.push({
        name: restaurantId,
        displayName: restaurant.name,
        avgProteinCalorieRatio: Number(avgRatio.toFixed(2)),
        itemCount: items.length,
        qualityItemCount,
        distance: Number(distance.toFixed(2)),
        caloriesBurned,
        rank: score
      });
    }

    // Sort by score descending
    return recommendations.sort((a, b) => b.rank - a.rank);
  }

  private static calculateTopFoods(menuItems: IMenuItem[], goal: 'cutting' | 'bulking'): FoodRecommendation[] {
    // Map restaurant IDs to display names
    const restaurantNames: { [key: string]: string } = {
      'bruin-plate': 'BPlate',
      'de-neve': 'De Neve',
      'epicuria-covel': 'Covel',
      'rendezvous': 'Rende West',
      'bruin-cafe': 'Bruin Cafe',
      'the-study': 'The Study'
    };

    let scoredItems = menuItems.map(item => {
      const proteinCalorieRatio = (item.nutrition.protein * 10) / item.nutrition.calories;
      let score = 0;

      if (goal === 'cutting') {
        // High protein/calorie ratio is best
        score = proteinCalorieRatio;
      } else { // bulking
        // High calories per oz with decent protein
        score = (item.nutrition.calories / item.servingSizeOz) * 0.7 + proteinCalorieRatio * 0.3;
      }

      return {
        name: item.name,
        restaurant: item.restaurant,
        restaurantDisplayName: restaurantNames[item.restaurant] || item.restaurant,
        proteinCalorieRatio: Number(proteinCalorieRatio.toFixed(1)),
        calories: item.nutrition.calories,
        protein: item.nutrition.protein,
        servingSize: item.servingSize,
        score
      };
    });

    // Sort by score and return top items
    return scoredItems
      .sort((a, b) => b.score - a.score)
      .map(({ score, ...item }) => item); // Remove score from final output
  }

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula for distance calculation
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  static async getAllTodaysMenuItems() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return MenuItem.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).select('-__v -createdAt -updatedAt');
  }
}