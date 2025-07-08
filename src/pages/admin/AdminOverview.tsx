import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp, TrendingDown, Users as UsersIcon, Settings as SettingsIcon, AlertCircle as AlertCircleIcon, FileText as FileTextIcon, Activity, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Types for props
interface Stat {
  title: string;
  value: number | string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  color?: string;
  icon?: React.ElementType;
  trend?: number;
}
interface TopService {
  name: string;
  value: number;
  color?: string;
  growth?: number;
}
interface ApplicationVolume {
  department: string;
  applications: number;
  change?: number;
  color?: string;
}
interface MonthlyTrend {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
  total: number;
}
interface RecentActivity {
  _id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
  type: 'application' | 'staff' | 'service' | 'announcement';
}

interface AdminOverviewProps {
  lastUpdated: Date;
  timeRange: string;
  setTimeRange: (v: string) => void;
  loading: boolean;
  stats: Stat[];
  applicationVolumeData: ApplicationVolume[];
  topServicesData: TopService[];
  monthlyData: MonthlyTrend[];
  recentActivity: RecentActivity[];
  handleCreateStaff: () => void;
  handleCreateService: () => void;
  setIsAnnouncementModalOpen: (v: boolean) => void;
  setActiveTab: (tab: string) => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({
  lastUpdated,
  timeRange,
  setTimeRange,
  loading,
  stats,
  applicationVolumeData,
  topServicesData,
  monthlyData,
  recentActivity,
  handleCreateStaff,
  handleCreateService,
  setIsAnnouncementModalOpen,
  setActiveTab
}) => {
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
      case 'application': return 'bg-blue-100 text-blue-600';
      case 'staff': return 'bg-green-100 text-green-600';
      case 'service': return 'bg-purple-100 text-purple-600';
      case 'announcement': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with refresh controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="col-span-full flex justify-center py-12"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
              <span className="text-gray-600">Loading dashboard data...</span>
            </div>
          </motion.div>
        ) : stats.length > 0 ? (
          stats.map((stat: Stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : stat.changeType === 'decrease' ? (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    ) : (
                      <div className="h-3 w-3" />
                    )}
                    <p className={`text-sm ${
                      stat.changeType === 'increase' ? 'text-green-600' : 
                      stat.changeType === 'decrease' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {stat.change || '+0%'} from last month
                    </p>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.color || 'bg-gray-500'} text-white`}>
                  {stat.icon && <stat.icon className="h-6 w-6" />}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.p
            key="no-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 col-span-full text-center py-8"
          >
            No statistics available
          </motion.p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateStaff}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <UsersIcon className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Add Staff</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateService}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <SettingsIcon className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Add Service</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAnnouncementModalOpen(true)}
            className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <AlertCircleIcon className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-900">New Announcement</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('logs')}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <FileTextIcon className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">View Logs</span>
          </motion.button>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Application Volume by Department */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Applications by Department</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Total: {applicationVolumeData.reduce((sum, item) => sum + item.applications, 0)}</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={applicationVolumeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, 'Applications']}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Most Applied Services */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Most Applied Services</h3>
            <div className="text-sm text-gray-600">
              Total: {topServicesData.reduce((sum, item) => sum + item.value, 0)}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topServicesData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${value}`}
              >
                {topServicesData.map((entry: TopService, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {topServicesData.map((entry: TopService, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: entry.color || '#8884d8' }}
                  ></div>
                  <span className="truncate">{entry.name}</span>
                </div>
                <span className="font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Monthly Trends Line Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Application Trends</h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Rejected</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Pending</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, name]}
              labelStyle={{ color: '#374151' }}
            />
            <Line type="monotone" dataKey="approved" stroke="#10B981" strokeWidth={2} name="Approved" />
            <Line type="monotone" dataKey="rejected" stroke="#EF4444" strokeWidth={2} name="Rejected" />
            <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} name="Pending" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Activity Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button
            onClick={() => setActiveTab('activity')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentActivity.slice(0, 5).map((activity) => (
            <div key={activity._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-600">{activity.details}</p>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminOverview; 