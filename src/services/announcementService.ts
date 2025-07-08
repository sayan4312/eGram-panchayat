import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'users' | 'staff' | 'admin' | 'department';
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementData {
  title: string;
  message: string;
  targetAudience: 'all' | 'users' | 'staff' | 'admin' | 'department';
  startDate: string;
  endDate: string;
}

export const announcementService = {
  // Get all announcements (admin)
  getAllAnnouncements: async (): Promise<{ data: Announcement[] }> => {
    const response = await api.get(API_ENDPOINTS.ADMIN.ANNOUNCEMENTS);
    return response.data;
  },

  // Create new announcement (admin)
  createAnnouncement: async (data: CreateAnnouncementData): Promise<{ data: Announcement }> => {
    const response = await api.post(API_ENDPOINTS.ADMIN.ANNOUNCEMENTS, data);
    return response.data;
  },

  // Get public announcements (for users/staff)
  getPublicAnnouncements: async (): Promise<{ data: Announcement[] }> => {
    const response = await api.get('/announcements');
    return response.data;
  },
};

export default announcementService; 