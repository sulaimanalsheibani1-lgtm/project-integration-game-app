import mongoose from 'mongoose';

const scenarioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Scenario title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Scenario description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['wedding', 'corporate-event', 'software-development', 'construction', 'marketing-campaign'],
    required: [true, 'Category is required']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [300, 'Duration cannot exceed 300 minutes']
  },
  maxTeams: {
    type: Number,
    default: 4,
    min: [1, 'Must support at least 1 team'],
    max: [8, 'Cannot support more than 8 teams']
  },
  learningObjectives: [{
    type: String,
    required: true,
    trim: true
  }],
  gameSettings: {
    initialBudget: {
      min: { type: Number, default: 15000 },
      max: { type: Number, default: 50000 },
      default: { type: Number, default: 25000 }
    },
    timeframe: {
      min: { type: Number, default: 30 }, // in days
      max: { type: Number, default: 365 },
      default: { type: Number, default: 90 }
    },
    resources: [{
      id: String,
      name: String,
      type: String,
      basePrice: Number,
      qualityLevels: [{
        level: String,
        multiplier: Number,
        description: String
      }],
      availability: {
        type: String,
        enum: ['always', 'limited', 'seasonal'],
        default: 'always'
      },
      requirements: [String]
    }],
    milestones: [{
      id: String,
      title: String,
      description: String,
      daysFromStart: Number,
      weight: Number, // importance for scoring
      dependencies: [String]
    }],
    constraints: [{
      type: String,
      description: String,
      impact: String
    }]
  },
  disruptionCards: [{
    id: String,
    title: String,
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    category: String,
    triggerConditions: {
      phase: [String],
      budgetThreshold: Number,
      timeRemaining: Number,
      random: { type: Boolean, default: true }
    },
    effects: {
      budget: Number,
      timeline: Number, // in days
      quality: Number,
      teamMorale: Number,
      resources: [String] // affected resource IDs
    },
    responseOptions: [{
      id: String,
      title: String,
      description: String,
      cost: Number,
      timeImpact: Number,
      effectiveness: Number
    }],
    frequency: {
      type: String,
      enum: ['once', 'repeatable'],
      default: 'once'
    }
  }],
  decisions: [{
    id: String,
    title: String,
    description: String,
    phase: String, // 'planning', 'execution', 'any'
    options: [{
      id: String,
      title: String,
      description: String,
      consequences: {
        budget: Number,
        timeline: Number,
        quality: Number,
        risk: Number
      },
      requirements: [String]
    }],
    isRequired: { type: Boolean, default: false },
    timeLimit: Number // in minutes
  }],
  scoringCriteria: {
    budgetWeight: { type: Number, default: 0.25 },
    timelineWeight: { type: Number, default: 0.25 },
    qualityWeight: { type: Number, default: 0.25 },
    teamworkWeight: { type: Number, default: 0.15 },
    crisisWeight: { type: Number, default: 0.10 }
  },
  narratives: {
    intro: String,
    phases: {
      planning: String,
      execution: String,
      review: String
    },
    endings: [{
      condition: String,
      title: String,
      description: String
    }]
  },
  assets: {
    images: [String],
    videos: [String],
    documents: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  playCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Index for better performance
scenarioSchema.index({ category: 1, difficulty: 1, isActive: 1 });
scenarioSchema.index({ createdBy: 1 });
scenarioSchema.index({ tags: 1 });

// Add rating
scenarioSchema.methods.addRating = function(userId, rating, review) {
  // Remove existing rating from this user
  this.ratings = this.ratings.filter(r => r.userId.toString() !== userId.toString());
  
  // Add new rating
  this.ratings.push({ userId, rating, review });
  
  // Recalculate average rating
  const totalRating = this.ratings.reduce((sum, r) => sum + r.rating, 0);
  this.averageRating = Number((totalRating / this.ratings.length).toFixed(1));
  
  return this.save();
};

// Increment play count
scenarioSchema.methods.incrementPlayCount = function() {
  this.playCount += 1;
  return this.save();
};

// Virtual for total ratings count
scenarioSchema.virtual('ratingsCount').get(function() {
  return this.ratings.length;
});

scenarioSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Scenario', scenarioSchema);