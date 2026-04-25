import api from './api.service';
import { API_ENDPOINTS } from '../config/api';

const reportService = {
  // Submit daily report
  submitReport: async (reportData) => {
    try {
      const response = await api.post(API_ENDPOINTS.SUBMIT_REPORT, reportData);
      return { 
        success: true, 
        report: response.report,
        message: response.message 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  // Get today's report
  getTodayReport: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_TODAY_REPORT);
      return { 
        success: true, 
        report: response.report 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  // Update report
  updateReport: async (reportId, reportData) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.UPDATE_REPORT}/${reportId}`, reportData);
      return { 
        success: true, 
        report: response.report 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  // Get history
  getHistory: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_HISTORY);
      return { 
        success: true, 
        reports: response.reports || [] 
      };
    } catch (error) {
      return { 
        success: false, 
        reports: [],
        message: error.message 
      };
    }
  },

  // Get stats
  getStats: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_STATS);
      return { 
        success: true, 
        stats: response.stats 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },
};

export default reportService;