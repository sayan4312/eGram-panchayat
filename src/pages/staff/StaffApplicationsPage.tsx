import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';

interface Document {
  _id?: string;
  name: string;
  url: string;
  publicId?: string;
  size?: number;
  format?: string;
  status: string;
  uploadedAt?: string;
}

interface Application {
  _id: string;
  trackingId: string;
  status: string;
  createdAt: string;
  applicantName?: string;
  user?: {
    name: string;
  };
  service?: {
    title: string;
    department: string;
  };
  documents?: Document[];
  timeline?: any[];
}

const StaffApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remark, setRemark] = useState('');
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/applications');
      setApplications(res.data.data || []);
    } catch (e) {
      toast.error('Failed to load applications');
    }
    setLoading(false);
  };

  const handleViewDetails = (app: Application) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (status: string) => {
    if (!selectedApplication) return;
    setProcessing(true);
    try {
      await api.put(`/staff/applications/${selectedApplication._id}/status`, { status });
      toast.success('Application status updated');
      setIsModalOpen(false);
      fetchApplications();
    } catch (e) {
      toast.error('Failed to update status');
    }
    setProcessing(false);
  };

  const handleAddRemark = async () => {
    if (!selectedApplication || !remark.trim()) return;
    setProcessing(true);
    try {
      await api.post(`/staff/applications/${selectedApplication._id}/comment`, { message: remark });
      toast.success('Remark added');
      setRemark('');
      fetchApplications();
    } catch (e) {
      toast.error('Failed to add remark');
    }
    setProcessing(false);
  };

  // Processing time calculation
  const getProcessingTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 'Today' : `${diff} day(s)`;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      app.service?.title?.toLowerCase().includes(search.toLowerCase()) ||
      app.trackingId?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Management</h1>
        <p className="text-gray-600 mb-6">Track and manage all assigned applications in one place.</p>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by service name or tracking ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            </span>
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">Loading...</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow p-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processing Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((app, idx) => (
                  <tr key={app._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{app.applicantName || app.user?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{app.service?.title || 'Unknown Service'}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={app.status as any} /></td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getProcessingTime(app.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-primary-600 hover:text-primary-700 flex items-center" onClick={() => handleViewDetails(app)}>
                        <Eye className="h-4 w-4 mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Application Details Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Application Details" size="lg">
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Service</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedApplication.service?.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tracking ID</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedApplication.trackingId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1"><StatusBadge status={selectedApplication.status as any} /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted</label>
                  <p className="text-sm text-gray-900 mt-1">{new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Uploaded Documents */}
              {selectedApplication.documents && selectedApplication.documents.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Uploaded Documents</label>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {selectedApplication.documents.map((doc, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>{doc.name}</span>
                        <span>
                          {doc.url && (
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mr-2">View</a>
                          )}
                          <StatusBadge status={doc.status as any} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Approve/Reject Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center" onClick={() => handleStatusUpdate('approved')} disabled={processing}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Approve
                </button>
                <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center" onClick={() => handleStatusUpdate('rejected')} disabled={processing}>
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </button>
              </div>

              {/* Add Remark */}
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-1">Add Remark</label>
                <div className="flex gap-2">
                  <input type="text" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" value={remark} onChange={e => setRemark(e.target.value)} disabled={processing} />
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors" onClick={handleAddRemark} disabled={processing || !remark.trim()}>
                    <MessageSquare className="h-4 w-4 mr-1" /> Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StaffApplicationsPage; 