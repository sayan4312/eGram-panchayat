import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle, 
  AlertCircle as AlertCircleIcon,
  Eye,
  Download,
  Calendar,
  User,
  Building,
  Plus,
  ArrowRight,
  Bell
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useApplications } from '../../hooks/useApplications';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { applications, loading } = useApplications();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Fetch announcements for the user
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements');
        setAnnouncements(res.data.data || []);
      } catch (e) {
        console.error('Error fetching announcements:', e);
        setAnnouncements([]);
      }
    };
    fetchAnnouncements();
  }, []);

  // Calculate stats from real data
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved' || app.status === 'completed').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  const recentApplications = applications
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const quickStats = [
    {
      title: t('dashboard.user.quickStats.totalApplications'),
      value: stats.total.toString(),
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: t('dashboard.user.quickStats.pending'),
      value: stats.pending.toString(),
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      title: t('dashboard.user.quickStats.approved'),
      value: stats.approved.toString(),
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: t('dashboard.user.quickStats.rejected'),
      value: stats.rejected.toString(),
      icon: AlertCircleIcon,
      color: 'bg-red-500',
    },
  ];

  const quickActions = [
    {
      title: t('dashboard.user.actions.applyNew.title'),
      description: t('dashboard.user.actions.applyNew.description'),
      icon: Plus,
      link: '/apply',
      color: 'bg-primary-500',
    },
    {
      title: t('dashboard.user.actions.viewApplications.title'),
      description: t('dashboard.user.actions.viewApplications.description'),
      icon: FileText,
      link: '/applications',
      color: 'bg-secondary-500',
    },
    {
      title: t('dashboard.user.actions.uploadDocuments.title'),
      description: t('dashboard.user.actions.uploadDocuments.description'),
      icon: ArrowRight,
      link: '/upload',
      color: 'bg-accent-500',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t('dashboard.user.title', { name: user?.name })}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            {t('dashboard.user.subtitle')}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8"
        >
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center">
                <div className={`p-2 sm:p-3 rounded-full ${stat.color} text-white mr-3 sm:mr-4`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Applications */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-1"
          >
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 h-full flex flex-col">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {t('dashboard.user.recentApplications')}
                  </h2>
                  <Link
                    to="/applications"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    {t('dashboard.user.viewAll')}
                  </Link>
                </div>
              </div>
              <div className="p-4 sm:p-6 flex-1">
                {recentApplications.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">Start by applying for a government service.</p>
                    <Link
                      to="/apply"
                      className="bg-primary-600 text-white px-4 py-3 sm:px-6 sm:py-3 rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base font-medium inline-block"
                    >
                      Apply for Service
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {recentApplications.map((application) => (
                      <div
                        key={application._id}
                        className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                              {application.service?.title || 'Unknown Service'}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Applied: {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              Tracking: {application.trackingId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                          <StatusBadge status={application.status as any} />
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="order-2 lg:order-2"
          >
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 h-full flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                {t('dashboard.user.quickActions')}
              </h2>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group min-h-[60px] sm:min-h-[70px]"
                  >
                    <div className={`p-2 sm:p-3 rounded-lg ${action.color} text-white mr-3 sm:mr-4 flex-shrink-0`}>
                      <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 group-hover:text-primary-600 text-sm sm:text-base">
                        {action.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

            {/* Profile Summary */}
          <div className="order-3 lg:order-3">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 h-full flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                {t('dashboard.user.profileSummary')}
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">{t('dashboard.user.profile.name')}</p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">{t('dashboard.user.profile.accountType')}</p>
                    <p className="font-medium text-gray-900 capitalize text-sm sm:text-base">{user?.role}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-gray-600">{t('dashboard.user.profile.memberSince')}</p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="order-4 lg:order-4">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 h-full flex flex-col">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-primary-500" />
                Announcements
              </h2>
              {announcements.length === 0 ? (
                <div className="text-center py-4 sm:py-6">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs sm:text-sm">No announcements at this time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div key={announcement._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 text-xs sm:text-sm truncate flex-1 mr-2">{announcement.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          announcement.targetAudience === 'all' ? 'bg-blue-100 text-blue-800' :
                          announcement.targetAudience === 'users' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {announcement.targetAudience === 'all' ? 'All Users' :
                           announcement.targetAudience === 'users' ? 'Citizens Only' :
                           announcement.targetAudience}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{announcement.message}</p>
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span className="truncate">
                          {announcement.startDate ? new Date(announcement.startDate).toLocaleDateString() : ''} - {announcement.endDate ? new Date(announcement.endDate).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                  {announcements.length > 3 && (
                    <div className="text-center pt-2">
                      <p className="text-primary-600 text-xs sm:text-sm font-medium">
                        +{announcements.length - 3} more announcements
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;