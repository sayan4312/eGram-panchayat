import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock,
  Calendar,
  User,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useApplications } from '../../hooks/useApplications';
import { Application } from '../../services/applicationService';

const MyApplicationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const itemsPerPage = 10;

  const { applications, loading, error } = useApplications({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchTerm || undefined,
  });

  const statusOptions = [
    { value: 'all', label: t('applications.filters.allStatus') },
    { value: 'pending', label: t('applications.filters.pending') },
    { value: 'in-review', label: t('applications.filters.inReview') },
    { value: 'approved', label: t('applications.filters.approved') },
    { value: 'rejected', label: t('applications.filters.rejected') },
    { value: 'completed', label: t('applications.filters.completed') },
  ];

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.service?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.trackingId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'text-green-600';
      case 'in-review':
        return 'text-blue-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Applications</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">{t('applications.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('applications.subtitle')}
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('applications.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Applications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {paginatedApplications.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-600">You haven't submitted any applications yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applications.table.service')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applications.table.trackingId')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applications.table.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applications.table.appliedDate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('applications.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedApplications.map((application, index) => (
                    <motion.tr
                      key={application._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <FileText className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {application.service?.title || 'Unknown Service'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {application._id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {application.trackingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={application.status as any} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(application)}
                            className="text-primary-600 hover:text-primary-700 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t('common.view')}
                          </button>
                          {(application.status === 'approved' || application.status === 'completed') && application.certificate && (
                            <button className="text-green-600 hover:text-green-700 flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              {t('common.download')}
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </motion.div>

        {/* Application Details Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={t('applications.details.title')}
          size="lg"
        >
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('applications.details.service')}</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedApplication.service?.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('applications.details.trackingId')}</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedApplication.trackingId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('applications.details.status')}</label>
                  <div className="mt-1">
                    <StatusBadge status={selectedApplication.status as any} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('applications.details.appliedDate')}</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedApplication.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {selectedApplication.approvedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('applications.details.approvedDate')}</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(selectedApplication.approvedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedApplication.uploadedDocuments.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('applications.details.documentsSubmitted')}</label>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {selectedApplication.uploadedDocuments.map((doc, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>{doc.name}</span>
                        <StatusBadge status={doc.status as any} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedApplication.timeline.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
                  <div className="space-y-2">
                    {selectedApplication.timeline.map((entry, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{entry.status}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                          {entry.comment && (
                            <p className="text-xs text-gray-600 mt-1">{entry.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedApplication.rejectionReason && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('applications.details.comments')}</label>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className={`text-sm ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.rejectionReason}
                    </p>
                  </div>
                </div>
              )}

              {(selectedApplication.status === 'approved' || selectedApplication.status === 'completed') && selectedApplication.certificate && (
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    {t('applications.details.downloadCertificate')}
                  </button>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MyApplicationsPage;