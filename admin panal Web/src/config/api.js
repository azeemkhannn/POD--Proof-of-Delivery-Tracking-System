// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY: '/auth/verify',
  ME: '/auth/me',
  LOGOUT: '/auth/logout',

  // Admin - Drivers
  DRIVERS: '/admin/drivers',
  DRIVER: (id) => `/admin/drivers/${id}`,
  TOGGLE_DRIVER: (id) => `/admin/drivers/${id}/toggle-status`,

  // Admin - Routes
  ROUTES: '/admin/routes',
  ROUTE: (id) => `/admin/routes/${id}`,
  ASSIGN_DRIVER: (id) => `/admin/routes/${id}/assign-driver`,

  // Admin - Reports
  REPORTS: '/admin/reports',
  DRIVER_REPORTS: (id) => `/admin/reports/driver/${id}`,
  ROUTE_REPORTS: (id) => `/admin/reports/route/${id}`,
  DATE_REPORTS: (date) => `/admin/reports/date/${date}`,
  DASHBOARD: '/admin/dashboard',
};