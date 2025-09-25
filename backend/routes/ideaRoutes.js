const express = require('express');
const router = express.Router();
const Idea = require('../models/Idea');
const Comment = require('../models/Comment');
const Vote = require('../models/vote');
const { authenticateToken, requireOwnershipOrAdmin } = require('../middleware/auth');


// CREATE new idea
router.post('/', authenticateToken, async (req, res) => {
    const idea = new Idea({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        tags: req.body.tags,
        author: req.user._id // ใช้ user จาก token แทน
    });
    try {
        const newIdea = await idea.save();
        res.status(201).json({
            success: true,
            data: newIdea
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// READ all ideas พร้อมจำนวนคอมเมนต์
router.get('/', async (req, res) => {
    try {
        const { 
            search, 
            category, 
            status, 
            priority, 
            tags, 
            sortBy = 'createdAt', 
            sortOrder = 'desc',
            page = 1,
            limit = 12
        } = req.query;

        // Build query object
        const query = {};
        
        // Search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by priority
        if (priority) {
            query.priority = priority;
        }

        // Filter by tags
        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : [tags];
            query.tags = { $in: tagArray };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Build sort object
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get total count for pagination
        const total = await Idea.countDocuments(query);

        // Get ideas with pagination
        const ideas = await Idea.find(query)
            .populate('author', 'username firstName lastName avatar')
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        // ดึงจำนวนคอมเมนต์แต่ละไอเดีย
        const results = await Promise.all(
            ideas.map(async (idea) => {
                const comments = await Comment.find({ idea: idea._id })
                    .populate('author', 'username firstName lastName avatar');
                return {
                    ...idea.toObject(),
                    comments,
                    totalComments: comments.length
                };
            })
        );

        // Return paginated response
        res.json({
            success: true,
            data: {
                ideas: results,
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// READ single idea พร้อมคอมเมนต์
router.get('/:id', async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id)
            .populate('author', 'username firstName lastName avatar');
        if (!idea) return res.status(404).json({ message: 'Idea not found' });

        const comments = await Comment.find({ idea: idea._id })
            .populate('author', 'username firstName lastName avatar');

        res.json({ ...idea.toObject(), comments, totalComments: comments.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// UPDATE idea (owner or admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ success: false, message: 'Idea not found' });
    }

    // Check ownership (or admin)
    const isOwner = idea.author && idea.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this idea' });
    }

    // Map frontend status to backend enum if needed
    if (typeof req.body.status === 'string') {
      const statusMap = {
        draft: 'pending',
        published: 'approved',
        archived: 'rejected'
      };
      const mapped = statusMap[req.body.status];
      if (mapped) {
        req.body.status = mapped;
      }
    }

    // Allow only updatable fields
    const allowedFields = ['title', 'description', 'category', 'tags', 'status', 'priority', 'isPublic', 'attachments', 'estimatedCost', 'estimatedROI', 'implementationDate'];
    allowedFields.forEach((field) => {
      if (field in req.body) {
        idea[field] = req.body[field];
      }
    });

    const updated = await idea.save();
    return res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE idea (owner or admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id);
        if (!idea) return res.status(404).json({ success: false, message: 'Idea not found' });

        const isOwner = idea.author && idea.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this idea' });
        }

        // ลบไอเดียและข้อมูลที่เกี่ยวข้อง (cascade delete)
        await Promise.all([
            // ลบไอเดีย
            Idea.findByIdAndDelete(req.params.id),
            // ลบ comments ที่เกี่ยวข้อง
            Comment.deleteMany({ idea: req.params.id }),
            // ลบ votes ที่เกี่ยวข้อง
            Vote.deleteMany({ idea: req.params.id })
        ]);
        
        res.json({ success: true, message: 'Idea and related data deleted successfully', data: idea });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// =========================
// Comments (idea-scoped)
// =========================

// List comments for an idea
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ idea: req.params.id, isDeleted: { $ne: true } })
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create comment for an idea (auth required)
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ success: false, message: 'Idea not found' });

    const comment = new Comment({
      content: content.trim(),
      idea: idea._id,
      author: req.user._id,
      parentComment: parentComment || null
    });

    const saved = await comment.save();
    return res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// =========================
// Votes (idea-scoped)
// =========================

// Get vote stats for an idea
router.get('/:id/vote-stats', authenticateToken, async (req, res) => {
  try {
    const ideaId = req.params.id;
    const votes = await Vote.find({ idea: ideaId });
    const upVotes = votes.filter(v => v.type === 'upvote').length;
    const downVotes = votes.filter(v => v.type === 'downvote').length;
    const userVoteDoc = await Vote.findOne({ idea: ideaId, user: req.user._id });
    const userVote = userVoteDoc ? (userVoteDoc.type === 'upvote' ? 'up' : 'down') : undefined;
    return res.json({ success: true, data: { upVotes, downVotes, userVote } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Cast or update a vote
router.post('/:id/votes', authenticateToken, async (req, res) => {
  try {
    const ideaId = req.params.id;
    const typeIn = req.body.type; // 'up' | 'down'
    if (!['up', 'down'].includes(typeIn)) {
      return res.status(400).json({ success: false, message: 'Invalid vote type' });
    }
    const type = typeIn === 'up' ? 'upvote' : 'downvote';

    let vote = await Vote.findOne({ user: req.user._id, idea: ideaId });
    if (vote) {
      vote.type = type;
      vote.votedAt = new Date();
      await vote.save();
    } else {
      vote = await Vote.create({ user: req.user._id, idea: ideaId, type });
    }

    // recalc and update idea totals
    const votes = await Vote.find({ idea: ideaId });
    const upvotes = votes.filter(v => v.type === 'upvote').length;
    const downvotes = votes.filter(v => v.type === 'downvote').length;
    const totalScore = upvotes - downvotes;
    await Idea.findByIdAndUpdate(ideaId, { totalUpvotes: upvotes, totalDownvotes: downvotes, totalScore });

    return res.json({ success: true, data: vote });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Remove user's vote for an idea
router.delete('/:id/votes', authenticateToken, async (req, res) => {
  try {
    const ideaId = req.params.id;
    const existing = await Vote.findOneAndDelete({ user: req.user._id, idea: ideaId });

    // recalc even if nothing deleted
    const votes = await Vote.find({ idea: ideaId });
    const upvotes = votes.filter(v => v.type === 'upvote').length;
    const downvotes = votes.filter(v => v.type === 'downvote').length;
    const totalScore = upvotes - downvotes;
    await Idea.findByIdAndUpdate(ideaId, { totalUpvotes: upvotes, totalDownvotes: downvotes, totalScore });

    return res.json({ success: true, data: { removed: !!existing } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
