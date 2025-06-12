/**
 * @fileoverview Restaurant location data model implementation
 * @description defines UCLA dining hall and boutique restaurant information storage
 * @since 6/7/2025 (last update)
 * @todo N/A
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * @interface Restaurant document interface
 * @description Complete restaurant info with location, hours, and operational data
 * @extends Document-Mongoose document interface
 */
export interface IRestaurant extends Document {
  id: string;
  name: string;
  type: 'residential' | 'boutique';
  description: string;
  location: {
    address: string;
    coordinates: [number, number];
  };
  hours: {
    [day: string]: {
      breakfast?: { start: string; end: string };
      lunch?: { start: string; end: string };
      dinner?: { start: string; end: string };
      allDay?: { start: string; end: string };
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @var Schema Mongoose schema for restaurant locations
 * @description Database schema with validation, indexes, and operational constraints
 */
const RestaurantSchema = new Schema<IRestaurant>({
  id: { 
    type: String, 
    required: [true, 'Restaurant ID is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Restaurant ID cannot exceed 50 characters']
  },
  
  name: { 
    type: String, 
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxlength: [100, 'Restaurant name cannot exceed 100 characters']
  },
  
  type: { 
    type: String, 
    required: [true, 'Restaurant type is required'],
    enum: {
      values: ['residential', 'boutique'],
      message: 'Restaurant type must be either residential or boutique'
    }
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  location: {
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    coordinates: { 
      type: [Number], 
      index: '2dsphere',
      validate: {
        validator: function(coords: number[]) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90;     // latitude
        },
        message: 'Coordinates must be [longitude, latitude] with valid ranges'
      }
    }
  },
  
  hours: { 
    type: Map, 
    of: Schema.Types.Mixed,
    validate: {
      validator: function(hours: Map<string, any>) {
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        for (const day of hours.keys()) {
          if (!validDays.includes(day.toLowerCase())) {
            return false;
          }
        }
        return true;
      },
      message: 'Hours must use valid day names'
    }
  },
  
  isActive: { 
    type: Boolean, 
    default: true,
    required: [true, 'Active status is required']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/** ==================== @database indexing ==================== */
// idx for restaurant type filtering
RestaurantSchema.index({ type: 1 });

// idx for active restaurant queries  
RestaurantSchema.index({ isActive: 1 });

// idx for geospatial location queries
RestaurantSchema.index({ 'location.coordinates': '2dsphere' });

// text idx for restaurant name searches
RestaurantSchema.index({ 
  name: 'text', 
  description: 'text' 
}, {
  weights: { name: 10, description: 5 },
  name: 'restaurant_text_search'
});

/**
 * @method instance - Check if restaurant is currently open
 * @param currentTime Optional - time to check against (defaults to now)
 * @returns "True" if restaurant is currently open
 */
RestaurantSchema.methods.isCurrentlyOpen = function(currentTime?: Date): boolean {
  const now = currentTime || new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentHours = this.hours.get(dayName);
  
  if (!currentHours || !this.isActive) return false;
  
  const timeString = now.toTimeString().substring(0, 5); // HH:MM format
  
  // Check each meal period
  for (const period of ['breakfast', 'lunch', 'dinner', 'allDay']) {
    const periodHours = currentHours[period];
    if (periodHours && timeString >= periodHours.start && timeString <= periodHours.end) {
      return true;
    }
  }
  
  return false;
};

/**
 * @method instance - Get current meal period being served
 * @param currentTime Optional - time to check against (defaults to now)
 * @returns Current meal period name or null if closed
 */
RestaurantSchema.methods.getCurrentMealPeriod = function(currentTime?: Date): string | null {
  const now = currentTime || new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentHours = this.hours.get(dayName);
  
  if (!currentHours || !this.isActive) return null;
  
  const timeString = now.toTimeString().substring(0, 5);
  
  // Check periods in priority order
  const periods = ['allDay', 'breakfast', 'lunch', 'dinner'];
  
  for (const period of periods) {
    const periodHours = currentHours[period];
    if (periodHours && timeString >= periodHours.start && timeString <= periodHours.end) {
      return period;
    }
  }
  
  return null;
};

/**
 * @method static - Find restaurants by type and active status
 * @param type - Restaurant type filter
 * @param activeOnly Optional - only return active restaurants (default: true)
 * @returns Promise resolving to matching restaurants
 */
RestaurantSchema.statics.findByType = function(
  type: 'residential' | 'boutique',
  activeOnly: boolean = true
) {
  const query: any = { type };
  if (activeOnly) query.isActive = true;
  return this.find(query).sort({ name: 1 });
};

/**
 * @method static - Find restaurants near coordinates
 * @param longitude - Longitude coordinate
 * @param latitude - Latitude coordinate  
 * @param maxDistance Optional - maximum distance in meters (default: 1000)
 * @returns Promise resolving to nearby restaurants
 */
RestaurantSchema.statics.findNearby = function(
  longitude: number,
  latitude: number,
  maxDistance: number = 1000
) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

export default mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);