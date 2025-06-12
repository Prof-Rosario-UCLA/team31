//location will have latitude and longitude
export type Location = {
    lat: number;
    lng: number;
};
  
  //all foods will have their name, the calories they have, the amount of protein, 
  // and their serving size (converted to grams for concistency)
export type Food = {
    name: string;
    calories: number;
    protein: number;
    servingSize: number; //ensure conversion to grams not oz
    diningHall: string;
};
  
//Dining Halls will have a numeric id, named string, coordinates, avgPC stored, and a list of all their foods
export type DiningHall = {
    id: number;
    name: string;
    coords: Location;
    avgPC: number;
    allFoods: Food[];
};


// frontend/src/types/models.ts - ADD:
export interface BackendRecommendation {
    goal: 'cutting' | 'bulking';
    restaurants: Array<{
      name: string;
      displayName: string;
      avgProteinCalorieRatio: number;
      itemCount: number;
      qualityItemCount: number;
      distance: number;
      caloriesBurned: number;
    }>;
    topFoods: Array<{
      name: string;
      restaurant: string;
      restaurantDisplayName: string;
      proteinCalorieRatio: number;
      calories: number;
      protein: number;
      servingSize: string;
    }>;
  }