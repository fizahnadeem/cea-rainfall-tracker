import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Create axios instance
const api = axios.create({
   baseURL: API_BASE_URL,
   timeout: 10000,
   headers: {
      'Content-Type': 'application/json',
   },
   withCredentials: true,
});

// Request interceptor to add API key
api.interceptors.request.use(
   (config) => {
      const apiKey = localStorage.getItem('apiKey');
      if (apiKey) {
         config.headers['x-api-key'] = apiKey;
      }
      return config;
   },
   (error) => {
      return Promise.reject(error);
   }
);

// Response interceptor for error handling
api.interceptors.response.use(
   (response) => response,
   (error) => {
      if (error.response?.status === 401) {
         localStorage.removeItem('apiKey');
         localStorage.removeItem('userEmail');
         window.location.href = '/';
      }
      return Promise.reject(error);
   }
);

// API functions
export const apiService = {
   // User login
   loginUser: async (email, password) => {
      try {
         const response = await api.post('/api/login', { email, password });
         console.log(response.data)
         return response.data;
      } catch (error) {
         console.error('Login error:', error);
         throw error;
      }
   },

   // User register
   registerUser: async (email, password) => {
      try {
         const response = await api.post('/api/register', { email, password });
         console.log(response.data)
         return response.data;
      } catch (error) {
         console.error('register error:', error);
         throw error;
      }
   },

   // Request API access
   requestApiAccess: async (email, reason) => {
      try {
         const response = await api.post('/api/request-access', { email, reason });
         return response.data;
      } catch (error) {
         console.error('Request access error:', error);
         throw error;
      }
   },

   // Admin functions
   getRequests: async () => {
      try {
         const response = await api.get('/admin/requests');
         return response.data;
      } catch (error) {
         console.error('Get requests error:', error);
         throw error;
      }
   },

   approveRequest: async (requestId) => {
      try {
         const response = await api.post(`/admin/requests/${requestId}/approve`);
         return response.data;
      } catch (error) {
         console.error('Approve request error:', error);
         throw error;
      }
   },

   rejectRequest: async (requestId, reason) => {
      try {
         const response = await api.post(`/admin/requests/${requestId}/reject`, { reason });
         return response.data;
      } catch (error) {
         console.error('Reject request error:', error);
         throw error;
      }
   },

   // Rainfall data
   getAllRainfall: async () => {
      try {
         const response = await api.get('/api/rainfall/all');
         return response.data;
      } catch (error) {
         console.error('Get all rainfall error:', error);
         throw error;
      }
   },

   getRainfallByDate: async (date) => {
      try {
         const response = await api.get(`/api/rainfall/day/${date}`);
         return response.data;
      } catch (error) {
         console.error('Get rainfall by date error:', error);
         throw error;
      }
   },

   getRainfallByLocation: async (area) => {
      try {
         const response = await api.get(`/api/rainfall/location/${area}`);
         return response.data;
      } catch (error) {
         console.error('Get rainfall by location error:', error);
         throw error;
      }
   },

   getRainfallByLocationAndDate: async (area, date) => {
      try {
         const response = await api.get(`/api/rainfall/${area}/${date}`);
         return response.data;
      } catch (error) {
         console.error('Get rainfall by location and date error:', error);
         throw error;
      }
   },

   getAreas: async () => {
      try {
         const response = await api.get('/api/areas');
         return response.data;
      } catch (error) {
         console.error('Get areas error:', error);
         throw error;
      }
   },

   getStats: async () => {
      try {
         const response = await api.get('/api/stats');
         return response.data;
      } catch (error) {
         console.error('Get stats error:', error);
         throw error;
      }
   },

   // Admin functions
   createRainfall: async (rainfallData) => {
      try {
         const response = await api.post('/admin/rainfall', rainfallData);
         return response.data;
      } catch (error) {
         console.error('Create rainfall error:', error);
         throw error;
      }
   },

   updateRainfall: async (id, rainfallData) => {
      try {
         const response = await api.put(`/admin/rainfall/${id}`, rainfallData);
         return response.data;
      } catch (error) {
         console.error('Update rainfall error:', error);
         throw error;
      }
   },

   deleteRainfall: async (id) => {
      try {
         const response = await api.delete(`/admin/rainfall/${id}`);
         return response.data;
      } catch (error) {
         console.error('Delete rainfall error:', error);
         throw error;
      }
   },

   getAdminRainfall: async (page = 1, limit = 20) => {
      try {
         const response = await api.get(`/admin/rainfall?page=${page}&limit=${limit}`);
         return response.data;
      } catch (error) {
         console.error('Get admin rainfall error:', error);
         throw error;
      }
   },

   getUsers: async () => {
      try {
         const response = await api.get('/admin/users');
         return response.data;
      } catch (error) {
         console.error('Get users error:', error);
         throw error;
      }
   },

   deleteUser: async (id) => {
      try {
         const response = await api.delete(`/admin/users/${id}`);
         return response.data;
      } catch (error) {
         console.error('Delete user error:', error);
         throw error;
      }
   },

   // Health check
   healthCheck: async () => {
      try {
         const response = await api.get('/health');
         return response.data;
      } catch (error) {
         console.error('Health check error:', error);
         throw error;
      }
   },
};

export default api; 