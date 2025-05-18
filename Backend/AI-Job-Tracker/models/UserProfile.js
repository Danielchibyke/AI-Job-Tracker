import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  skills: [{
    type: String
  }],
  experience: [{
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    graduationYear: Number,
    field: String
  }],
  preferences: {
    jobTypes: [{
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid']
    }],
    locations: [{
      type: String
    }],
    salaryRange: {
      min: Number,
      max: Number
    },
    industries: [{
      type: String
    }]
  },
  resume: {
    content: String,
    lastUpdated: Date
  },
  coverLetter: {
    content: String,
    lastUpdated: Date
  },
  jobSearchHistory: [{
    query: String,
    date: Date
  }],
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobApplication'
  }],
  aiPreferences: {
    jobMatchingThreshold: {
      type: Number,
      default: 70
    },
    autoApply: {
      type: Boolean,
      default: false
    },
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  }
});

// Add indexes for common queries
userProfileSchema.index({ userId: 1 });
userProfileSchema.index({ 'preferences.jobTypes': 1 });
userProfileSchema.index({ 'preferences.locations': 1 });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

export default UserProfile; 