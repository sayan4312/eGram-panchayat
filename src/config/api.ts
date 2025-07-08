const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    
    ME: `${API_BASE_URL}/auth/me`,
    UPDATE_LANGUAGE: `${API_BASE_URL}/auth/me/language`,
  },
  // User endpoints
  USER: {
    SERVICES: `${API_BASE_URL}/user/services`,
    APPLICATIONS: `${API_BASE_URL}/user/applications`,
    SUBMIT_APPLICATION: `${API_BASE_URL}/user/applications`,
    UPLOAD_DOCUMENTS: `${API_BASE_URL}/user/upload-documents`,
  
    NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  },
  // Staff endpoints
  STAFF: {
    APPLICATIONS: `${API_BASE_URL}/staff/applications`,
  
  },
  // Admin endpoints
  ADMIN: {
    USERS: `${API_BASE_URL}/admin/users`,
    SERVICES: `${API_BASE_URL}/admin/services`,
    ANALYTICS: `${API_BASE_URL}/admin/analytics`,
    LOGS: `${API_BASE_URL}/admin/logs`,
    NOTIFICATIONS: `${API_BASE_URL}/notifications`,
    ANNOUNCEMENTS: `${API_BASE_URL}/admin/announcements`,
  },
};

export default API_BASE_URL;