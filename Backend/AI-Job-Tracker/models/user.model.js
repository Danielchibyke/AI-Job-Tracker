import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    smartAutomationEnabled: {
        type: Boolean,
        default: false
    },
    profile: {
        title: String,
        bio: String,
        location: String,
        phone: String,
        website: String,
        linkedin: String,
        github: String,
        avatar: {
            data: Buffer,
            contentType: String
        }
    },
    resume: {
        url: String,
        lastUpdated: Date,
        skills: [String],
        experience: [{
            title: String,
            company: String,
            location: String,
            startDate: Date,
            endDate: Date,
            current: Boolean,
            description: String
        }],
        education: [{
            school: String,
            degree: String,
            field: String,
            startDate: Date,
            endDate: Date,
            current: Boolean,
            description: String
        }],
        certifications: [{
            name: String,
            issuer: String,
            date: Date,
            expiryDate: Date,
            credentialId: String
        }],
        resumeText: String,
        aiAnalysis: mongoose.Schema.Types.Mixed
    },
    preferences: {
        jobTypes: [{
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'internship', 'remote']
        }],
        locations: [String],
        salaryRange: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: 'USD'
            }
        },
        industries: [String],
        skills: [String],
        notificationSettings: {
            email: {
                newJobs: { type: Boolean, default: true },
                applicationUpdates: { type: Boolean, default: true },
                interviewReminders: { type: Boolean, default: true }
            },
            push: {
                newJobs: { type: Boolean, default: true },
                applicationUpdates: { type: Boolean, default: true },
                interviewReminders: { type: Boolean, default: true }
            }
        }
    },
    aiProfile: {
        skillMatchScore: Number,
        recommendedSkills: [String],
        missingSkills: [String],
        careerPath: [{
            role: String,
            requiredSkills: [String],
            estimatedTime: Number,
            certifications: [String],
            sideProjects: [String],
            networkingActions: [String]
        }],
        learningResources: [Object]
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    lastLogin: Date,
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.verificationToken;
    delete userObject.resetPasswordToken;
    delete userObject.resetPasswordExpires;
    return userObject;
};

// Add indexes
userSchema.index({ email: 1 });
userSchema.index({ 'preferences.jobTypes': 1 });
userSchema.index({ 'preferences.skills': 1 });
const User = mongoose.model('User', userSchema);

export default User;