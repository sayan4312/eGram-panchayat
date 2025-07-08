import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  aadhaarNumber?: string;
  address?: {
    street?: string;
    village?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'staff' | 'admin';
  department?: string;
  subRoles?: string[];
  language: string;
  verified: boolean;
  isActive: boolean;
  aadhaarNumber?: string;
  address?: any;
  createdAt: string;
  updatedAt: string;
  mustChangePassword?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

class AuthService {
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.data.success && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    localStorage.removeItem('user');
  }



  async getCurrentUser(): Promise<User> {
    try {
    const response = await api.get(API_ENDPOINTS.AUTH.ME);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    throw new Error('Failed to get current user');
    } catch (error: any) {
      // If it's a network error or rate limit, throw the error
      if (error.response?.status === 429 || error.code === 'NETWORK_ERROR') {
        throw error;
      }
      
      // For other errors, clear the stored user and throw
      localStorage.removeItem('user');
      throw new Error('Session expired. Please login again.');
    }
  }

  async updateLanguage(language: string): Promise<AuthResponse> {
    const response = await api.put(API_ENDPOINTS.AUTH.UPDATE_LANGUAGE, { language });
    if (response.data.success) {
      localStorage.setItem('language', language);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.language = language;
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  }

  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export default new AuthService();