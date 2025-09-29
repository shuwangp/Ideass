const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const { cleanupUnusedAvatars, getAvatarStats } = require('../utils/avatarCleanup');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, department, bio } = req.body;

        // Check if user already exists
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({
                success: false,
                message: 'Username already taken'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            department: department || '',
            bio: bio || ''
        });

        await user.save();

        // Generate JWT token
        const token = generateToken({ 
            userId: user._id,
            email: user.email,
            role: user.role
        });

        // Get user profile without password
        const userProfile = user.getPublicProfile();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userProfile,
                token
            }
        });

    } catch (error) {
        console.error('Register user error:', error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Find user by email OR username and include password field
        const query = email ? { email } : { username };
        const user = await User.findOne(query).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = generateToken({ 
            userId: user._id,
            email: user.email,
            role: user.role
        });

        // Get user profile without password
        const userProfile = user.getPublicProfile();

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userProfile,
                token
            }
        });

    } catch (error) {
        console.error('Login user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
    try {
        // User is already attached to req by auth middleware
        const user = req.user;
        
        res.json({
            success: true,
            data: {
                user: user.getPublicProfile()
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, department, bio, avatar } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (username !== undefined) {
            // Check if username is already taken by another user
            const existingUser = await User.findOne({ 
                username: username, 
                _id: { $ne: userId } 
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว'
                });
            }
            updateData.username = username;
        }
        if (department !== undefined) updateData.department = department;
        if (bio !== undefined) updateData.bio = bio;
        if (avatar !== undefined) {
            // Delete old avatar if updating to new one
            await deleteOldAvatar(userId);
            updateData.avatar = avatar;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { 
                new: true, 
                runValidators: true 
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: updatedUser.getPublicProfile()
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        // Get user with password
        const user = await User.findById(userId).select('+password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check current password
        const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password change',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Helper function to delete old avatar file
const deleteOldAvatar = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (user && user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
            const oldFilePath = path.join(__dirname, '..', user.avatar);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
                console.log(`Deleted old avatar: ${oldFilePath}`);
            }
        }
    } catch (error) {
        console.error('Error deleting old avatar:', error);
        // Don't throw error, just log it
    }
};

// @desc    Upload avatar image
// @route   POST /api/auth/upload-avatar
// @access  Private
const uploadAvatar = async (req, res) => {
    try {
        console.log('📤 Upload avatar request received');
        console.log('📋 Request body:', req.body);
        console.log('📁 Request file:', req.file);
        console.log('👤 Request user:', req.user);
        
        if (!req.file) {
            console.log('❌ No file provided in request');
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const userId = req.user._id;
        const filename = req.file.filename;
        const filePath = req.file.path;
        
        console.log('📝 Generated filename:', filename);
        console.log('📂 File path:', filePath);
        
        // Check if file actually exists on disk
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
            console.log('❌ File does not exist on disk:', filePath);
            
            // Try to find the file with a different path format
            const alternativePath = path.join(__dirname, '..', 'uploads', 'avatars', filename);
            if (fs.existsSync(alternativePath)) {
                console.log('✅ Found file at alternative path:', alternativePath);
                req.file.path = alternativePath;
            } else {
                console.log('❌ File not found at any path');
                return res.status(500).json({
                    success: false,
                    message: 'File upload failed - file not saved to disk'
                });
            }
        }
        
        console.log('✅ File exists on disk');
        
        // Delete old avatar before updating
        await deleteOldAvatar(userId);
        
        // Create the image URL
        const imageUrl = `/uploads/avatars/${filename}`;
        
        console.log('🔗 Image URL:', imageUrl);
        
        // Update user's avatar in database
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { avatar: imageUrl },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            console.log('❌ User not found for update');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('✅ User avatar updated in database');

        // Set proper headers to avoid CORB issues
        res.header('Content-Type', 'application/json');
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        res.json({
            success: true,
            message: 'Avatar uploaded successfully',
            data: {
                imageUrl: imageUrl,
                user: updatedUser.getPublicProfile()
            }
        });

    } catch (error) {
        console.error('❌ Upload avatar error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during avatar upload',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
    try {
        // In a stateless JWT system, logout is handled client-side
        // Server can optionally log the logout event
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

// @desc    Clean up unused avatar files
// @route   POST /api/auth/cleanup-avatars
// @access  Private (Admin only)
const cleanupAvatars = async (req, res) => {
    try {
        await cleanupUnusedAvatars();
        res.json({
            success: true,
            message: 'Avatar cleanup completed'
        });
    } catch (error) {
        console.error('Cleanup avatars error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during avatar cleanup'
        });
    }
};

// @desc    Get avatar storage statistics
// @route   GET /api/auth/avatar-stats
// @access  Private (Admin only)
const getAvatarStorageStats = async (req, res) => {
    try {
        const stats = await getAvatarStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get avatar stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting avatar stats'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    updateProfile,
    changePassword,
    uploadAvatar,
    logoutUser,
    cleanupAvatars,
    getAvatarStorageStats
};