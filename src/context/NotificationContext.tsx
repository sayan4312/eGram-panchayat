import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import notificationService, { Notification } from '../services/notificationService';
import { useAuth } from './AuthContext';
import { io, Socket } from 'socket.io-client';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- SOCKET.IO REAL-TIME NOTIFICATIONS ---
  useEffect(() => {
    let socket: Socket | null = null;
    if (isAuthenticated && user?._id) {
      socket = io('http://localhost:5000', { withCredentials: true });
      socket.emit('join', user._id);
      
      socket.on('notification', (notification: Notification) => {
        setNotifications(prev => {
          // Avoid duplicates
          if (prev.some(n => n._id === notification._id)) return prev;
          return [notification, ...prev];
        });
      });
      
      return () => {
        socket?.disconnect();
      };
    }
  }, [isAuthenticated, user?._id]);
  // --- END SOCKET.IO ---

  const fetchNotifications = async () => {
    if (!isAuthenticated || !user?._id) return;
    
    setLoading(true);
    try {
      const data = await notificationService.getUserNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchNotifications();
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user?._id]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
  };



  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};