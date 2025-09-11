const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');

// ไอเดียยอดนิยม
router.get('/popular', AnalyticsController.getPopularIdeas);

// สถิติการใช้งาน
router.get('/statistics', AnalyticsController.getStatistics);

// แนวโน้มไอเดีย
router.get('/trends', AnalyticsController.getTrends);

module.exports = router;
