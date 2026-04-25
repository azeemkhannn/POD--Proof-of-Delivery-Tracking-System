import api from './api.service';
import { API_ENDPOINTS } from '../config/api';

const reportService = {
  // Get all reports
  getAllReports: async (params = {}) => {
    return await api.get(API_ENDPOINTS.REPORTS, { params });
  },

  // Get driver reports
  getDriverReports: async (driverId, params = {}) => {
    return await api.get(API_ENDPOINTS.DRIVER_REPORTS(driverId), { params });
  },

  // Get route reports
  getRouteReports: async (routeId, params = {}) => {
    return await api.get(API_ENDPOINTS.ROUTE_REPORTS(routeId), { params });
  },

  // Get reports by date
  getReportsByDate: async (date) => {
    return await api.get(API_ENDPOINTS.DATE_REPORTS(date));
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    return await api.get(API_ENDPOINTS.DASHBOARD);
  },
};

export default reportService;