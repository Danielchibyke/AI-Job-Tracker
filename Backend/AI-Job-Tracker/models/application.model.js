import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'interview', 'rejected', 'accepted', 'withdrawn'],
        default: 'pending'
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    notes: [{
        content: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    interviewDates: [{
        date: Date,
        type: {
            type: String,
            enum: ['phone', 'technical', 'onsite', 'final']
        },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled']
        }
    }],
    feedback: {
        type: String
    }
}, {
    timestamps: true
});

// Add indexes for common queries
applicationSchema.index({ userId: 1, status: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ appliedDate: -1 });

export const Application = mongoose.model('Application', applicationSchema);