import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['ongoing', 'upcoming'],
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
  cashbackPercentage: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Advanced', 'Expert'],
    required: true
  },
  entryFee: {
    type: Number,
    required: true
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
    default: 0
  },
  progressText: String,
  icon: {
    type: String,
    default: 'Trophy'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    select: true // Ensures this field is returned in queries
  }
}, { timestamps: true });

export default mongoose.model('Event', EventSchema);