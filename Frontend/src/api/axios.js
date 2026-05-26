// frontend/src/api/axios.js
import axios from 'axios';

// Create axios instance with default settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('studentToken') ||
    localStorage.getItem('teacherToken') ||
    localStorage.getItem('adminToken');

  if (token) {
    const cleanToken = token.replace(/['"]/g, '').trim();
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }

  // Create new AbortController for each request
  const controller = new AbortController();
  config.signal = controller.signal;

  // Store controller in config for potential cancellation
  config.controller = controller;

  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }

    if (error.response) {
      // Server responded with error status
      console.error('Server error:', error.response.status, error.response.data);

      if (error.response.status === 401) {
        console.warn('Unauthorized: Token might be invalid or expired');
        // Handle token refresh or logout here
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Export a function to cancel pending requests
export const cancelPendingRequests = () => {
  const pendingRequests = api.interceptors.request.handlers;
  pendingRequests.forEach((handler) => {
    if (handler.controller) {
      handler.controller.abort();
    }
  });
};

export default api;
