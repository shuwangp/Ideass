const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📁 Multer destination callback called');
    console.log('📁 Uploads directory:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    console.log('📝 Multer filename callback called');
    console.log('👤 Request user:', req.user);
    console.log('📄 Original filename:', file.originalname);
    
    // Generate unique filename with timestamp and user ID
    const userId = req.user ? req.user._id : 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `avatar_${userId}_${timestamp}${extension}`;
    
    console.log('📝 Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  onError: (err, next) => {
    console.error('❌ Multer error:', err);
    next(err);
  }
});

// Middleware for single avatar upload
const uploadAvatar = upload.single('avatar');

// Debug middleware to log upload details
const debugUpload = (req, res, next) => {
  console.log('Upload middleware - Request headers:', req.headers);
  console.log('Upload middleware - Content-Type:', req.headers['content-type']);
  console.log('Upload middleware - User:', req.user);
  next();
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name. Expected field name is "avatar".'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  
  next(error);
};

module.exports = {
  uploadAvatar,
  debugUpload,
  handleUploadError
};
