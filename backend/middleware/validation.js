const { body, validationResult, param, query } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

// User registration validation
const validateUserRegistration = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 0, max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 0, max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    
    body('department')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Department cannot exceed 100 characters'),
    
    handleValidationErrors
];

// User login validation
const validateUserLogin = [
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('username')
        .optional()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    (req, res, next) => {
        if (!req.body.email && !req.body.username) {
            return res.status(400).json({
                success: false,
                message: 'Please provide either email or username'
            });
        }
        next();
    },
    handleValidationErrors
];

// Update profile validation
const validateProfileUpdate = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name cannot be empty and cannot exceed 50 characters'),
    
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name cannot be empty and cannot exceed 50 characters'),
    
    body('department')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Department cannot exceed 100 characters'),
    
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),
    
    handleValidationErrors
];

// Idea validation
const validateIdeaCreation = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    
    body('description')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),
    
    body('category')
        .isIn(['Technology', 'Business', 'Marketing', 'Product', 'Process Improvement', 'Cost Reduction', 'Innovation', 'Sustainability', 'Other'])
        .withMessage('Please select a valid category'),
    
    body('tags')
        .optional()
        .isArray({ max: 10 })
        .withMessage('Tags must be an array with maximum 10 items'),
    
    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Each tag must be between 1 and 50 characters'),
    
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),
    
    body('estimatedCost')
        .optional()
        .isNumeric()
        .withMessage('Estimated cost must be a number'),
    
    body('estimatedROI')
        .optional()
        .isNumeric()
        .withMessage('Estimated ROI must be a number'),
    
    handleValidationErrors
];

// Comment validation
const validateCommentCreation = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters'),
    
    param('ideaId')
        .isMongoId()
        .withMessage('Invalid idea ID'),
    
    body('parentCommentId')
        .optional()
        .isMongoId()
        .withMessage('Invalid parent comment ID'),
    
    handleValidationErrors
];

// Vote validation
const validateVote = [
    param('ideaId')
        .isMongoId()
        .withMessage('Invalid idea ID'),
    
    body('type')
        .isIn(['upvote', 'downvote'])
        .withMessage('Vote type must be upvote or downvote'),
    
    handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName}`),
    
    handleValidationErrors
];

// Pagination validation
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer')
        .toInt(),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
        .toInt(),
    
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'updatedAt', 'totalScore', 'title'])
        .withMessage('Invalid sort field'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc'),
    
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateUserRegistration,
    validateUserLogin,
    validateProfileUpdate,
    validateIdeaCreation,
    validateCommentCreation,
    validateVote,
    validateObjectId,
    validatePagination
};