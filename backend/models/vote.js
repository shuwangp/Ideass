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

module.exports = mongoose.model('Vote', voteSchema);
