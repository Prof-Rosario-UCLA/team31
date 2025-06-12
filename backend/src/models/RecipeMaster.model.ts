// src/models/RecipeMaster.model.ts
import mongoose, { Document, Schema } from 'mongoose';
import { DietaryTag } from './MenuItem.model';

export interface IRecipeMaster extends Document {
  recipeId: string;
  name: string;
  servingSize: string;
  servingSizeOz: number;
  nutrition: {
    calories: number;
    protein: number;
    totalFat: number;
    saturatedFat: number;
    cholesterol: number;
    sodium: number;
    totalCarbs: number;
    dietaryFiber: number;
    sugars: number;
    calcium?: number;
    iron?: number;
    potassium?: number;
  };
  dietaryTags: DietaryTag[];
  lastUpdated: Date;
}


const RecipeMasterSchema = new Schema<IRecipeMaster>({
  recipeId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  servingSize: {
    type: String,
    required: true
  },
  servingSizeOz: {
    type: Number,
    required: true,
    min: 0
  },
  nutrition: {
    calories: { type: Number, required: true, min: 0 },
    totalFat: { type: Number, required: true, min: 0 },
    saturatedFat: { type: Number, required: true, min: 0 },
    transFat: { type: Number, default: 0, min: 0 },
    cholesterol: { type: Number, required: true, min: 0 },
    sodium: { type: Number, required: true, min: 0 },
    totalCarbs: { type: Number, required: true, min: 0 },
    dietaryFiber: { type: Number, required: true, min: 0 },
    sugars: { type: Number, required: true, min: 0 },
    addedSugars: { type: Number, default: 0, min: 0 },
    protein: { type: Number, required: true, min: 0 },
    vitaminD: { type: Number, min: 0 },
    calcium: { type: Number, min: 0 },
    iron: { type: Number, min: 0 },
    potassium: { type: Number, min: 0 }
  },
  dietaryTags: [{
    type: String,
    enum: [
      'vegan', 'vegetarian', 'low-carbon', 'halal',
      'contains-gluten', 'contains-wheat', 'contains-dairy',
      'contains-eggs', 'contains-soy', 'contains-nuts', 
      'contains-peanuts', 'contains-fish', 'contains-shellfish',
      'contains-sesame', 'contains-alcohol', 'high-carbon'
    ]
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

RecipeMasterSchema.index({ name: 'text' });

export default mongoose.model<IRecipeMaster>('RecipeMaster', RecipeMasterSchema);