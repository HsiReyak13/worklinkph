// API service for communicating with backend
// In development, requests go to /api which is proxied to backend
// In production, use REACT_APP_API_URL environment variable

import { logger } from '../utils/logger';

const getApiBaseUrl = () => {
  // In development, use relative URL (proxied to backend)
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  }
  // In production, use environment variable or default
  return process.env.REACT_APP_API_URL || '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    logger.info('API Request', { url, method: config.method || 'GET' });
    
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    logger.error('API Error', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  login: async (emailOrPhone, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { emailOrPhone, password },
    });
  },

  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    return apiRequest('/users/profile', {
      method: 'GET',
    });
  },

  updateProfile: async (profileData) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: profileData,
    });
  },

  deleteAccount: async () => {
    return apiRequest('/users/profile', {
      method: 'DELETE',
    });
  },

  completeOnboarding: async () => {
    return apiRequest('/users/onboarding', {
      method: 'PUT',
    });
  },
};

// Jobs API
export const jobsAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        if (Array.isArray(filters[key])) {
          filters[key].forEach(value => queryParams.append(key, value));
        } else {
          queryParams.append(key, filters[key]);
        }
      }
    });

    const queryString = queryParams.toString();
    const url = `/jobs${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url, {
      method: 'GET',
    });
  },

  getById: async (id) => {
    return apiRequest(`/jobs/${id}`, {
      method: 'GET',
    });
  },

  create: async (jobData) => {
    return apiRequest('/jobs', {
      method: 'POST',
      body: jobData,
    });
  },

  update: async (id, jobData) => {
    return apiRequest(`/jobs/${id}`, {
      method: 'PUT',
      body: jobData,
    });
  },

  delete: async (id) => {
    return apiRequest(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Resources API
export const resourcesAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = `/resources${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url, {
      method: 'GET',
    });
  },

  getById: async (id) => {
    return apiRequest(`/resources/${id}`, {
      method: 'GET',
    });
  },

  create: async (resourceData) => {
    return apiRequest('/resources', {
      method: 'POST',
      body: resourceData,
    });
  },

  update: async (id, resourceData) => {
    return apiRequest(`/resources/${id}`, {
      method: 'PUT',
      body: resourceData,
    });
  },

  delete: async (id) => {
    return apiRequest(`/resources/${id}`, {
      method: 'DELETE',
    });
  },
};

// Helper to save/remove token
export const tokenManager = {
  save: (token) => {
    localStorage.setItem('token', token);
  },
  
  get: () => {
    return localStorage.getItem('token');
  },
  
  remove: () => {
    localStorage.removeItem('token');
  },
};

