import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import MyApplicationsPage from './pages/user/MyApplicationsPage';
import ApplyForServicesPage from './pages/user/ApplyForServicesPage';
import UploadDocumentsPage from './pages/user/UploadDocumentsPage';

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffApplicationsPage from './pages/staff/StaffApplicationsPage';
import StaffDocumentReviewPage from './pages/staff/StaffDocumentReviewPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Shared pages
import LandingPage from './pages/shared/LandingPage';
import NotificationsPage from './pages/shared/NotificationsPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/apply"
                element={
                  <ProtectedRoute requiredRole="user">
                    <ApplyForServicesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute requiredRole="user">
                    <MyApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute requiredRole="user">
                    <UploadDocumentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Staff Routes */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute requiredRole="staff">
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/applications"
                element={
                  <ProtectedRoute requiredRole="staff">
                    <StaffApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/review"
                element={
                  <ProtectedRoute requiredRole="staff">
                    <StaffDocumentReviewPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />


              {/* Change Password Route */}
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePasswordPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Fallback routes */}
              <Route path="/unauthorized" element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h1>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                  </div>
                </div>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;