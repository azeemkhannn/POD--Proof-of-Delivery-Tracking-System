import AsyncStorage from '@react-native-async-storage/async-storage';

// Local storage service for offline data persistence
const storageService = {
  // Save delivery progress locally
  saveDeliveryProgress: async (deliveryData) => {
    try {
      await AsyncStorage.setItem('delivery_progress', JSON.stringify(deliveryData));
      return true;
    } catch (error) {
      console.error('Error saving delivery progress:', error);
      return false;
    }
  },

  // Get delivery progress
  getDeliveryProgress: async () => {
    try {
      const data = await AsyncStorage.getItem('delivery_progress');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting delivery progress:', error);
      return null;
    }
  },

  // Clear delivery progress (after successful submission)
  clearDeliveryProgress: async () => {
    try {
      await AsyncStorage.removeItem('delivery_progress');
      return true;
    } catch (error) {
      console.error('Error clearing delivery progress:', error);
      return false;
    }
  },

  // Save shop data
  saveShopData: async (shopId, shopData) => {
    try {
      const key = `shop_${shopId}`;
      await AsyncStorage.setItem(key, JSON.stringify(shopData));
      return true;
    } catch (error) {
      console.error('Error saving shop data:', error);
      return false;
    }
  },

  // Get shop data
  getShopData: async (shopId) => {
    try {
      const key = `shop_${shopId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting shop data:', error);
      return null;
    }
  },

  // Clear all shop data
  clearAllShopData: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const shopKeys = keys.filter(key => key.startsWith('shop_'));
      await AsyncStorage.multiRemove(shopKeys);
      return true;
    } catch (error) {
      console.error('Error clearing shop data:', error);
      return false;
    }
  },
};

export default storageService;