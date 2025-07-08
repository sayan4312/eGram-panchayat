import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Users, 
  Settings as SettingsIcon, 
  AlertCircle as AlertCircleIcon, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Search
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  upcoming: number;
}

const departmentColors: Record<string, string> = {
  Health: 'bg-green-100 text-green-800',
  Education: 'bg-blue-100 text-blue-800',
  Agriculture: 'bg-yellow-100 text-yellow-800',
  Welfare: 'bg-purple-100 text-purple-800',
  Certificates: 'bg-pink-100 text-pink-800',
  Water: 'bg-cyan-100 text-cyan-800',
  Housing: 'bg-orange-100 text-orange-800',
  Infrastructure: 'bg-gray-100 text-gray-800',
};

const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/staff/applications');
        const apps = res.data.data || [];
        const now = new Date();
        const upcoming = apps.filter((a: any) => a.status === 'pending' && a.deadline && new Date(a.deadline) > now && (new Date(a.deadline).getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000).length;
        setStats({
          total: apps.length,
          pending: apps.filter((a: any) => a.status === 'pending').length,
          approved: apps.filter((a: any) => a.status === 'approved').length,
          rejected: apps.filter((a: any) => a.status === 'rejected').length,
          upcoming,
        });
      } catch (e) {
        setStats({ total: 0, pending: 0, approved: 0, rejected: 0, upcoming: 0 });
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements');
        // Backend now handles all the filtering based on user role and target audience
        setAnnouncements(res.data.data || []);
      } catch (e) {
        console.error('Error fetching announcements:', e);
        setAnnouncements([]);
      }
    };
    fetchAnnouncements();
  }, [user?.department]);

  const department = user?.department || 'General';
  const deptColor = departmentColors[department] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary-500" />
                Staff Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Welcome back, <span className="font-semibold text-primary-700">{user?.name}</span>!</p>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`inline-flex items-center px-3 py-2 rounded-lg font-medium text-sm ${deptColor} border border-gray-200 shadow-sm`}
            > 
              <Users className="h-4 w-4 mr-2" />
              {department} Department
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          {[
            { icon: FileText, value: loading ? '-' : stats.total, label: 'Total Assigned', color: 'border-primary-500', iconColor: 'text-primary-500' },
            { icon: Clock, value: loading ? '-' : stats.pending, label: 'Pending', color: 'border-yellow-400', iconColor: 'text-yellow-500' },
            { icon: CheckCircle, value: loading ? '-' : stats.approved, label: 'Approved', color: 'border-green-500', iconColor: 'text-green-500' },
            { icon: AlertCircleIcon, value: loading ? '-' : stats.rejected, label: 'Rejected', color: 'border-red-500', iconColor: 'text-red-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex flex-col items-center border-t-4 border-l-4 border-gray-100 hover:shadow-lg transition-shadow"
              style={{ borderTopColor: stat.color.replace('border-', '').includes('primary') ? '#3b82f6' : stat.color.replace('border-', '').includes('yellow') ? '#fbbf24' : stat.color.replace('border-', '').includes('green') ? '#10b981' : '#ef4444' }}
            >
              <stat.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${stat.iconColor} mb-2`} />
              <div className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-gray-600 mt-1 text-xs sm:text-sm font-medium text-center">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ scale: 1.01, x: 5 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex items-center border-l-4 border-blue-500 hover:shadow-lg transition-shadow mb-6 sm:mb-8"
        >
          <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500 mr-4" />
          <div>
            <div className="text-base sm:text-lg font-bold text-gray-900">Upcoming Deadlines</div>
            <div className="text-gray-600 mt-1 text-sm">{loading ? '-' : stats.upcoming} applications due within 7 days</div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Announcements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                Announcements
              </h2>
              {announcements.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-center py-8"
                >
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No announcements at this time.</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((announcement, index) => (
                    <motion.div
                      key={announcement._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate flex-1 mr-2">
                          {announcement.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          announcement.targetAudience === 'all' ? 'bg-blue-100 text-blue-800' :
                          announcement.targetAudience === 'staff' ? 'bg-green-100 text-green-800' :
                          announcement.targetAudience === 'department' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {announcement.targetAudience === 'all' ? 'All Users' :
                           announcement.targetAudience === 'staff' ? 'Staff Only' :
                           announcement.targetAudience === 'department' ? 'Department' :
                           announcement.targetAudience}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{announcement.message}</p>
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        <span className="truncate">
                          {announcement.startDate ? new Date(announcement.startDate).toLocaleDateString() : ''} - {announcement.endDate ? new Date(announcement.endDate).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 h-full flex flex-col">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Quick Actions
              </h2>
              <div className="flex flex-col gap-3 sm:gap-4 flex-1">
                {[
                  {
                    icon: FileText,
                    title: 'Application Management',
                    subtitle: 'View, approve, and manage applications',
                    color: 'primary',
                    onClick: () => navigate('/staff/applications')
                  },
                  {
                    icon: SettingsIcon,
                    title: 'Document Review',
                    subtitle: 'Verify and comment on submitted documents',
                    color: 'blue',
                    onClick: () => navigate('/staff/review')
                  }
                ].map((action, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 bg-${action.color}-50 hover:bg-${action.color}-100 border border-${action.color}-200 text-${action.color}-700 font-semibold py-3 sm:py-4 px-4 rounded-lg shadow-sm transition-all duration-200 group min-h-[60px] sm:min-h-[70px]`}
                    onClick={action.onClick}
                  >
                    <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${action.color}-500 group-hover:scale-110 transition-transform`} />
                    <span className="flex flex-col items-start text-left">
                      <span className="text-sm sm:text-base">{action.title}</span>
                      <span className={`text-xs text-${action.color}-400 font-normal`}>{action.subtitle}</span>
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;