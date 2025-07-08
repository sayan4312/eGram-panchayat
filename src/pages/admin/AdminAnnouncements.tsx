import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, AlertCircle as AlertCircleIcon, Eye, Calendar, User, Globe } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

// Types for props
interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: string[];
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  views?: number;
}

interface AdminAnnouncementsProps {
  announcements: Announcement[];
  loading: boolean;
  onAddAnnouncement: () => void;
  onEditAnnouncement: (id: string) => void;
  onDeleteAnnouncement: (id: string) => void;
  onViewAnnouncement: (id: string) => void;
}

const AdminAnnouncements: React.FC<AdminAnnouncementsProps> = ({ 
  announcements, 
  loading, 
  onAddAnnouncement, 
  onEditAnnouncement, 
  onDeleteAnnouncement,
  onViewAnnouncement 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Filter announcements based on search and filters
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || announcement.status === statusFilter;
    const matchesPriority = !priorityFilter || announcement.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Announcements Management</h2>
          <p className="text-gray-600 mt-1">Manage system announcements and notifications</p>
        </div>
        <button
          onClick={onAddAnnouncement}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search announcements by title, content, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      {/* Announcements Stats */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Total Announcements */}
          <div
            className="flex-1 bg-white rounded-xl shadow-md p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Total Announcements</p>
              <p className="text-2xl font-bold text-gray-900">{filteredAnnouncements.length}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
              <AlertCircleIcon className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          {/* Active Announcements */}
          <div
            className="flex-1 bg-white rounded-xl shadow-md p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Active</p>
              <p className="text-2xl font-bold text-green-600">{filteredAnnouncements.filter(a => a.status === 'active').length}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
              <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4-4" /></svg>
            </div>
          </div>
          {/* Inactive Announcements */}
          <div
            className="flex-1 bg-white rounded-xl shadow-md p-5 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Inactive</p>
              <p className="text-2xl font-bold text-gray-500">{filteredAnnouncements.filter(a => a.status === 'inactive').length}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M15 12H9" /></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading announcements...</p>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter || priorityFilter ? 'No announcements found matching your criteria.' : 'No announcements found.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden shadow-lg">
              <thead className="bg-gradient-to-r from-primary-50 to-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Announcement</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Target Audience</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredAnnouncements.map((announcement: Announcement, index) => (
                  <motion.tr
                    key={announcement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:shadow-md transition-all duration-200 rounded-xl group"
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Announcement column with icon/avatar, bold title, and subtitle */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center">
                          <AlertCircleIcon className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                          <div className="text-base font-bold text-gray-900 leading-tight mb-1">{announcement.title}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{announcement.content}</div>
                        </div>
                      </div>
                    </td>
                    {/* Status with colored badge and icon */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {announcement.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow-sm">
                          <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2l4-4" /></svg>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 shadow-sm">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M15 12H9" /></svg>
                          Inactive
                        </span>
                      )}
                    </td>
                    {/* Target Audience as pill badges with icon */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-wrap gap-2 items-center">
                        <svg className="h-4 w-4 text-primary-400 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        {(announcement.targetAudience && announcement.targetAudience.length > 0
                          ? announcement.targetAudience
                          : ['all']
                        ).map(aud => (
                          <span key={aud} className="inline-block px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-medium shadow-sm">
                            {aud}
                          </span>
                        ))}
                      </div>
                    </td>
                    {/* Actions as rounded icon buttons with tooltips and hover transitions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onViewAnnouncement(announcement.id)}
                          className="rounded-full p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors shadow-sm"
                          title="View announcement"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onEditAnnouncement(announcement.id)}
                          className="rounded-full p-2 bg-primary-50 hover:bg-primary-100 text-primary-600 transition-colors shadow-sm"
                          title="Edit announcement"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onDeleteAnnouncement(announcement.id)}
                          className="rounded-full p-2 bg-red-50 hover:bg-red-100 text-red-600 transition-colors shadow-sm"
                          title="Delete announcement"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements; 