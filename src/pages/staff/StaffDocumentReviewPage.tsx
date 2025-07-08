import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText as FileTextIcon, 
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
  MessageSquare,
  Upload,
  AlertCircle as AlertCircleIcon,
  ChevronDown,
  ChevronRight
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
  applicationId?: string;
  applicantName?: string;
  serviceTitle?: string;
}

interface UserDocuments {
  userId: string;
  userName: string;
  userEmail?: string;
  documents: Document[];
  isExpanded: boolean;
}

const StaffDocumentReviewPage: React.FC = () => {
  const { user } = useAuth();
  const [userDocuments, setUserDocuments] = useState<UserDocuments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all applications for staff's department
      const res = await api.get('/staff/applications');
      const apps = res.data.data || [];
      
      // Group documents by user
      const userDocsMap = new Map<string, UserDocuments>();
      
      apps.forEach((app: any) => {
        const userId = app.user?._id || app.userId;
        const userName = app.user?.name || app.applicantName || 'Unknown Applicant';
        const userEmail = app.user?.email;
        
        if (!userDocsMap.has(userId)) {
          userDocsMap.set(userId, {
            userId,
            userName,
            userEmail,
            documents: [],
            isExpanded: false
          });
        }
        
        const userDoc = userDocsMap.get(userId)!;
        (app.documents || []).forEach((doc: any) => {
          userDoc.documents.push({
            ...doc,
            applicationId: app._id,
            applicantName: userName,
            serviceTitle: app.service?.title || app.serviceTitle || 'Unknown Service'
          });
        });
      });
      
      // Convert map to array and sort by user name
      const userDocsArray = Array.from(userDocsMap.values()).sort((a, b) => 
        a.userName.localeCompare(b.userName)
      );
      
      // Debug: Log document statuses
      userDocsArray.forEach(userDoc => {
        userDoc.documents.forEach(doc => {
          console.log(`User: ${userDoc.userName}, Document: ${doc.name}, Status: ${doc.status}`);
        });
      });
      
      setUserDocuments(userDocsArray);
      
      if (userDocsArray.length === 0) {
        setError('No documents available for review in your department.');
      }
    } catch (e: any) {
      console.error('Error fetching documents:', e);
      const errorMessage = e.response?.data?.message || 'Failed to load documents';
      setError(errorMessage);
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const toggleUserExpanded = (userId: string) => {
    setUserDocuments(prev => prev.map(userDoc => 
      userDoc.userId === userId 
        ? { ...userDoc, isExpanded: !userDoc.isExpanded }
        : userDoc
    ));
  };

  const handleView = (doc: Document) => {
    setSelectedDoc(doc);
    setIsModalOpen(true);
  };

  const handleVerify = async (status: string) => {
    if (!selectedDoc) return;
    setProcessing(true);
    try {
      await api.put(`/staff/applications/${selectedDoc.applicationId}/documents/${encodeURIComponent(selectedDoc.name)}`, {
        status
      });
      toast.success(`Document marked as ${status}`);
      setIsModalOpen(false);
      fetchDocuments();
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || 'Failed to update document status';
      toast.error(errorMessage);
    }
    setProcessing(false);
  };

  const handleAddComment = async () => {
    if (!selectedDoc || !comment.trim()) return;
    setProcessing(true);
    try {
      await api.put(`/staff/applications/${selectedDoc.applicationId}/documents/${encodeURIComponent(selectedDoc.name)}`, {
        comment
      });
      toast.success('Comment added successfully');
      setComment('');
      fetchDocuments();
    } catch (e: any) {
      const errorMessage = e.response?.data?.message || 'Failed to add comment';
      toast.error(errorMessage);
    }
    setProcessing(false);
  };

  const filteredUserDocuments = userDocuments.map(userDoc => ({
    ...userDoc,
    documents: userDoc.documents.filter(doc => {
      const matchesSearch =
        doc.name?.toLowerCase().includes(search.toLowerCase()) ||
        userDoc.userName?.toLowerCase().includes(search.toLowerCase()) ||
        doc.serviceTitle?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
  })).filter(userDoc => userDoc.documents.length > 0);

  const totalDocuments = filteredUserDocuments.reduce((sum, userDoc) => sum + userDoc.documents.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Document Verification</h1>
          <div className="flex justify-center items-center h-40">
            <div className="text-gray-500">Loading documents...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Document Verification</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-8">
              <AlertCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Available</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchDocuments}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Document Verification</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by document, applicant, or service..."
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
            <option value="verified">Verified</option>
            <option value="invalid">Invalid</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Users ({filteredUserDocuments.length}) - Documents ({totalDocuments})
              </h2>
              <button
                onClick={fetchDocuments}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>

          {filteredUserDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500">
                {search || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No documents are currently available for review in your department.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUserDocuments.map((userDoc) => (
                <div key={userDoc.userId} className="p-6">
                  {/* User Header */}
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    onClick={() => toggleUserExpanded(userDoc.userId)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{userDoc.userName}</h3>
                        {userDoc.userEmail && (
                          <p className="text-sm text-gray-500">{userDoc.userEmail}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {userDoc.documents.length} document{userDoc.documents.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {userDoc.documents.map((doc, idx) => (
                          <div key={idx} className="w-2 h-2 rounded-full" style={{
                            backgroundColor: 
                              doc.status === 'verified' ? '#10b981' :
                              doc.status === 'invalid' ? '#ef4444' :
                              '#fbbf24'
                          }} />
                        ))}
                      </div>
                      {userDoc.isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Documents List */}
                  {userDoc.isExpanded && (
                    <div className="mt-4 ml-13">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                                <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left py-2 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {userDoc.documents.map((doc, idx) => (
                                <tr key={idx} className="hover:bg-white transition-colors">
                                  <td className="py-3 px-4 text-sm text-gray-900">
                                    {doc.serviceTitle}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-900">
                                    <div className="flex items-center gap-2">
                                      <FileTextIcon className="h-4 w-4 text-gray-400" />
                                      {doc.name}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <StatusBadge status={doc.status as any} />
                                  </td>
                                  <td className="py-3 px-4">
                                    <button 
                                      className="text-primary-600 hover:text-primary-700 flex items-center text-sm font-medium" 
                                      onClick={() => handleView(doc)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" /> Review
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document Review Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Document Review" size="md">
          {selectedDoc && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Applicant</label>
                <p className="text-sm text-gray-900 mt-1">{selectedDoc.applicantName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service</label>
                <p className="text-sm text-gray-900 mt-1">{selectedDoc.serviceTitle}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Document</label>
                <p className="text-sm text-gray-900 mt-1 flex items-center gap-2">
                                          <FileTextIcon className="h-4 w-4 text-gray-400" />
                  {selectedDoc.name}
                  {selectedDoc.url && (
                    <a 
                      href={selectedDoc.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline ml-2"
                    >
                      View Document
                    </a>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <StatusBadge status={selectedDoc.status as any} />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button 
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center" 
                  onClick={() => handleVerify('verified')} 
                  disabled={processing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {processing ? 'Processing...' : 'Verify'}
                </button>
                <button 
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center" 
                  onClick={() => handleVerify('invalid')} 
                  disabled={processing}
                >
                                          <AlertCircleIcon className="h-4 w-4 mr-2" />
                  {processing ? 'Processing...' : 'Reject'}
                </button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment about this document..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || processing}
                  className="mt-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {processing ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StaffDocumentReviewPage; 