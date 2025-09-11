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
      return response.data.success ? response.data.data : null;
    } catch (error) {
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

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();