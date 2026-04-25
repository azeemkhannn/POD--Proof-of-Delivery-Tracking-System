import api from './api.service';
import { API_ENDPOINTS } from '../config/api';

const routeService = {
  // Get all routes
  getAllRoutes: async () => {
    return await api.get(API_ENDPOINTS.ROUTES);
  },

  // Get single route
  getRoute: async (id) => {
    return await api.get(API_ENDPOINTS.ROUTE(id));
  },

  // Create route
  createRoute: async (routeData) => {
    return await api.post(API_ENDPOINTS.ROUTES, routeData);
  },

  // Update route
  updateRoute: async (id, routeData) => {
    return await api.put(API_ENDPOINTS.ROUTE(id), routeData);
  },

  // Delete route
  deleteRoute: async (id) => {
    return await api.delete(API_ENDPOINTS.ROUTE(id));
  },

  // Assign driver to route
  assignDriver: async (routeId, driverId) => {
    return await api.patch(API_ENDPOINTS.ASSIGN_DRIVER(routeId), { driverId });
  },
};

export default routeService;