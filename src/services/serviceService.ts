import api from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Service {
  _id: string;
  title: string;
  description: string;
  department: string;
  category: string;
  requiredDocuments: string[];
  formFields: FormField[];
  processingTime: string;
  fee: string;
  isActive: boolean;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
}

export interface ServiceApplication {
  serviceId: string;
  formData: Record<string, any>;
}

class ServiceService {
  async getAllServices(): Promise<Service[]> {
    const response = await api.get(API_ENDPOINTS.USER.SERVICES);
    return response.data.data;
  }

  async getServiceById(id: string): Promise<Service> {
    const response = await api.get(`${API_ENDPOINTS.USER.SERVICES}/${id}`);
    return response.data.data;
  }

  async submitApplication(applicationData: ServiceApplication): Promise<any> {
    const response = await api.post(API_ENDPOINTS.USER.APPLICATIONS, applicationData);
    return response.data;
  }

  // Admin methods
  async createService(serviceData: Partial<Service>): Promise<Service> {
    const response = await api.post(API_ENDPOINTS.ADMIN.SERVICES, serviceData);
    return response.data.data;
  }

  async updateService(id: string, serviceData: Partial<Service>): Promise<Service> {
    const response = await api.put(`${API_ENDPOINTS.ADMIN.SERVICES}/${id}`, serviceData);
    return response.data.data;
  }

  async deleteService(id: string): Promise<void> {
    await api.delete(`${API_ENDPOINTS.ADMIN.SERVICES}/${id}`);
  }
}

export default new ServiceService();