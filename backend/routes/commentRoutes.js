const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { authenticateToken } = require('../middleware/auth');

// CREATE new comment
router.post('/', authenticateToken, async (req, res) => {
  const { content, author, idea, parentComment } = req.body;
  const comment = new Comment({ content, author: req.user._id, idea, parentComment });
  
  try {
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// READ comments by idea
router.get('/idea/:ideaId', async (req, res) => {
  try {
    const comments = await Comment.findByIdea(req.params.ideaId);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ replies of a specific comment (เพิ่มใหม่)
router.get('/:id/replies', async (req, res) => {
  try {
    const replies = await Comment.find({ 
      parentComment: req.params.id,
      isDeleted: false 
    })
    .populate('author', 'username firstName lastName avatar')
    .sort({ createdAt: 1 }); // เรียงจากเก่าไปใหม่
    
    res.json(replies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ all comments
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('author', 'username firstName lastName avatar')
      .populate('replies')
      .sort({ createdAt: -1 }); // คอมเมนต์ล่าสุดขึ้นก่อน
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// READ single comment by ID
router.get('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar')
      .populate('replies');
    
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE comment content
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only author can edit
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    if (typeof req.body.content === 'string') {
      comment.editHistory.push({ content: comment.content });
      comment.content = req.body.content;
      comment.isEdited = true;
    }
    await comment.save();

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RESTORE comment from soft delete (เพิ่มใหม่)
router.patch('/:id/restore', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    if (!comment.isDeleted) {
      return res.status(400).json({ message: 'Comment is not deleted' });
    }
    
    comment.isDeleted = false;
    comment.deletedAt = null;
    await comment.save();
    
    res.json({ message: 'Comment restored successfully', comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE comment (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    // Only author can delete (soft delete)
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await comment.softDelete();
    res.json({ message: 'Comment soft-deleted', comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE comment (hard delete)
router.delete('/:id/hard', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    res.json({ message: 'Comment permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;