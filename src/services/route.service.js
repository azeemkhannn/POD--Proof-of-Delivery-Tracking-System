import api from './api.service';
import { API_ENDPOINTS } from '../config/api';

const routeService = {
  // Get today's route
  getTodayRoute: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_ROUTE);
      return { 
        success: true, 
        route: response.route 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  },

  // Check if route is available today
  checkRouteAvailability: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.CHECK_ROUTE);
      return { 
        success: true, 
        available: response.available,
        message: response.message 
      };
    } catch (error) {
      return { 
        success: false, 
        available: false,
        message: error.message 
      };
    }
  },
};

export default routeService;