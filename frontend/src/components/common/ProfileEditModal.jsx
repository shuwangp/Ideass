import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, UserIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { ImageUpload } from './ImageUpload.jsx';
import { Button } from './Button.jsx';
import { LoadingSpinner } from './LoadingSpinner.jsx';
import { authService } from '../../services/authService.js';

export const ProfileEditModal = ({ isOpen, onClose, user, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    username: '',
    bio: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        bio: user.bio || ''
      });
      setSelectedImage(null);
      setError(null);
    }
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (file) => {
    setSelectedImage(file);
    setError(null);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let updatedUser;

      // Upload new image if selected
      if (selectedImage) {
        const avatarUrl = await authService.uploadProfileImage(selectedImage);
        // Update profile with new data including avatar
        updatedUser = await authService.updateProfile({
          ...formData,
          avatar: avatarUrl
        });
      } else {
        // Update profile with new data (no avatar change)
        updatedUser = await authService.updateProfile(formData);
      }

      console.log('Profile updated successfully:', updatedUser);
      onProfileUpdate(updatedUser);
      onClose();
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">แก้ไขโปรไฟล์</h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">รูปโปรไฟล์</h3>
              <ImageUpload
                currentImage={user?.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`) : null}
                onImageChange={handleImageChange}
                onImageRemove={handleImageRemove}
                size="xl"
                disabled={isLoading}
              />
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">ข้อมูลส่วนตัว</h3>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อผู้ใช้
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="กรอกชื่อผู้ใช้ของคุณ"
                    disabled={isLoading}
                  />
                </div>
              </div>


              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                  ประวัติส่วนตัว
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="บอกเราเกี่ยวกับตัวคุณ..."
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.bio.length}/500 ตัวอักษร
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <p className="text-red-800 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">กำลังบันทึก...</span>
                  </>
                ) : (
                  'บันทึกการเปลี่ยนแปลง'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
