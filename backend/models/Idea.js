const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Idea title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Idea description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
       enum: [
            'Technology',
            'Business',
            'Marketing',
            'Product',
            'Process Improvement',
            'Cost Reduction',
            'Innovation',
            'Sustainability',
            'Other'
        ]
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters']
    }],
    author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'implemented'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    // Voting system
    votes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: ['upvote', 'downvote'],
            required: true
        },
        votedAt: {
            type: Date,
            default: Date.now
        }
    }],
    totalUpvotes: {
        type: Number,
        default: 0
    },
    totalDownvotes: {
        type: Number,
        default: 0
    },
    totalScore: {
        type: Number,
        default: 0 // upvotes - downvotes
    },
    // Comments count
    totalComments: {
        type: Number,
        default: 0
    },
    // AI Analysis
    aiAnalysis: {
        sentiment: {
            type: String,
            enum: ['positive', 'neutral', 'negative'],
            default: null
        },
        feasibilityScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },
        innovationScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },
        impactScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },
        overallScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },
        keyInsights: [{
            type: String,
            maxlength: [300, 'Insight cannot exceed 300 characters']
        }],
        suggestedImprovements: [{
            type: String,
            maxlength: [300, 'Suggestion cannot exceed 300 characters']
        }],
        analysisDate: {
            type: Date,
            default: null
        }
    },
    // Metadata
    isPublic: {
        type: Boolean,
        default: true
    },
    implementationDate: {
        type: Date,
        default: null
    },
    estimatedCost: {
        type: Number,
        default: null
    },
    estimatedROI: {
        type: Number,
        default: null
    },
    attachments: [{
        filename: String,
        url: String,
        size: Number,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
ideaSchema.index({ author: 1, createdAt: -1 });
ideaSchema.index({ category: 1, status: 1 });
ideaSchema.index({ totalScore: -1 });
ideaSchema.index({ createdAt: -1 });
ideaSchema.index({ tags: 1 });
ideaSchema.index({ 'aiAnalysis.overallScore': -1 });

// Text search index
ideaSchema.index({
    title: 'text',
    description: 'text',
    tags: 'text'
});

// Virtual for vote percentage
ideaSchema.virtual('upvotePercentage').get(function() {
    const totalVotes = this.totalUpvotes + this.totalDownvotes;
    if (totalVotes === 0) return 0;
    return Math.round((this.totalUpvotes / totalVotes) * 100);
});

// Pre-save middleware to calculate vote totals
ideaSchema.pre('save', function(next) {
    if (this.isModified('votes')) {
        this.totalUpvotes = this.votes.filter(vote => vote.type === 'upvote').length;
        this.totalDownvotes = this.votes.filter(vote => vote.type === 'downvote').length;
        this.totalScore = this.totalUpvotes - this.totalDownvotes;
    }
    next();
});

// Method to check if user has voted
ideaSchema.methods.hasUserVoted = function(userId) {
    return this.votes.some(vote => vote.user.toString() === userId.toString());
};

// Method to get user's vote type
ideaSchema.methods.getUserVoteType = function(userId) {
        const vote = this.votes.find(vote => vote.user.toString() === userId.toString());
        return vote ? vote.type : null;
};

// Static method to find popular ideas
ideaSchema.statics.findPopular = function(limit = 10) {
    return this.find({ isPublic: true, status: { $ne: 'rejected' } })
        .sort({ totalScore: -1 })
        .limit(limit)
        .populate('author', 'username firstName lastName avatar');
};

// Static method to find recent ideas
ideaSchema.statics.findRecent = function(limit = 10) {
    return this.find({ isPublic: true, status: { $ne: 'rejected' } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('author', 'username firstName lastName avatar');
};

module.exports = mongoose.model('Idea', ideaSchema);