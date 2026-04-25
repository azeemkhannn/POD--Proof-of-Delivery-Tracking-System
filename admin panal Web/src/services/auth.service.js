import api from './api.service';
import { API_ENDPOINTS } from '../config/api';

const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.VERIFY);
      return response.success;
    } catch (error) {
      return false;
    }
  },
};

export default authService;