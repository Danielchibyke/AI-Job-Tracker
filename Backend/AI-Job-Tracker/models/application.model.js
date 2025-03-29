import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    jobId: {type: mongoose.Schema.Types.ObjectId, ref: 'Job'},
    status: { type: String, enum: ['Applied', 'Interview Scheduled', 'Rejected', 'Pening' ], default: 'Pending' },

});

export const Application = mongoose.model('application', ApplicationSchema);