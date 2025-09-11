const express = require('express');
const router = express.Router();

// Import controllers
const {
    registerUser,
    loginUser,
    getCurrentUser,
    updateProfile,
    changePassword,
    logoutUser
} = require('../controllers/authController');

// Import middleware
const { authenticateToken } = require('../middleware/auth');
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

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, logoutUser);

module.exports = router;