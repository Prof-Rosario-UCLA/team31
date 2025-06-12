/**
 * @fileoverview User session data model implementation
 * @description Defines anonymous user sessions with diet preferences and recommendations`
 * @todo Add geolocation history tracking
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * @interface UserSession document interface  
 * @description Anonymous user session with diet choice and last saved recommendations
 * @extends Document-Mongoose document interface
 */
export interface IUserSession extends Document {
  sessionId: string;
  dietChoice: 'cutting' | 'bulking';
  lastVisit: Date;
  savedRecommendations: {
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
    timestamp: Date;
  };
  userLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  visitHistory: Array<{
    timestamp: Date;
    dietChoice: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @var Schema Mongoose schema for user sessions
 * @description Database schema for anonymous session tracking and recommendations
 */
const UserSessionSchema = new Schema<IUserSession>({
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    unique: true,
    trim: true,
    index: true,
    maxlength: [128, 'Session ID cannot exceed 128 characters']
  },
  
  dietChoice: {
    type: String,
    required: [true, 'Diet choice is required'],
    enum: {
      values: ['cutting', 'bulking'],
      message: 'Diet choice must be cutting or bulking'
    }
  },
  
  lastVisit: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  savedRecommendations: {
    restaurants: [{
      name: {
        type: String,
        required: true
      },
      displayName: {
        type: String,
        required: true
      },
      avgProteinCalorieRatio: {
        type: Number,
        required: true,
        min: [0, 'Ratio cannot be negative']
      },
      itemCount: {
        type: Number,
        required: true,
        min: [0, 'Item count cannot be negative']
      },
      qualityItemCount: {
        type: Number,
        required: true,
        min: [0, 'Quality item count cannot be negative']
      },
      distance: {
        type: Number,
        default: 0,
        min: [0, 'Distance cannot be negative']
      },
      caloriesBurned: {
        type: Number,
        default: 0,
        min: [0, 'Calories burned cannot be negative']
      }
    }],
    
    topFoods: [{
      name: {
        type: String,
        required: true,
        maxlength: [200, 'Food name cannot exceed 200 characters']
      },
      restaurant: {
        type: String,
        required: true
      },
      restaurantDisplayName: {
        type: String,
        required: true
      },
      proteinCalorieRatio: {
        type: Number,
        required: true,
        min: [0, 'P/C ratio cannot be negative']
      },
      calories: {
        type: Number,
        required: true,
        min: [0, 'Calories cannot be negative']
      },
      protein: {
        type: Number,
        required: true,
        min: [0, 'Protein cannot be negative']
      },
      servingSize: {
        type: String,
        required: true
      }
    }],
    
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  
  userLocation: {
    lat: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  
  visitHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    dietChoice: {
      type: String,
      enum: ['cutting', 'bulking']
    }
  }]
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive internal fields
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

/** ==================== @database indexing ==================== */

// Index for session lookup
UserSessionSchema.index({ sessionId: 1 }, { unique: true });

// Index for cleanup of old sessions
UserSessionSchema.index({ lastVisit: 1 });

// Index for analytics
UserSessionSchema.index({ dietChoice: 1, createdAt: -1 });

// Compound index for location-based queries
UserSessionSchema.index({ 'userLocation.lat': 1, 'userLocation.lng': 1 });

/** ==================== @instance methods ==================== */

/**
 * @method (instance) - Check if session is expired (30 days)
 * @returns "True" if session is older than 30 days
 */
UserSessionSchema.methods.isExpired = function(): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.lastVisit < thirtyDaysAgo;
};

/**
 * @method (instance) - Update visit history
 * @param dietChoice - Current diet choice
 * @returns Promise resolving to updated session
 */
UserSessionSchema.methods.recordVisit = function(dietChoice: string) {
  this.lastVisit = new Date();
  this.dietChoice = dietChoice;
  
  // Keep only last 10 visits
  this.visitHistory.push({
    timestamp: new Date(),
    dietChoice
  });
  
  if (this.visitHistory.length > 10) {
    this.visitHistory = this.visitHistory.slice(-10);
  }
  
  return this.save();
};

/**
 * @method (instance) - Get recommendation age in minutes
 * @returns Age of recommendations in minutes
 */
UserSessionSchema.methods.getRecommendationAge = function(): number {
  if (!this.savedRecommendations?.timestamp) return Infinity;
  
  const now = new Date();
  const recTime = new Date(this.savedRecommendations.timestamp);
  return Math.floor((now.getTime() - recTime.getTime()) / 60000);
};

/** ==================== @static methods ==================== */

/**
 * @method (static) - Find or create session
 * @param sessionId - Session identifier from cookie
 * @returns Promise resolving to session document
 */
UserSessionSchema.statics.findOrCreateSession = async function(sessionId: string) {
  let session = await this.findOne({ sessionId });
  
  if (!session) {
    session = new this({
      sessionId,
      dietChoice: 'cutting', // Default choice
      visitHistory: []
    });
    await session.save();
  }
  
  return session;
};

/**
 * @method (static) - Clean up expired sessions
 * @returns Promise resolving to number of deleted sessions
 */
UserSessionSchema.statics.cleanupExpiredSessions = async function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const result = await this.deleteMany({
    lastVisit: { $lt: thirtyDaysAgo }
  });
  
  return result.deletedCount;
};

/**
 * @method (static) - Get diet choice statistics
 * @returns Promise resolving to diet choice counts
 */
UserSessionSchema.statics.getDietChoiceStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: '$dietChoice',
        count: { $sum: 1 },
        avgVisitsPerUser: { $avg: { $size: '$visitHistory' } }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

export default mongoose.model<IUserSession>('UserSession', UserSessionSchema);