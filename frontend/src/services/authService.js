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
   * @param {LoginData} data
   * @returns {Promise<import('../types/index.js').AuthUser>}
   */
  async login(data) {
    const response = await api.post('/auth/login', data);
    if (response.data.success) {
      const { user, token } = response.data.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed');
  }

  /**
   * @param {RegisterData} data
   * @returns {Promise<import('../types/index.js').AuthUser>}
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    if (response.data.success) {
      const { user, token } = response.data.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data.data;
    }
    throw new Error(response.data.message || 'Registration failed');
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