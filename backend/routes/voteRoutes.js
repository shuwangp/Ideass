const express = require('express');
const router = express.Router();
const Vote = require('../models/vote');
const Idea = require('../models/Idea');

// GET votes (ตรวจสอบ route)
router.get('/', async (req, res) => {
  try {
    const votes = await Vote.find().populate('user', 'username firstName lastName avatar').populate('idea', 'title');
    res.json(votes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST vote an idea
router.post('/', async (req, res) => {
  const { userId, ideaId, type } = req.body; // type = 'upvote' or 'downvote'
  
  try {
    // ตรวจสอบว่ามีโหวตก่อนหน้านี้หรือไม่
    let vote = await Vote.findOne({ user: userId, idea: ideaId });
    
    if (vote) {
      vote.type = type; // เปลี่ยน type ถ้ามี
      vote.votedAt = new Date();
    } else {
      vote = new Vote({ user: userId, idea: ideaId, type });
    }
    
    await vote.save();
    
    // อัปเดตคะแนนไอเดีย
    const votes = await Vote.find({ idea: ideaId });
    const upvotes = votes.filter(v => v.type === 'upvote').length;
    const downvotes = votes.filter(v => v.type === 'downvote').length;
    const totalScore = upvotes - downvotes;
    
    await Idea.findByIdAndUpdate(ideaId, { totalUpvotes: upvotes, totalDownvotes: downvotes, totalScore });
    
    res.json({ message: 'Vote recorded', vote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update vote type (เพิ่มใหม่)
router.put('/:id', async (req, res) => {
  const { type } = req.body; // 'upvote' or 'downvote'
  
  try {
    const vote = await Vote.findById(req.params.id);
    if (!vote) return res.status(404).json({ message: 'Vote not found' });
    
    // บันทึก type เก่าเพื่อเปรียบเทียบ
    const oldType = vote.type;
    
    // อัปเดต vote
    vote.type = type;
    vote.votedAt = new Date();
    await vote.save();
    
    // อัปเดตคะแนนไอเดียเฉพาะเมื่อ type เปลี่ยน
    if (oldType !== type) {
      const votes = await Vote.find({ idea: vote.idea });
      const upvotes = votes.filter(v => v.type === 'upvote').length;
      const downvotes = votes.filter(v => v.type === 'downvote').length;
      const totalScore = upvotes - downvotes;
      
      await Idea.findByIdAndUpdate(vote.idea, { 
        totalUpvotes: upvotes, 
        totalDownvotes: downvotes, 
        totalScore 
      });
    }
    
    res.json({ message: 'Vote updated', vote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET votes of an idea
router.get('/idea/:ideaId', async (req, res) => {
  try {
    const votes = await Vote.find({ idea: req.params.ideaId }).populate('user', 'username firstName lastName avatar');
    res.json(votes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE vote
router.delete('/:id', async (req, res) => {
  try {
    const vote = await Vote.findByIdAndDelete(req.params.id);
    if (!vote) return res.status(404).json({ message: 'Vote not found' });
    
    // อัปเดตคะแนนไอเดียหลังลบ
    const votes = await Vote.find({ idea: vote.idea });
    const upvotes = votes.filter(v => v.type === 'upvote').length;
    const downvotes = votes.filter(v => v.type === 'downvote').length;
    const totalScore = upvotes - downvotes;
    
    await Idea.findByIdAndUpdate(vote.idea, { totalUpvotes: upvotes, totalDownvotes: downvotes, totalScore });
    
    res.json({ message: 'Vote deleted', vote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;