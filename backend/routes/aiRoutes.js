const express = require('express');
const rateLimit = require('express-rate-limit');
const { 
  suggestIdeaImprovement, 
  analyzeIdeaConnections, 
  getSearchSuggestions
} = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply rate limiting to all AI routes
const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.AI_RATE_LIMIT_PER_HOUR || 50,
  message: {
    error: 'Too many AI requests, please try again later.',
  },
});

router.use(aiRateLimit);

// Apply authentication to all AI routes
router.use(authenticateToken);

// POST /api/ai/suggest - Get AI suggestions for idea improvement
router.post('/suggest', suggestIdeaImprovement);

// POST /api/ai/analyze/:ideaId - Analyze idea connections and development
router.post('/analyze/:ideaId', analyzeIdeaConnections);

// GET /api/ai/search-suggestions - Get AI-powered search suggestions
router.get('/search-suggestions', getSearchSuggestions);

module.exports = router;
