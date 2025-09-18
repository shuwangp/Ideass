const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const User = require('./models/User');
const Idea = require('./models/Idea');
const Comment = require('./models/Comment');
const authRoutes = require('./routes/authRoutes');
const ideaRoutes = require('./routes/ideaRoutes');
const commentRoutes = require('./routes/commentRoutes');
const voteRoutes = require('./routes/voteRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');




// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/api/analytics', analyticsRoutes);
app.use('/api/votes', voteRoutes);// "comment"
app.use('/api/comments', commentRoutes);// "comment"
app.use('/api/ideas', ideaRoutes); // ใช้ plural "ideas"
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);



// Test route สำหรับทดสอบ Models  
app.get('/test-models', async (req, res) => {
    try {
        // ทดสอบว่า models โหลดได้
        const userCount = await User.countDocuments();
        const ideaCount = await Idea.countDocuments();
        const commentCount = await Comment.countDocuments();
        
        res.json({
            message: '✅ Models loaded successfully!',
            stats: {
                users: userCount,
                ideas: ideaCount,
                comments: commentCount
            }
        });
    } catch (error) {
        res.status(500).json({
            message: '❌ Models test failed',
            error: error.message
        });
    }
});

// Basic route for testing
app.get('/', (req, res) => {
    res.json({
        message: '🚀 AI Idea Management API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// 404 handler (catch all unmatched routes)
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl
    });
});



// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});