import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Notification {
  _id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'system' | 'application' | 'announcement' | 'reminder';
  priority: 'low' | 'medium' | 'high';
  targetAudience: 'all' | 'users' | 'staff' | 'admin' | 'department';
  department?: string;
  relatedEntity?: {
    entityType: 'application' | 'service' | 'user';
    entityId: string;
  };
  isRead: boolean;
  readAt?: string;
  scheduledFor?: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

class NotificationService {
  async getUserNotifications(): Promise<Notification[]> {
    const response = await api.get(API_ENDPOINTS.USER.NOTIFICATIONS);
    return response.data.data;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await api.put(`${API_ENDPOINTS.USER.NOTIFICATIONS}/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await api.put(`${API_ENDPOINTS.USER.NOTIFICATIONS}/read-all`);
  }

  // Admin methods
  async sendNotification(notificationData: {
    title: string;
    message: string;
    type: string;
    targetAudience: string;
    department?: string;
    scheduledFor?: string;
    expiresAt?: string;
  }): Promise<Notification> {
    const response = await api.post(API_ENDPOINTS.ADMIN.NOTIFICATIONS, notificationData);
    return response.data.data;
  }


}

export default new NotificationService();