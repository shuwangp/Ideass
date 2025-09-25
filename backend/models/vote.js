const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    idea: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Idea',
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
});

// Index เพื่อป้องกัน user โหวตซ้ำไอเดียเดียวกัน
voteSchema.index({ user: 1, idea: 1 }, { unique: true });

// Post-remove middleware to update idea's vote counts
voteSchema.post('remove', async function() {
    const Idea = mongoose.model('Idea');
    const ideaId = this.idea;
    
    // คำนวณ votes ใหม่
    const votes = await mongoose.model('Vote').find({ idea: ideaId });
    const upvotes = votes.filter(v => v.type === 'upvote').length;
    const downvotes = votes.filter(v => v.type === 'downvote').length;
    const totalScore = upvotes - downvotes;
    
    // อัปเดตไอเดีย
    await Idea.findByIdAndUpdate(ideaId, {
        totalUpvotes: upvotes,
        totalDownvotes: downvotes,
        totalScore: totalScore
    });
});

module.exports = mongoose.model('Vote', voteSchema);
