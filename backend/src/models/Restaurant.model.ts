import mongoose, { Document, Schema } from 'mongoose';

// ########## IMPLEMENTATION START HERE ################
export interface IRestaurant extends Document {
  name: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  hours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
  isOpen: boolean;
  mealPeriods: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurant>({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    unique: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function(v: number[]) {
          return v.length === 2;
        },
        message: 'Coordinates must be [longitude, latitude]',
      },
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
  },
  hours: {
    type: Map,
    of: {
      open: String,
      close: String,
    },
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
  mealPeriods: [{
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'late-night'],
  }],
}, {
  timestamps: true,
});

// Create geospatial index
RestaurantSchema.index({ location: '2dsphere' });
// ########## IMPLEMENTATION END HERE ################

export default mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);