import api from '../config/api.js';

/**
 * @typedef {Object} LoginData
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} email
 * @property {string} username
 * @property {string} password
 * @property {string} confirmPassword
 */

class AuthService {
  /**
   * @param {{email?: string, username?: string, password: string}} data
   * @returns {Promise<import('../types/index.js').AuthUser>}
   */
  async login(data) {
    try {
      const response = await api.post('/auth/login', data);
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return response.data.data;
      }
      const err = new Error(response.data.message || 'Login failed');
      if (response.data.errors) err.details = response.data.errors;
      throw err;
    } catch (error) {
      if (error.response?.data) {
        const err = new Error(error.response.data.message || 'Login failed');
        if (error.response.data.errors) err.details = error.response.data.errors;
        throw err;
      }
      throw error;
    }
  }

  /**
   * @param {RegisterData} data
   * @returns {Promise<import('../types/index.js').AuthUser>}
   */
  async register(data) {
    try {
      const response = await api.post('/auth/register', data);
      if (response.data.success) {
        const { user, token } = response.data.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return response.data.data;
      }
      const err = new Error(response.data.message || 'Registration failed');
      if (response.data.errors) err.details = response.data.errors;
      throw err;
    } catch (error) {
      if (error.response?.data) {
        const err = new Error(error.response.data.message || 'Registration failed');
        if (error.response.data.errors) err.details = error.response.data.errors;
        throw err;
      }
      throw error;
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  }

  /**
   * @returns {Promise<import('../types/index.js').User | null>}
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        return response.data.data.user;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * @returns {import('../types/index.js').User | null}
   */
  getStoredUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * @param {{username?: string, department?: string, bio?: string, avatar?: string}} data
   * @returns {Promise<import('../types/index.js').User>}
   */
  async updateProfile(data) {
    try {
      const response = await api.put('/auth/profile', data);
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      const err = new Error(response.data.message || 'Profile update failed');
      if (response.data.errors) err.details = response.data.errors;
      throw err;
    } catch (error) {
      if (error.response?.data) {
        const err = new Error(error.response.data.message || 'Profile update failed');
        if (error.response.data.errors) err.details = error.response.data.errors;
        throw err;
      }
      throw error;
    }
  }

  /**
   * @param {File} imageFile
   * @returns {Promise<string>} Returns the uploaded image URL
   */
  async uploadProfileImage(imageFile) {
    try {
      console.log('Uploading profile image:', imageFile);
      console.log('File name:', imageFile.name);
      console.log('File size:', imageFile.size);
      console.log('File type:', imageFile.type);
      
      const formData = new FormData();
      formData.append('avatar', imageFile);
      
      console.log('FormData created, sending request...');
      const response = await api.post('/auth/upload-avatar', formData);
      
      console.log('Upload response:', response.data);

      if (response.data.success) {
        return response.data.data.imageUrl;
      }
      const err = new Error(response.data.message || 'Image upload failed');
      throw err;
    } catch (error) {
      if (error.response?.data) {
        const err = new Error(error.response.data.message || 'Image upload failed');
        throw err;
      }
      throw error;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();