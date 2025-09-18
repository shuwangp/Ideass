import { create } from 'zustand';
import { authService } from '../services/authService.js';

/**
 * @typedef {Object} AuthState
 * @property {import('../types/index.js').User | null} user
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 * @property {(email: string, password: string) => Promise<void>} login
 * @property {(data: {email: string, username: string, password: string, confirmPassword: string}) => Promise<void>} register
 * @property {() => Promise<void>} logout
 * @property {() => Promise<void>} initializeAuth
 */

export const useAuth = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (identifier, password) => {
    try {
      const payload =
        typeof identifier === 'string' && identifier.includes('@')
          ? { email: identifier, password }
          : { username: identifier, password };
      const authData = await authService.login(payload);
      set({ user: authData.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  register: async (data) => {
    try {
      const authData = await authService.register(data);
      set({ user: authData.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
      set({ user: null, isAuthenticated: false });
    }
  },

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      const storedUser = authService.getStoredUser();
      
      if (storedUser && authService.isAuthenticated()) {
        // Verify token is still valid
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          set({ user: currentUser, isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));