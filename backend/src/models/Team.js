import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [50, 'Team name cannot exceed 50 characters']
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: [true, 'Game ID is required']
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['leader', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  color: {
    type: String,
    default: '#3B82F6' // Blue
  },
  avatar: {
    type: String,
    default: null
  },
  gameData: {
    budget: {
      total: { type: Number, default: 25000 },
      spent: { type: Number, default: 0 },
      remaining: { type: Number, default: 25000 },
      allocations: [{
        category: String,
        amount: Number,
        timestamp: { type: Date, default: Date.now }
      }]
    },
    timeline: {
      startDate: Date,
      endDate: Date,
      milestones: [{
        id: String,
        title: String,
        dueDate: Date,
        completed: { type: Boolean, default: false },
        completedAt: Date
      }],
      currentPhase: {
        type: String,
        default: 'planning'
      }
    },
    resources: [{
      id: String,
      name: String,
      type: String, // 'vendor', 'venue', 'equipment', etc.
      cost: Number,
      quality: Number,
      availability: Boolean,
      bookedAt: Date
    }],
    decisions: [{
      id: String,
      title: String,
      description: String,
      options: [String],
      selectedOption: String,
      impact: mongoose.Schema.Types.Mixed,
      madeAt: { type: Date, default: Date.now },
      madeBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    disruptions: [{
      cardId: String,
      title: String,
      description: String,
      effect: mongoose.Schema.Types.Mixed,
      response: String,
      handledAt: Date,
      handledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  score: {
    current: { type: Number, default: 0 },
    breakdown: {
      budget: { type: Number, default: 0 },
      timeline: { type: Number, default: 0 },
      quality: { type: Number, default: 0 },
      teamwork: { type: Number, default: 0 },
      crisis: { type: Number, default: 0 }
    },
    history: [{
      round: Number,
      score: Number,
      reason: String,
      timestamp: { type: Date, default: Date.now }
    }]
  },
  status: {
    type: String,
    enum: ['active', 'eliminated', 'completed'],
    default: 'active'
  },
  communication: [{
    type: {
      type: String,
      enum: ['chat', 'decision', 'vote', 'announcement'],
      required: true
    },
    message: String,
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Index for better performance
teamSchema.index({ gameId: 1, createdAt: -1 });
teamSchema.index({ 'members.userId': 1 });

// Add member to team
teamSchema.methods.addMember = function(userId, role = 'member') {
  // Check if user is already a member
  const existingMember = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.members.push({ userId, role });
    return this.save();
  }
  
  throw new Error('User is already a member of this team');
};

// Remove member from team
teamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.userId.toString() !== userId.toString()
  );
  return this.save();
};

// Update score
teamSchema.methods.updateScore = function(category, points, reason) {
  if (this.score.breakdown[category] !== undefined) {
    this.score.breakdown[category] += points;
  }
  
  // Recalculate total score
  this.score.current = Object.values(this.score.breakdown).reduce((sum, score) => sum + score, 0);
  
  // Add to history
  this.score.history.push({
    round: this.score.history.length + 1,
    score: points,
    reason
  });
  
  return this.save();
};

// Add communication message
teamSchema.methods.addMessage = function(type, message, fromUserId, metadata = null) {
  this.communication.push({
    type,
    message,
    fromUserId,
    metadata
  });
  return this.save();
};

// Virtual for team leader
teamSchema.virtual('leader').get(function() {
  const leader = this.members.find(member => member.role === 'leader');
  return leader ? leader.userId : null;
});

// Virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for budget utilization percentage
teamSchema.virtual('budgetUtilization').get(function() {
  if (this.gameData.budget.total === 0) return 0;
  return Math.round((this.gameData.budget.spent / this.gameData.budget.total) * 100);
});

teamSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Team', teamSchema);