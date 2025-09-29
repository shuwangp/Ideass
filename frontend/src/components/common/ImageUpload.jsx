import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  PhotoIcon, 
  XMarkIcon, 
  CloudArrowUpIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export const ImageUpload = ({ 
  currentImage, 
  onImageChange, 
  onImageRemove,
  size = 'lg',
  className = '',
  disabled = false 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      onImageChange(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove();
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayImage = preview || (currentImage ? (currentImage.startsWith('http') ? currentImage : `http://localhost:5000${currentImage}`) : null);

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          relative rounded-full overflow-hidden cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragging ? 'scale-105 shadow-lg' : 'hover:scale-105'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
          ${error ? 'ring-2 ring-red-500' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {displayImage ? (
          <div className="relative w-full h-full">
            <img
              src={displayImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <CloudArrowUpIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`
            w-full h-full flex flex-col items-center justify-center
            bg-gray-100 hover:bg-gray-200 transition-colors duration-200
            ${isDragging ? 'bg-blue-100 border-2 border-blue-300 border-dashed' : ''}
          `}>
            <PhotoIcon className="h-8 w-8 text-gray-400" />
            <span className="text-xs text-gray-500 mt-1 text-center px-2">
              {isDragging ? 'Drop image here' : 'Click to upload'}
            </span>
          </div>
        )}

        {/* Remove button */}
        {displayImage && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveImage();
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 shadow-lg"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 flex items-center space-x-1 text-red-600 text-sm"
        >
          <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload instructions */}
      {!displayImage && !error && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG up to 5MB
          </p>
        </div>
      )}
    </div>
  );
};
