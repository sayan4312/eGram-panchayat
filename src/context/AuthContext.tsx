import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User, LoginCredentials, RegisterData } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;

  updateLanguage: (language: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user and validate with server
    const initializeAuth = async () => {
      try {
        const storedUser = authService.getCurrentUserFromStorage();
        if (storedUser) {
          // Validate with server
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        // Clear invalid stored user
        localStorage.removeItem('user');
        setUser(null);
        
        // Don't show error toast for network issues during initialization
        if (error.response?.status !== 429 && error.response?.status !== 0) {
          toast.error('Session expired. Please login again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.success && response.user) {
        setUser(response.user);
        toast.success('Login successful!');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      if (response.success) {
        toast.success('Registration successful! You can now log in.');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };



  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully!');
    } catch (error) {
      // Even if server logout fails, clear local state
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const updateLanguage = async (language: string) => {
    try {
      const response = await authService.updateLanguage(language);
      if (response.success && user) {
        setUser({ ...user, language });
        toast.success('Language updated successfully!');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    updateLanguage,
    refreshUser,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};