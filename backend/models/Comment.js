const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Comment author is required']
    },
    idea: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Idea',
        required: [true, 'Idea reference is required']
    },
    // Reply system (nested comments)
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    // Voting on comments
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
        default: 0
    },
    // Comment status
    isEdited: {
        type: Boolean,
        default: false
    },
    editHistory: [{
        content: String,
        editedAt: {
            type: Date,
            default: Date.now
        }
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    // AI Analysis for toxic comments
    aiModeration: {
        isAnalyzed: {
            type: Boolean,
            default: false
        },
        toxicityScore: {
            type: Number,
            min: 0,
            max: 100,
            default: null
        },
        sentiment: {
            type: String,
            enum: ['positive', 'neutral', 'negative'],
            default: null
        },
        flagged: {
            type: Boolean,
            default: false
        },
        flagReason: {
            type: String,
            default: null
        },
        analyzedAt: {
            type: Date,
            default: null
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
commentSchema.index({ idea: 1, createdAt: -1 });
commentSchema.index({ author: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ totalScore: -1 });
commentSchema.index({ isDeleted: 1, createdAt: -1 });

// Pre-save middleware to calculate vote totals
commentSchema.pre('save', function(next) {
    if (this.isModified('votes')) {
        this.totalUpvotes = this.votes.filter(vote => vote.type === 'upvote').length;
        this.totalDownvotes = this.votes.filter(vote => vote.type === 'downvote').length;
        this.totalScore = this.totalUpvotes - this.totalDownvotes;
    }
    next();
});

// Method to check if user has voted on comment
commentSchema.methods.hasUserVoted = function(userId) {
    return this.votes.some(vote => vote.user.toString() === userId.toString());
};

// Method to get user's vote type on comment
commentSchema.methods.getUserVoteType = function(userId) {
    const vote = this.votes.find(vote => vote.user.toString() === userId.toString());
    return vote ? vote.type : null;
};

// Method to soft delete comment
commentSchema.methods.softDelete = function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.content = '[This comment has been deleted]';
    return this.save();
};

// Static method to find comments for an idea
commentSchema.statics.findByIdea = function(ideaId, options = {}) {
    const { includeDeleted = false, limit = 20, sort = { createdAt: -1 } } = options;
    
    const query = { idea: ideaId };
    if (!includeDeleted) {
        query.isDeleted = false;
    }
    
    return this.find(query)
        .populate('author', 'username firstName lastName avatar')
        .populate('replies')
        .sort(sort)
        .limit(limit);
};

// Static method to find top-level comments (not replies)
commentSchema.statics.findTopLevel = function(ideaId, options = {}) {
    const { limit = 20, sort = { totalScore: -1, createdAt: -1 } } = options;
    
    return this.find({
        idea: ideaId,
        parentComment: null,
        isDeleted: false
    })
    .populate('author', 'username firstName lastName avatar')
    .populate({
        path: 'replies',
        populate: {
            path: 'author',
            select: 'username firstName lastName avatar'
        }
    })
    .sort(sort)
    .limit(limit);
};

// Post-save middleware to update idea's comment count
commentSchema.post('save', async function() {
    if (this.isNew && !this.isDeleted) {
        await mongoose.model('Idea').findByIdAndUpdate(
            this.idea,
            { $inc: { totalComments: 1 } }
        );
    }
});

// Post-remove middleware to update idea's comment count
commentSchema.post('remove', async function() {
    await mongoose.model('Idea').findByIdAndUpdate(
        this.idea,
        { $inc: { totalComments: -1 } }
    );
});

module.exports = mongoose.model('Comment', commentSchema);