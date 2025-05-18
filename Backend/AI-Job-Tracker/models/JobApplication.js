import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview', 'Offer', 'Rejected', 'Accepted'],
    default: 'Applied'
  },
  coverLetter: {
    type: String
  },
  resume: {
    type: String
  },
  notes: {
    type: String
  },
  nextSteps: {
    type: String
  },
  interviewDate: {
    type: Date
  },
  salary: {
    type: Number
  },
  benefits: {
    type: String
  },
  matchScore: {
    type: Number
  },
  aiSuggestions: {
    type: String
  }
});

// Add indexes for common queries
jobApplicationSchema.index({ userId: 1, status: 1 });
jobApplicationSchema.index({ applicationDate: -1 });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

export default JobApplication; 