import axios, { AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add language header
api.interceptors.request.use(
  (config) => {
    const language = localStorage.getItem('language') || 'en';
    config.headers['Accept-Language'] = language;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Don't retry if it's already a retry or if it's a rate limit
    if (originalRequest._retry || error.response?.status === 429) {
    if (error.response?.status === 401) {
      console.log('401 detected, redirecting to /login. Failing URL:', error.config?.url);
      // Unauthorized - redirect to login
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden
      toast.error('You do not have permission to perform this action');
      } else if (error.response?.status === 429) {
        // Rate limit - don't show toast, just log
        console.warn('Rate limit exceeded:', error.config?.url);
    } else if (error.response?.status >= 500) {
      // Server error
      toast.error('Server error. Please try again later.');
    } else if (error.response?.data?.message) {
      // API error message
      toast.error(error.response.data.message);
    } else if (error.message) {
      // Network error
        toast.error('Network error. Please check your connection.');
      }
      
      return Promise.reject(error);
    }
    
    // Retry logic for network errors or 5xx errors
    if (error.response?.status >= 500 || error.code === 'NETWORK_ERROR') {
      originalRequest._retry = true;
      
      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        return await api(originalRequest);
      } catch (retryError: any) {
        // If retry fails, handle the error normally
        if (retryError.response?.status === 401) {
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else if (retryError.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (retryError.message) {
          toast.error('Network error. Please check your connection.');
        }
        return Promise.reject(retryError);
      }
    }
    
    // Handle other errors normally
    if (error.response?.status === 401) {
      console.log('401 detected, redirecting to /login. Failing URL:', error.config?.url);
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export const fetchStaffPositions = async () => {
  const res = await fetch('/api/staff/positions');
  if (!res.ok) throw new Error('Failed to fetch staff positions');
  return res.json();
};

export default api;