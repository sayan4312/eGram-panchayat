import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Calendar, BarChart3, Users as UsersIcon, Settings as SettingsIcon, FileText as FileTextIcon, AlertCircle as AlertCircleIcon, RefreshCw, TrendingUp, TrendingDown, Activity, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import announcementService from '../../services/announcementService';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminOverview from './AdminOverview';
import AdminStaff from './AdminStaff';
import AdminServices from './AdminServices';
import AdminLogs from './AdminLogs';
import AdminAnnouncements from './AdminAnnouncements';
import { fetchStaffPositions } from '../../services/api';

// Type definitions
type Staff = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role?: string;
  isActive: boolean;
  applicationsHandled?: number;
  lastLogin?: string;
  performance?: number;
  position?: string; // <-- Add this line
};

type Service = {
  _id: string;
  title: string;
  description: string;
  department: string;
  processingTime?: string;
  fee?: string;
  status: string;
  applicationCount?: number;
  successRate?: number;
  avgProcessingTime?: number;
  requiredDocuments?: string[];
  category?: string; // Added category to Service type
};

type Stat = {
  title: string;
  value: number | string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  color?: string;
  icon?: React.ElementType;
  trend?: number;
};

type Announcement = {
  _id: string;
  title: string;
  message: string;
  targetAudience: string;
  startDate: string;
  endDate: string;
  status: string;
  views?: number;
  engagement?: number;
};

type ApplicationVolume = {
  department: string;
  applications: number;
  change?: number;
  color?: string;
};

type TopService = {
  name: string;
  value: number;
  color?: string;
  growth?: number;
};

type MonthlyTrend = {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
  total: number;
};

type RecentActivity = {
  _id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
  type: 'application' | 'staff' | 'service' | 'announcement';
};

// Departments for dropdowns
const departments = [
  { id: '1', name: 'General Administration' },
  { id: '2', name: 'Revenue' },
  { id: '3', name: 'Public Works' },
  { id: '4', name: 'Health' },
  { id: '5', name: 'Education' },
  { id: '6', name: 'Welfare' },
  { id: '7', name: 'Water Supply' },
  { id: '8', name: 'Sanitation' },
  { id: '9', name: 'Other' },
];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isViewAnnouncementModalOpen, setIsViewAnnouncementModalOpen] = useState(false);
  const [isEditAnnouncementModalOpen, setIsEditAnnouncementModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Data states
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [applicationVolumeData, setApplicationVolumeData] = useState<ApplicationVolume[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyTrend[]>([]);
  const [topServicesData, setTopServicesData] = useState<TopService[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [positions, setPositions] = useState<string[]>([]);

  // Form states for service modal
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    description: '',
    department: '',
    processingTime: '',
    fee: '',
    category: '',
    requiredDocuments: '',
    status: 'active'
  });

  // Loading and refresh states
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Filters and search
  const [roleFilter, setRoleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [categoryFilter, setCategoryFilter] = useState('');

  const { user: currentUser } = useAuth();

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  useEffect(() => {
    fetchStaffPositions().then(setPositions).catch(() => setPositions([]));
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStaff(),
        fetchServices(),
        fetchAnnouncements(),
        fetchLogs(),
        fetchStats(),
        fetchCharts(),
        fetchRecentActivity()
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/admin/staff');
      setStaffMembers(res.data.data);
    } catch (err) {
      toast.error('Failed to load staff members');
    }
  };

  const fetchServices = async () => {
    try {
      const res = await api.get('/admin/services');
      setServices(res.data.data);
    } catch (err) {
      toast.error('Failed to load services');
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.getAllAnnouncements();
      setAnnouncements(res.data);
    } catch (err) {
      toast.error('Failed to load announcements');
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/logs');
      setLogs(res.data.data);
    } catch (err) {
      toast.error('Failed to load logs');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      toast.error('Failed to fetch dashboard stats');
    }
  };

  const fetchCharts = async () => {
    try {
      const res = await api.get('/admin/charts');
      setApplicationVolumeData(res.data.volume);
      setMonthlyData(res.data.monthly);
      setTopServicesData(res.data.topServices);
    } catch (err) {
      toast.error('Chart data fetch failed');
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await api.get('/admin/recent-activity');
      setRecentActivity(res.data.data);
    } catch (err) {
      console.error('Failed to fetch recent activity');
    }
  };

  // Open Staff Modal for Create
  const handleCreateStaff = () => {
    setSelectedStaff(null);
    setIsStaffModalOpen(true);
  };

  // Open Staff Modal for Edit
  const handleEditStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsStaffModalOpen(true);
  };

  // Create or Update Staff
  const handleStaffSubmit = async (formData: any) => {
    try {
      const payload = {
        ...formData,
        isActive: formData.status === 'active',
      };
      if (selectedStaff) {
        // Edit existing staff
        const res = await api.put(`/admin/staff/${selectedStaff._id}`, payload);
        toast.success('Staff updated successfully');
      } else {
        // Create new staff
        const res = await api.post('/admin/staff', payload);
        toast.success('Staff created successfully');
      }
      setIsStaffModalOpen(false);
      fetchStaff(); // Refresh staff list
    } catch (err) {
      toast.error('Failed to save staff member');
    }
  };

  // Open Service Modal for Create
  const handleCreateService = () => {
    setSelectedService(null);
    // Reset form data
    setServiceFormData({
      name: '',
      description: '',
      department: '',
      processingTime: '',
      fee: '',
      category: '',
      requiredDocuments: '',
      status: 'active'
    });
    setIsServiceModalOpen(true);
  };

  // Open Service Modal for Edit
  const handleEditService = (service: Service) => {
    setSelectedService(service);
    // Populate form data with service data
    setServiceFormData({
      name: service.title || '',
      description: service.description || '',
      department: service.department || '',
      processingTime: service.processingTime || '',
      fee: service.fee || '',
      category: service.category || '', // Using department as category for now
      requiredDocuments: service.requiredDocuments?.join(', ') || '',
      status: service.status || 'active'
    });
    setIsServiceModalOpen(true);
  };

  // Create or Update Service
  const handleServiceSubmit = async (formData: any) => {
    try {
      if (selectedService) {
        // Edit existing service
        const res = await api.put(`/admin/services/${selectedService._id}`, formData);
        toast.success('Service updated successfully');
      } else {
        // Create new service
        const res = await api.post('/admin/services', formData);
        toast.success('Service created successfully');
      }
      setIsServiceModalOpen(false);
      fetchServices(); // Refresh services list
    } catch (err) {
      toast.error('Failed to save service');
    }
  };

  // Delete Staff
  const handleDeleteStaff = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await api.delete(`/admin/staff/${id}`);
        toast.success('Staff member deleted');
        fetchStaff();
      } catch (err) {
        toast.error('Failed to delete staff member');
      }
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/admin/services/${id}`);
        toast.success('Service deleted');
        fetchServices();
      } catch (err) {
        toast.error('Failed to delete service');
      }
    }
  };

  // Announcement handlers
  const handleCreateAnnouncement = () => {
    setSelectedAnnouncement(null);
    setIsAnnouncementModalOpen(true);
  };

  // Update handleEditAnnouncement to open the edit modal
  const handleEditAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsEditAnnouncementModalOpen(true);
  };

  const handleAnnouncementSubmit = async (formData: any) => {
    try {
      if (selectedAnnouncement) {
        // Edit existing announcement
        const res = await api.put(`/admin/announcements/${selectedAnnouncement._id}`, formData);
        toast.success('Announcement updated successfully');
      } else {
        // Create new announcement
        const res = await api.post('/admin/announcements', formData);
        toast.success('Announcement created successfully');
      }
      setIsAnnouncementModalOpen(false);
      fetchAnnouncements(); // Refresh announcements list
    } catch (err) {
      toast.error('Failed to save announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.delete(`/admin/announcements/${id}`);
        toast.success('Announcement deleted');
        fetchAnnouncements();
      } catch (err) {
        toast.error('Failed to delete announcement');
      }
    }
  };

  // Update handleViewAnnouncement to open the view modal
  const handleViewAnnouncement = async (id: string) => {
    try {
      const res = await api.get(`/admin/announcements/${id}`);
      setSelectedAnnouncement(res.data.data);
      setIsViewAnnouncementModalOpen(true);
    } catch (err) {
      toast.error('Failed to load announcement details');
    }
  };

  // Filter functions
  const filteredStaff = staffMembers.filter(staff => 
    (staff.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (staff.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (staff.department?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredServices = services.filter(service =>
    (service.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (service.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (service.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const uniqueCategories = Array.from(
    new Set(services.map(service => service.category).filter(Boolean))
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application': return <FileTextIcon className="h-4 w-4" />;
      case 'staff': return <UsersIcon className="h-4 w-4" />;
      case 'service': return <SettingsIcon className="h-4 w-4" />;
      case 'announcement': return <AlertCircleIcon className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'application': return 'text-blue-600 bg-blue-100';
      case 'staff': return 'text-green-600 bg-green-100';
      case 'service': return 'text-purple-600 bg-purple-100';
      case 'announcement': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  type Log = {
    _id: string;
    performedBy?: {
      name?: string;
      email?: string;
    };
    role?: string;
    action?: string;
    details?: string;
    metadata?: { url?: string };
    createdAt: string;
  };

  const renderRecentActivity = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        {recentActivity.length === 0 ? (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-500"
          >
            No recent activity.
          </motion.p>
        ) : (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <motion.div
                    key={activity._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-600">{activity.details}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
      </div>
    </div>
  );


  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'staff', label: 'Staff Management', icon: UsersIcon },
    { id: 'services', label: 'Service Management', icon: SettingsIcon },
    { id: 'logs', label: 'System Logs', icon: FileTextIcon },
    { id: 'announcements', label: 'Announcements', icon: AlertCircleIcon },
    { id: 'activity', label: 'Recent Activity', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage Gram Panchayat operations, staff, services, and monitor application analytics.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'overview' && (
            <AdminOverview
              lastUpdated={lastUpdated}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              loading={loading}
              stats={stats}
              applicationVolumeData={applicationVolumeData}
              topServicesData={topServicesData}
              monthlyData={monthlyData}
              recentActivity={recentActivity}
              handleCreateStaff={handleCreateStaff}
              handleCreateService={handleCreateService}
              setIsAnnouncementModalOpen={setIsAnnouncementModalOpen}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 'staff' && (
            <AdminStaff
              staff={staffMembers.map(s => ({
                id: s._id,
                name: s.name,
                email: s.email,
                phone: s.phone,
                department: s.department,
                role: s.role || '', // fallback for required prop
                position: s.position || '',
                status: s.isActive ? 'Active' : 'Inactive',
                performance: s.performance,
                applicationsHandled: s.applicationsHandled,
                lastLogin: s.lastLogin,
                createdAt: s.lastLogin || ''
              }))}
              loading={loading}
              positions={positions}
              onAddStaff={handleCreateStaff}
              onEditStaff={(id: string) => {
                const staff = staffMembers.find(s => s._id === id);
                if (staff) handleEditStaff(staff);
              }}
              onDeleteStaff={(id: string) => handleDeleteStaff(id)}
            />
          )}
          {activeTab === 'services' && (
            <AdminServices
              services={services.map(s => ({
                id: s._id,
                name: s.title,
                description: s.description,
                department: s.department,
                category: s.category || '',
                status: s.status,
                applicationsCount: s.applicationCount,
                avgProcessingTime: s.avgProcessingTime,
                successRate: s.successRate,
                requirements: s.requiredDocuments || [],
                createdAt: (s as any).createdAt || ''
              }))}
              loading={loading}
              onAddService={handleCreateService}
              onEditService={(id: string) => {
                const service = services.find(s => s._id === id);
                if (service) handleEditService(service);
              }}
              onDeleteService={(id: string) => handleDeleteService(id)}
            />
          )}
          {activeTab === 'logs' && (
            <AdminLogs
              logs={logs.map(l => ({
                id: l._id,
                timestamp: l.createdAt,
                level: 'info' as const,
                message: l.action || l.details || 'System activity',
                user: l.performedBy?.name || l.performedBy?.email || 'Unknown',
                action: l.action || '',
                details: l.details || l.metadata?.url || '',
                ipAddress: '',
                userAgent: '',
                performedBy: l.performedBy
              }))}
              loading={loading}
            />
          )}
          {activeTab === 'announcements' && (
            <AdminAnnouncements
              announcements={announcements.map(a => ({
                id: a._id,
                title: a.title,
                content: a.message,
                author: a.targetAudience,
                status: a.status,
                priority: 'medium' as const,
                targetAudience: [a.targetAudience],
                publishedAt: a.startDate,
                expiresAt: a.endDate,
                createdAt: a.startDate,
                views: a.views
              }))}
              loading={loading}
              onAddAnnouncement={handleCreateAnnouncement}
              onEditAnnouncement={(id: string) => {
                const announcement = announcements.find(a => a._id === id);
                if (announcement) handleEditAnnouncement(announcement);
              }}
              onDeleteAnnouncement={handleDeleteAnnouncement}
              onViewAnnouncement={handleViewAnnouncement}
            />
          )}
          {activeTab === 'activity' && renderRecentActivity()}
        </motion.div>

        {/* Announcement View Modal */}
        <Modal
          isOpen={isViewAnnouncementModalOpen && !!selectedAnnouncement}
          onClose={() => setIsViewAnnouncementModalOpen(false)}
          title={selectedAnnouncement?.title || 'Announcement Details'}
          size="md"
        >
          {selectedAnnouncement ? (
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1">Content</span>
                <div className="text-base text-gray-900 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  {selectedAnnouncement.message}
                </div>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">Status</span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${selectedAnnouncement.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{selectedAnnouncement.status === 'active' ? 'Active' : 'Inactive'}</span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-1">Target Audience</span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                    {selectedAnnouncement.targetAudience}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No announcement selected.</div>
          )}
        </Modal>

        {/* Announcement Edit Modal */}
        <Modal
          isOpen={isEditAnnouncementModalOpen && !!selectedAnnouncement}
          onClose={() => setIsEditAnnouncementModalOpen(false)}
          title={selectedAnnouncement ? 'Edit Announcement' : 'Create System Announcement'}
          size="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const announcementData = {
                title: (form.elements.namedItem('title') as HTMLInputElement)?.value,
                message: (form.elements.namedItem('message') as HTMLInputElement)?.value,
                targetAudience: (form.elements.namedItem('targetAudience') as HTMLSelectElement)?.value,
                startDate: (form.elements.namedItem('startDate') as HTMLInputElement)?.value,
                endDate: (form.elements.namedItem('endDate') as HTMLInputElement)?.value,
                status: (form.elements.namedItem('status') as HTMLSelectElement)?.value,
              };
              handleAnnouncementSubmit(announcementData);
              setIsEditAnnouncementModalOpen(false);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                name="title"
                type="text"
                defaultValue={selectedAnnouncement?.title || ''}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="message"
                rows={4}
                defaultValue={selectedAnnouncement?.message || ''}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  name="targetAudience"
                  defaultValue={selectedAnnouncement?.targetAudience || 'all'}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="users">Citizens Only</option>
                  <option value="staff">Staff Only</option>
                  <option value="admin">Admin Only</option>
                  <option value="department">Department Specific</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={selectedAnnouncement?.status || 'active'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  name="startDate"
                  type="datetime-local"
                  defaultValue={selectedAnnouncement?.startDate ? new Date(selectedAnnouncement.startDate).toISOString().slice(0, 16) : ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  name="endDate"
                  type="datetime-local"
                  defaultValue={selectedAnnouncement?.endDate ? new Date(selectedAnnouncement.endDate).toISOString().slice(0, 16) : ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsEditAnnouncementModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                {selectedAnnouncement ? 'Update' : 'Create'} Announcement
              </button>
            </div>
          </form>
        </Modal>

        <Modal
  isOpen={isStaffModalOpen}
  onClose={() => setIsStaffModalOpen(false)}
  title={selectedStaff ? 'Edit Staff Member' : 'Add Staff Member'}
  size="lg"
>
  <form
    onSubmit={(e) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const name = (form.elements.namedItem('name') as HTMLInputElement)?.value.trim();
      const email = (form.elements.namedItem('email') as HTMLInputElement)?.value.trim();
      const phone = (form.elements.namedItem('phone') as HTMLInputElement)?.value.trim();
      const department = (form.elements.namedItem('department') as HTMLSelectElement)?.value.trim();
      const position = (form.elements.namedItem('position') as HTMLSelectElement)?.value.trim();
      const status = (form.elements.namedItem('status') as HTMLSelectElement)?.value.trim();
      if (!name || !email || !phone || !department || !position || !status) {
        toast.error('All fields are required.');
        return;
      }
      const formData = { name, email, phone, department, position, status };
      if (selectedStaff) {
        handleStaffSubmit(formData);
      } else {
        handleStaffSubmit(formData);
      }
      setIsStaffModalOpen(false);
    }}
    className="space-y-4"
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          name="name"
          type="text"
          defaultValue={selectedStaff?.name || ''}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={selectedStaff?.email || ''}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          name="phone"
          type="tel"
          defaultValue={selectedStaff?.phone || ''}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
        <select
          name="department"
          defaultValue={selectedStaff?.department || ''}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.name}>{dept.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
        <select
          name="position"
          defaultValue={selectedStaff?.position || 'Officer'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {positions.map(pos => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          defaultValue={selectedStaff ? (selectedStaff.isActive ? 'active' : 'inactive') : 'active'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <div className="flex gap-4 pt-4">
      <button
        type="button"
        onClick={() => setIsStaffModalOpen(false)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
      >
        {selectedStaff ? 'Update' : 'Create'} Staff Member
      </button>
    </div>
  </form>
</Modal>


         <Modal
  isOpen={isServiceModalOpen}
  onClose={() => setIsServiceModalOpen(false)}
  title={selectedService ? 'Edit Service' : 'Add New Service'}
  size="lg"
>
  <form
    onSubmit={(e) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const serviceData = {
        title: (form.elements.namedItem('name') as HTMLInputElement)?.value, // Use 'title' for backend
        description: (form.elements.namedItem('description') as HTMLInputElement)?.value,
        department: (form.elements.namedItem('department') as HTMLSelectElement)?.value,
        processingTime: (form.elements.namedItem('processingTime') as HTMLInputElement)?.value,
        fee: (form.elements.namedItem('fee') as HTMLInputElement)?.value,
        category: (form.elements.namedItem('category') as HTMLSelectElement)?.value,
        requiredDocuments: ((form.elements.namedItem('requiredDocuments') as HTMLInputElement)?.value || '').split(',').map(s => s.trim()).filter(Boolean),
        formFields: [
          {
            name: 'aadhaarNumber',
            label: 'Aadhaar Number',
            type: 'text',
            required: true
          }
        ],
        status: (form.elements.namedItem('status') as HTMLSelectElement)?.value,
      };
      if (selectedService) {
        handleServiceSubmit(serviceData);
      } else {
        handleServiceSubmit(serviceData);
      }
      setIsServiceModalOpen(false);
    }}
    className="space-y-4"
  >
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
      <input
        name="name"
        type="text"
        value={serviceFormData.name}
        onChange={(e) => setServiceFormData({...serviceFormData, name: e.target.value})}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
      <textarea
        name="description"
        rows={3}
        value={serviceFormData.description}
        onChange={(e) => setServiceFormData({...serviceFormData, description: e.target.value})}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
        <select
          name="department"
          value={serviceFormData.department}
          onChange={(e) => setServiceFormData({...serviceFormData, department: e.target.value})}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.name}>{dept.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Processing Time</label>
        <input
          name="processingTime"
          type="text"
          placeholder="e.g., 15-20 days"
          value={serviceFormData.processingTime}
          onChange={(e) => setServiceFormData({...serviceFormData, processingTime: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fee</label>
        <input
          name="fee"
          type="text"
          placeholder="e.g., Free or ₹100"
          value={serviceFormData.fee}
          onChange={(e) => setServiceFormData({...serviceFormData, fee: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          name="category"
          value={serviceFormData.category}
          onChange={(e) => setServiceFormData({...serviceFormData, category: e.target.value})}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Select Category</option>
          <option value="general">General</option>
          <option value="revenue">Revenue</option>
          <option value="public-works">Public Works</option>
          <option value="health">Health</option>
          <option value="education">Education</option>
          <option value="welfare">Welfare</option>
          <option value="water-supply">Water Supply</option>
          <option value="sanitation">Sanitation</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Required Documents (comma separated)</label>
        <input
          name="requiredDocuments"
          type="text"
          placeholder="e.g., Aadhaar Card, Ration Card"
          value={serviceFormData.requiredDocuments}
          onChange={(e) => setServiceFormData({...serviceFormData, requiredDocuments: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          value={serviceFormData.status}
          onChange={(e) => setServiceFormData({...serviceFormData, status: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <div className="flex gap-4 pt-4">
      <button
        type="button"
        onClick={() => setIsServiceModalOpen(false)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
      >
        {selectedService ? 'Update' : 'Create'} Service
      </button>
    </div>
  </form>
</Modal>


         <Modal
  isOpen={isAnnouncementModalOpen}
  onClose={() => setIsAnnouncementModalOpen(false)}
  title={selectedAnnouncement ? 'Edit Announcement' : 'Create System Announcement'}
  size="lg"
>
  <form
    onSubmit={(e) => {
      e.preventDefault();
        const form = e.target as HTMLFormElement;
      const announcementData = {
        title: (form.elements.namedItem('title') as HTMLInputElement)?.value,
        message: (form.elements.namedItem('message') as HTMLInputElement)?.value,
        targetAudience: (form.elements.namedItem('targetAudience') as HTMLSelectElement)?.value,
        startDate: (form.elements.namedItem('startDate') as HTMLInputElement)?.value,
        endDate: (form.elements.namedItem('endDate') as HTMLInputElement)?.value,
        status: (form.elements.namedItem('status') as HTMLSelectElement)?.value,
      };
      handleAnnouncementSubmit(announcementData);
    }}
    className="space-y-4"
  >
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
      <input
        name="title"
        type="text"
        defaultValue={selectedAnnouncement?.title || ''}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
      <textarea
        name="message"
        rows={4}
        defaultValue={selectedAnnouncement?.message || ''}
        required
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
        <select
          name="targetAudience"
          defaultValue={selectedAnnouncement?.targetAudience || 'all'}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="all">All Users</option>
          <option value="users">Citizens Only</option>
          <option value="staff">Staff Only</option>
          <option value="admin">Admin Only</option>
          <option value="department">Department Specific</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          defaultValue={selectedAnnouncement?.status || 'active'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
        <input
          name="startDate"
          type="datetime-local"
          defaultValue={selectedAnnouncement?.startDate ? new Date(selectedAnnouncement.startDate).toISOString().slice(0, 16) : ''}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
        <input
          name="endDate"
          type="datetime-local"
          defaultValue={selectedAnnouncement?.endDate ? new Date(selectedAnnouncement.endDate).toISOString().slice(0, 16) : ''}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>
    </div>

    <div className="flex gap-4 pt-4">
      <button
        type="button"
        onClick={() => setIsAnnouncementModalOpen(false)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
      >
        {selectedAnnouncement ? 'Update' : 'Create'} Announcement
      </button>
    </div>
  </form>
</Modal>

      </div>
    </div>
  );
};

export default AdminDashboard;