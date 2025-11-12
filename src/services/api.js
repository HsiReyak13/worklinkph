// API service for communicating with backend
// In development, requests go to /api which is proxied to backend
// In production, use REACT_APP_API_URL environment variable

import { logger } from '../utils/logger';
import { supabase } from '../config/supabase';

const getApiBaseUrl = () => {
  // In development, use relative URL (proxied to backend)
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  }
  // In production, use environment variable or default
  return process.env.REACT_APP_API_URL || '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function for API requests with Supabase Auth token
const apiRequest = async (endpoint, options = {}) => {
  // Get Supabase session token
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  
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

// Authentication API using Supabase Auth
export const authAPI = {
  register: async (userData) => {
    // Register through backend API (which uses Supabase Auth)
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });

    // Save Supabase session if returned
    if (response.data?.session) {
      await supabase.auth.setSession({
        access_token: response.data.session.access_token,
        refresh_token: response.data.session.refresh_token
      });
    }

    return response;
  },

  login: async (emailOrPhone, password) => {
    // Login directly through Supabase Auth (works in production without backend)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailOrPhone, // Supabase uses email, but we accept emailOrPhone for UX
      password: password,
    });

    if (error) {
      throw new Error(error.message || 'Login failed. Please check your credentials.');
    }

    if (data?.session) {
      // Session is automatically saved by Supabase
      // Optionally sync with backend if available
      try {
        await apiRequest('/auth/login', {
          method: 'POST',
          body: { emailOrPhone, password },
        });
      } catch (backendError) {
        // Backend might not be available in production, that's okay
        console.warn('Backend login sync failed (this is okay if backend is not deployed):', backendError);
      }
    }

    return {
      success: true,
      message: 'Login successful',
      data: {
        session: data.session,
        user: data.user
      }
    };
  },

  logout: async () => {
    // Logout from Supabase Auth
    await supabase.auth.signOut();
    
    // Also call backend logout endpoint
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Ignore errors, Supabase logout is the important one
      console.warn('Backend logout failed:', error);
    }
  },

  forgotPassword: async (email) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  resetPassword: async (password) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { password },
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  // Get current Supabase session
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  // Listen to auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Google Sign-In
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Handle OAuth callback
  handleAuthCallback: async () => {
    // Get the session from URL hash
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    
    if (session) {
      // Check if user profile exists, if not create it
      try {
        const response = await apiRequest('/auth/google/callback', {
          method: 'POST',
          body: { session }
        });
        return response;
      } catch (err) {
        // If profile doesn't exist, create it
        return { success: true, session, needsProfile: true };
      }
    }
    
    return { success: false };
  }
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

  saveOnboardingProgress: async (progress) => {
    return apiRequest('/users/onboarding', {
      method: 'PUT',
      body: { progress, completed: false },
    });
  },

  uploadAvatar: async (avatarUrl) => {
    return apiRequest('/users/upload-avatar', {
      method: 'POST',
      body: { avatarUrl },
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

// Legacy token manager (kept for backward compatibility, but now uses Supabase sessions)
export const tokenManager = {
  save: async (session) => {
    // Save Supabase session
    if (session?.access_token && session?.refresh_token) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      });
    }
  },
  
  get: async () => {
    // Get Supabase session token
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  },
  
  remove: async () => {
    // Remove Supabase session
    await supabase.auth.signOut();
  },
};
