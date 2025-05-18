import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true
  },
  appliedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  salary: {
    type: String,
    trim: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Add indexes for common queries
jobSchema.index({ title: 'text', company: 'text', location: 'text' });
jobSchema.index({ status: 1, postedDate: -1 });

export const Job = mongoose.model('Job', jobSchema);