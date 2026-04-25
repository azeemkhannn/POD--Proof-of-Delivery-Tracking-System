import api from './api.service';
import { API_ENDPOINTS } from '../config/api';

const driverService = {
  // Get all drivers
  getAllDrivers: async () => {
    return await api.get(API_ENDPOINTS.DRIVERS);
  },

  // Get single driver
  getDriver: async (id) => {
    return await api.get(API_ENDPOINTS.DRIVER(id));
  },

  // Create driver
  createDriver: async (driverData) => {
    return await api.post(API_ENDPOINTS.DRIVERS, driverData);
  },

  // Update driver
  updateDriver: async (id, driverData) => {
    return await api.put(API_ENDPOINTS.DRIVER(id), driverData);
  },

  // Delete driver
  deleteDriver: async (id) => {
    return await api.delete(API_ENDPOINTS.DRIVER(id));
  },

  // Toggle driver status
  toggleDriverStatus: async (id) => {
    return await api.patch(API_ENDPOINTS.TOGGLE_DRIVER(id));
  },
};

export default driverService;