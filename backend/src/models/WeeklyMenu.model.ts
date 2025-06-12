// src/models/WeeklyMenu.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IWeeklyMenu extends Document {
  restaurant: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  mealPeriods: {
    breakfast?: {
      [station: string]: string[]; // station -> recipeIds
    };
    lunch?: {
      [station: string]: string[];
    };
    dinner?: {
      [station: string]: string[];
    };
    lateNight?: {
      [station: string]: string[];
    };
  };
  lastUpdated: Date;
}

const WeeklyMenuSchema = new Schema<IWeeklyMenu>({
  restaurant: {
    type: String,
    required: true,
    index: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
    index: true
  },
  mealPeriods: {
    type: Schema.Types.Mixed,
    default: {}
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient lookups
WeeklyMenuSchema.index({ restaurant: 1, dayOfWeek: 1 }, { unique: true });

export default mongoose.model<IWeeklyMenu>('WeeklyMenu', WeeklyMenuSchema);