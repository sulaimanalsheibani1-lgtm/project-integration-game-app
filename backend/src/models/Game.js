import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Game title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  scenarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario',
    required: [true, 'Scenario is required']
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Host is required']
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  maxTeams: {
    type: Number,
    default: 4,
    min: [1, 'Must have at least 1 team'],
    max: [8, 'Cannot exceed 8 teams']
  },
  maxPlayersPerTeam: {
    type: Number,
    default: 4,
    min: [1, 'Must have at least 1 player per team'],
    max: [6, 'Cannot exceed 6 players per team']
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'paused', 'completed', 'cancelled'],
    default: 'waiting'
  },
  phase: {
    type: String,
    enum: ['setup', 'planning', 'execution', 'review'],
    default: 'setup'
  },
  settings: {
    duration: {
      type: Number, // in minutes
      default: 60,
      min: [15, 'Game must be at least 15 minutes'],
      max: [300, 'Game cannot exceed 300 minutes']
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    allowSpectators: {
      type: Boolean,
      default: true
    },
    disruptionFrequency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    customRules: [String]
  },
  gameState: {
    currentRound: { type: Number, default: 1 },
    totalRounds: { type: Number, default: 5 },
    roundTimeRemaining: Number,
    lastAction: {
      timestamp: Date,
      action: String,
      teamId: mongoose.Schema.Types.ObjectId
    }
  },
  disruptionCards: [{
    cardId: String,
    title: String,
    description: String,
    effect: mongoose.Schema.Types.Mixed,
    triggeredAt: Date,
    affectedTeams: [mongoose.Schema.Types.ObjectId],
    resolved: { type: Boolean, default: false }
  }],
  timeline: [{
    timestamp: { type: Date, default: Date.now },
    event: String,
    details: mongoose.Schema.Types.Mixed,
    teamId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId
  }],
  results: {
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    finalScores: [{
      teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
      score: Number,
      breakdown: {
        budget: Number,
        timeline: Number,
        quality: Number,
        teamwork: Number,
        crisis: Number
      }
    }],
    completedAt: Date,
    totalDuration: Number // in minutes
  },
  startedAt: Date,
  endedAt: Date,
  isPrivate: {
    type: Boolean,
    default: false
  },
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Index for better performance
gameSchema.index({ hostId: 1, status: 1, createdAt: -1 });
gameSchema.index({ inviteCode: 1 }, { sparse: true });

// Generate invite code
gameSchema.methods.generateInviteCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.inviteCode = code;
  return code;
};

// Add timeline event
gameSchema.methods.addTimelineEvent = function(event, details, teamId, userId) {
  this.timeline.push({
    timestamp: new Date(),
    event,
    details,
    teamId,
    userId
  });
  return this.save();
};

// Check if game is full
gameSchema.methods.isFull = function() {
  return this.teams.length >= this.maxTeams;
};

// Virtual for current players count
gameSchema.virtual('currentPlayersCount').get(function() {
  return this.teams.reduce((total, team) => total + (team.members ? team.members.length : 0), 0);
});

// Virtual for game duration
gameSchema.virtual('duration').get(function() {
  if (this.startedAt && this.endedAt) {
    return Math.round((this.endedAt - this.startedAt) / (1000 * 60)); // in minutes
  }
  return null;
});

gameSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Game', gameSchema);