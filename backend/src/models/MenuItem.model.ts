/**
 * @fileoverview Dining menu item data model implementation
 * @description defines a unified MenuItem class that handles all possible UCLA dining menu items
 * @since 6/7/2025 (last update)
 * @todo N/A
 */

import mongoose, { Document, Schema } from 'mongoose';
/**
 * @var DietaryTag for dietary restriction and allergen tags
 * @description Standardized tags based on UCLA's dining hall site icon system
 */
export type DietaryTag = 
  | 'vegan' | 'vegetarian' | 'low-carbon' | 'halal' 
  | 'contains-gluten' | 'contains-wheat' | 'contains-dairy' 
  | 'contains-eggs' | 'contains-soy' | 'contains-nuts' 
  | 'contains-fish' | 'contains-shellfish' | 'contains-sesame'
  | 'contains-alcohol' | 'high-carbon';

  /**
 * @interface NutritionData nutrition info data structure
 * @description Essential nutrition data based on ucla-dining online menut
 */
  export interface NutritionData {
    calories: number;
    protein: number;
    totalFat: number;
    saturatedFat: number;
    cholesterol: number;
    sodium: number;
    totalCarbs: number;
    dietaryFiber: number;
    sugars: number;
    calcium: number;
    iron: number;
    potassium: number;
  }
/**
 * @interface Menu item document interface
 * @description Complete menu item with nutrition, dietary info, and metadata for all items
 * @extends Document-Mongoose document interface
 */
export interface IMenuItem extends Document {
  name: string;
  servingSize: string;
  servingSizeOz: number;
  restaurant: string;
  restaurantType: 'residential' | 'boutique';
  category: string;
  station?: string;
  dietaryTags: DietaryTag[];
  nutrition: NutritionData;
  date: Date;
  mealPeriod?: string;
  aiInsights?: {
    healthScore: number;
    recommendations: string[];
    lastAnalyzed: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
/**
 * @var Schema Mongoose schema for menu items
 * @description Mongodb schema with validation, indexes, and constraints
 */

const MenuItemSchema = new Schema<IMenuItem>({
    name: { 
      type: String, 
      required: [true, 'Item name is required'],
      trim: true, 
      index: true,
      maxlength: [200, 'Item name cannot exceed 200 characters']
    },
    
    servingSize: { 
      type: String, 
      required: [true, 'Serving size is required'],
      trim: true
    },
    
    servingSizeOz: { 
      type: Number, 
      required: [true, 'Serving size in ounces is required'],
      min: [0.1, 'Serving size must be positive'],
      max: [100, 'Serving size cannot exceed 100 oz']
    },
    
    restaurant: { 
      type: String, 
      required: [true, 'Restaurant is required'],
      enum: {
        values: [
          // Residential dining halls
          'bruin-plate', 'de-neve', 'epicuria-covel',
          // Boutique dining locations
          'bruin-cafe', 'cafe-1919', 'epicuria-ackerman', 
          'rendezvous', 'the-drey', 'the-study', 'spice-kitchen'
        ],
        message: 'Invalid restaurant identifier'
      },
      index: true 
    },
    
    restaurantType: { 
      type: String, 
      required: [true, 'Restaurant type is required'],
      enum: {
        values: ['residential', 'boutique'],
        message: 'Restaurant type must be either residential or boutique'
      }
    },
    
    category: { 
      type: String, 
      required: [true, 'Category is required'],
      trim: true,
      index: true,
      maxlength: [100, 'Category name cannot exceed 100 characters']
    },
    
    station: {
      type: String,
      trim: true,
      maxlength: [100, 'Station name cannot exceed 100 characters']
    },
    
    dietaryTags: [{
      type: String,
      enum: {
        values: [
          'vegan', 'vegetarian', 'low-carbon', 'halal',
          'contains-gluten', 'contains-wheat', 'contains-dairy',
          'contains-eggs', 'contains-soy', 'contains-nuts',
          'contains-fish', 'contains-shellfish', 'contains-sesame',
          'contains-alcohol', 'high-carbon'
        ],
        message: 'Invalid dietary tag'
      }
    }],
    
    nutrition: {
      calories: { 
        type: Number, 
        required: [true, 'Calories are required'],
        min: [0, 'Calories cannot be negative'],
        max: [5000, 'Calories seem unreasonably high']
      },
      totalFat: { 
        type: Number, 
        required: [true, 'Total fat is required'],
        min: [0, 'Fat cannot be negative']
      },
      saturatedFat: { 
        type: Number, 
        required: [true, 'Saturated fat is required'],
        min: [0, 'Saturated fat cannot be negative']
      },
      cholesterol: { 
        type: Number, 
        required: [true, 'Cholesterol is required'],
        min: [0, 'Cholesterol cannot be negative']
      },
      sodium: { 
        type: Number, 
        required: [true, 'Sodium is required'],
        min: [0, 'Sodium cannot be negative']
      },
      totalCarbs: { 
        type: Number, 
        required: [true, 'Total carbs are required'],
        min: [0, 'Carbs cannot be negative']
      },
      dietaryFiber: { 
        type: Number, 
        required: [true, 'Dietary fiber is required'],
        min: [0, 'Fiber cannot be negative']
      },
      sugars: { 
        type: Number, 
        required: [true, 'Sugars are required'],
        min: [0, 'Sugars cannot be negative']
      },
      protein: { 
        type: Number, 
        required: [true, 'Protein is required'],
        min: [0, 'Protein cannot be negative']
      },
      // Optional micronutrients
      calcium: { 
        type: Number, 
        min: [0, 'Calcium content /mg cannot be negative']
      },
      iron: { 
        type: Number, 
        min: [0, 'Iron content /mg cannot be negative']
      },
      potassium: { 
        type: Number, 
        min: [0, 'Potassium content /mg cannot be negative']
      }
    },
    
    date: { 
      type: Date, 
      required: [true, 'Date is required'],
      index: true,
      validate: {
        validator: function(date: Date) {
          // Ensure date is not too far in the past or future
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          return date >= thirtyDaysAgo && date <= thirtyDaysFromNow;
        },
        message: 'Date must be within 30 days of current date'
      }
    },
    
    mealPeriod: { 
      type: String, 
      enum: {
        values: ['breakfast', 'lunch', 'dinner', 'all-day'],
        message: 'Invalid meal period'
      }
    },
    
    aiInsights: {
      healthScore: { 
        type: Number, 
        min: [0, 'Health score cannot be negative'],
        max: [100, 'Health score cannot exceed 100']
      },
      recommendations: [{
        type: String,
        maxlength: [500, 'Recommendation cannot exceed 500 characters']
      }],
      lastAnalyzed: Date
    }
  }, {
    timestamps: true,
    // Optimize for JSON serialization
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  });
  
  /** ==================== @database indexing ==================== */
  // idx for compound menu queries by restaurant & date
  MenuItemSchema.index({ restaurant: 1, date: 1 });
  
  // idx for compound meal period filter by date and meal period
  MenuItemSchema.index({ date: 1, mealPeriod: 1 });
  
  // Text idx for full-text search on item names and categories
  MenuItemSchema.index({ 
    name: 'text', 
    category: 'text' 
  }, {
    weights: { name: 10, category: 5 },
    name: 'menu_text_search'
  });
  
  MenuItemSchema.index({ dietaryTags: 1 }); // index for dietary tags
  MenuItemSchema.index({ 'nutrition.calories': 1 }); // idx for nutrition-based queries
  
  /**
   * @method (instance) - Check if item meets specific dietary reqs set by usr
   * @param requirements - Array of required dietary tags
   * @returns "True" if item meets all requirements
   */
  MenuItemSchema.methods.meetsDietaryRequirements = function(requirements: DietaryTag[]): boolean {
    return requirements.every(req => this.dietaryTags.includes(req));
  };
  
  /**
   * @method (instance) - Calculate nutrition density score (protein + fiber per calorie)
   * @returns Nutrition density score
   */
  MenuItemSchema.methods.getNutritionDensity = function(): number {
    return (this.nutrition.protein + this.nutrition.dietaryFiber) / this.nutrition.calories;
  };
  /**
    * @method (static) - Find menu items by dietary prefs
    * @param preferences - Array of dietary tags to filter by
    * @param date Optional - date filter
    * @returns Promise resolving to matching filtered menu items
   */
  MenuItemSchema.statics.findByDietaryPreferences = function(
    preferences: DietaryTag[], 
    date?: Date
  ) {
    const query: any = { dietaryTags: { $in: preferences } };
    if (date) {
      query.date = {
        $gte: new Date(date.toISOString().split('T')[0]),
        $lt: new Date(date.toISOString().split('T')[0] + 'T23:59:59.999Z')
      };
    }
    return this.find(query);
  };
  export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
