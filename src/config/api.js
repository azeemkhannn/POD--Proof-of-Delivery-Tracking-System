// API Configuration
// ⚠️ CHANGE THIS: Replace with your backend URL
export const API_BASE_URL = 'http://172.20.10.2:5000/api'; 
// For local testing use your computer's IP address (not localhost)
// For production use: 'https://your-backend.com/api'

export const API_ENDPOINTS = {
  // Auth
  LOGIN: 'auth/login-driver',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',

  // Driver Routes
  GET_ROUTE: '/driver/route',
  CHECK_ROUTE: '/driver/route/check',
  SUBMIT_REPORT: '/driver/report',
  GET_TODAY_REPORT: '/driver/report/today',
  UPDATE_REPORT: '/driver/report',
  GET_HISTORY: '/driver/history',
  GET_STATS: '/driver/stats',
};

export const APP_CONFIG = {
  APP_NAME: 'SKS Driver',
  APP_SUBTITLE: 'Driver Delivery App',
};