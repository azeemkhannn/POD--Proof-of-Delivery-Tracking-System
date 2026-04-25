import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api.service';
import { API_ENDPOINTS } from '../config/api';

const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
      
      if (response.success && response.token) {
        // Save token and user data
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        return { success: true, user: response.user };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Logout
  logout: async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  // Check if authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      return false;
    }
  },

  // Get token
  getToken: async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      return null;
    }
  },
};

export default authService;