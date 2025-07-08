import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Application {
  _id: string;
  userId: string;
  serviceId: string;
  trackingId: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected' | 'completed';
  formData: Record<string, any>;
  uploadedDocuments: UploadedDocument[];
  timeline: TimelineEntry[];
  internalComments: InternalComment[];
  assignedTo?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;
  certificate?: {
    url: string;
    publicId: string;
    generatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
  // Populated fields
  service?: {
    title: string;
    department: string;
  };
  user?: {
    name: string;
    email: string;
  };
}

export interface UploadedDocument {
  name: string;
  url: string;
  publicId?: string;
  size: number;
  format: string;
  status: 'pending' | 'verified' | 'invalid';
  verifiedBy?: string;
  verificationComment?: string;
  verifiedAt?: string;
  uploadedAt: string;
}

export interface TimelineEntry {
  status: string;
  date: string;
  actor: string;
  comment?: string;
}

export interface InternalComment {
  by: string;
  message: string;
  date: string;
}

export interface ApplicationFilters {
  status?: string;
  dateRange?: string;
  search?: string;
  department?: string;
}

export interface SubmitApplicationData {
  serviceId: string;
  formData: Record<string, any>;
  trackingId?: string;
}

class ApplicationService {
  async submitApplication(data: SubmitApplicationData, files?: File[]): Promise<Application> {
    const formData = new FormData();
    formData.append('application', JSON.stringify(data));
    
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('documents', file);
      });
    }

    const response = await api.post(API_ENDPOINTS.USER.SUBMIT_APPLICATION, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  async getUserApplications(filters?: ApplicationFilters): Promise<Application[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await api.get(`${API_ENDPOINTS.USER.APPLICATIONS}?${params}`);
    return response.data.data;
  }

  async getApplicationById(id: string): Promise<Application> {
    const response = await api.get(`${API_ENDPOINTS.USER.APPLICATIONS}/${id}`);
    return response.data.data;
  }

  async uploadDocuments(applicationId: string, files: File[]): Promise<any> {
    const formData = new FormData();
    formData.append('applicationId', applicationId);
    files.forEach((file) => {
      formData.append('documents', file);
    });

    const response = await api.post(API_ENDPOINTS.USER.UPLOAD_DOCUMENTS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Staff methods
  async getStaffApplications(filters?: ApplicationFilters): Promise<Application[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await api.get(`${API_ENDPOINTS.STAFF.APPLICATIONS}?${params}`);
    return response.data.data;
  }

  async updateApplicationStatus(
    id: string, 
    status: string, 
    comment?: string
  ): Promise<Application> {
    const response = await api.put(`${API_ENDPOINTS.STAFF.APPLICATIONS}/${id}/status`, {
      status,
      comment,
    });
    return response.data.data;
  }

  async verifyDocument(
    applicationId: string,
    documentIndex: number,
    status: 'verified' | 'invalid',
    comment?: string
  ): Promise<Application> {
    const response = await api.put(
      `${API_ENDPOINTS.STAFF.APPLICATIONS}/${applicationId}/verify`,
      {
        documentIndex,
        status,
        comment,
      }
    );
    return response.data.data;
  }

  async addInternalComment(applicationId: string, message: string): Promise<Application> {
    const response = await api.post(
      `${API_ENDPOINTS.STAFF.APPLICATIONS}/${applicationId}/comment`,
      { message }
    );
    return response.data.data;
  }

  // Admin methods
  async getAllApplications(filters?: ApplicationFilters): Promise<Application[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await api.get(`${API_ENDPOINTS.ADMIN.SERVICES}?${params}`);
    return response.data.data;
  }
}

export default new ApplicationService();