const express = require('express');
const router = express.Router();

// Import controllers
const {
    registerUser,
    loginUser,
    getCurrentUser,
    updateProfile,
    changePassword,
    uploadAvatar,
    logoutUser,
    cleanupAvatars,
    getAvatarStorageStats
} = require('../controllers/authController');

// Import middleware
const { authenticateToken } = require('../middleware/auth');
const { uploadAvatar: uploadMiddleware, debugUpload, handleUploadError } = require('../middleware/upload');
const {
    validateUserRegistration,
    validateUserLogin,
    validateProfileUpdate
} = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validateUserRegistration, registerUser);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateUserLogin, loginUser);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateToken, getCurrentUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, validateProfileUpdate, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', authenticateToken, changePassword);

// @route   POST /api/auth/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', authenticateToken, debugUpload, uploadMiddleware, handleUploadError, uploadAvatar);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, logoutUser);

// @route   POST /api/auth/cleanup-avatars
// @desc    Clean up unused avatar files
// @access  Private (Admin only)
router.post('/cleanup-avatars', authenticateToken, cleanupAvatars);

// @route   GET /api/auth/avatar-stats
// @desc    Get avatar storage statistics
// @access  Private (Admin only)
router.get('/avatar-stats', authenticateToken, getAvatarStorageStats);

// @route   GET /api/auth/test-upload
// @desc    Test upload functionality
// @access  Private
router.get('/test-upload', authenticateToken, (req, res) => {
    const path = require('path');
    res.json({
        success: true,
        message: 'Upload test endpoint',
        user: req.user._id,
        uploadsDir: path.join(__dirname, '../uploads/avatars')
    });
});

module.exports = router;