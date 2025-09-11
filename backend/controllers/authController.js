const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

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
        const { email, password } = req.body;

        // Find user by email and include password field
        const user = await User.findOne({ email }).select('+password');
        
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
        const { firstName, lastName, department, bio, avatar } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (department !== undefined) updateData.department = department;
        if (bio !== undefined) updateData.bio = bio;
        if (avatar !== undefined) updateData.avatar = avatar;

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

module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    updateProfile,
    changePassword,
    logoutUser
};