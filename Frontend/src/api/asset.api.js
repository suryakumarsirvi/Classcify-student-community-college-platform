import api from './axios';

const assetApi = {
  
  createAsset: async (formData) => {
    try {
      const response = await api.post('/api/assets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
  getAssets: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/api/assets?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
  getUserAssets: async () => {
    try {
      const response = await api.get('/api/assets/my-assets');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
  downloadAsset: async (assetId) => {
    try {
      const response = await api.get(`/api/assets/${assetId}/download`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
  toggleFavorite: async (assetId) => {
    try {
      const response = await api.post(`/api/assets/${assetId}/favorite`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
  getStats: async () => {
    try {
      const [assets, downloads, favorites] = await Promise.all([
        api.get('/api/assets/my-assets'),
        api.get('/api/assets/my-downloads'),
        api.get('/api/assets/my-favorites')
      ]);
      
      return {
        totalAssets: assets.data.length,
        totalDownloads: downloads.data.length,
        totalFavorites: favorites.data.length
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default assetApi; 