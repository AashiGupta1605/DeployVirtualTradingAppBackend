import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['ongoing', 'upcoming', 'completed'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  participants: {
    type: Number,
    default: 0
  },
  prize: {
    type: String,
    required: true
  },
  prizeBreakdown: [{
    position: String,
    reward: String
  }],
  rewardTiers: [{
    tier: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  cashbackPercentage: {
    type: Number,
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  entryFee: {
    type: Number,
    default: 0
  },
  rewards: [String],
  backgroundColor: {
    type: String,
    default: 'bg-gradient-to-br from-blue-50 to-blue-100'
  },
  highlight: String,
  requirements: String,
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  progressText: String,
  icon: {
    type: String,
    default: 'Trophy'
  },
  coverImage: String,
  location: String,
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  maxParticipants: Number,
  registrationDeadline: Date,
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

EventSchema.index({ title: 'text', description: 'text' });
EventSchema.index({ startDate: 1 });
EventSchema.index({ endDate: 1 });
EventSchema.index({ isActive: 1, isDeleted: 1 });

export default mongoose.model('Event', EventSchema);