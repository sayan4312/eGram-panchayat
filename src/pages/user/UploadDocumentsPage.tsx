import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'error';
  progress: number;
  file: File;
}

interface UserDocument {
  _id: string;
  fileName: string;
  url: string;
  status: string;
  createdAt: string;
  applicationId?: {
    _id: string;
    serviceId?: {
      _id: string;
      title: string;
    };
  };
}

const UploadDocumentsPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedApplication, setSelectedApplication] = useState('');
  const [userDocuments, setUserDocuments] = useState<UserDocument[]>([]);
  const [userDocumentsLoading, setUserDocumentsLoading] = useState(true);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string>('');
  const [openServiceIds, setOpenServiceIds] = useState<string[]>([]);

  // Fetch all uploaded documents for the user
  useEffect(() => {
    const fetchUserDocuments = async () => {
      setUserDocumentsLoading(true);
      try {
        const res = await api.get('/upload/user-documents');
        setUserDocuments(res.data.data || []);
      } catch (err) {
        console.error('Error fetching user documents:', err);
        setUserDocuments([]);
      } finally {
        setUserDocumentsLoading(false);
      }
    };
    fetchUserDocuments();
  }, []);

  const refreshDocuments = async () => {
    setUserDocumentsLoading(true);
    try {
      const res = await api.get('/upload/user-documents');
      setUserDocuments(res.data.data || []);
    } catch (err) {
      console.error('Error refreshing documents:', err);
    } finally {
      setUserDocumentsLoading(false);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name}: Only PDF, JPG, PNG files are allowed`);
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: File size must be less than 5MB`);
        return;
      }

      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
        file, // <-- Store the actual File object
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate file upload progress
      const interval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => {
          if (f.id === fileId) {
            const newProgress = f.progress + 10;
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...f, progress: 100, status: 'uploaded' };
            }
            return { ...f, progress: newProgress };
          }
          return f;
        }));
      }, 200);
    });
  };

  const handleToggleService = (appId: string) => {
    setOpenServiceIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  // Group documents by applicationId
  const docsByApplication = userDocuments.reduce((acc, doc) => {
    const appId = doc.applicationId?._id;
    if (!appId) return acc;
    if (!acc[appId]) {
      acc[appId] = {
        serviceTitle: doc.applicationId?.serviceId?.title || 'N/A',
        applicationId: appId,
        documents: [] as UserDocument[],
      };
    }
    acc[appId].documents.push(doc);
    return acc;
  }, {} as Record<string, { serviceTitle: string; applicationId: string; documents: UserDocument[] }>);

  // Filter documents for the selected application
  const filteredDocuments = userDocuments.filter(
    (doc) => doc.applicationId?._id === selectedApplicationId
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Your Uploaded Documents</h1>
          <p className="text-gray-600 mt-2">
            Here you can view all documents you have uploaded for your applications.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Uploaded Documents</h2>
            <button
              onClick={refreshDocuments}
              disabled={userDocumentsLoading}
              className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {userDocumentsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          {userDocumentsLoading ? (
            <LoadingSpinner size="md" />
          ) : Object.keys(docsByApplication).length === 0 ? (
            <p className="text-gray-500">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.values(docsByApplication).map((app) => (
                <div key={app.applicationId} className="border rounded-lg">
                  <button
                    className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-primary-50 transition-colors rounded-t-lg focus:outline-none"
                    onClick={() => handleToggleService(app.applicationId)}
                  >
                    <span className="font-medium text-lg text-gray-900">{app.serviceTitle}</span>
                    <span className="text-xs text-gray-500">{app.applicationId}</span>
                    <svg
                      className={`w-5 h-5 ml-2 transform transition-transform ${openServiceIds.includes(app.applicationId) ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openServiceIds.includes(app.applicationId) && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded At</th>
                            <th className="px-4 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {app.documents.map((doc) => (
                            <tr key={doc._id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{doc.fileName}</td>
                              <td className="px-4 py-2 text-sm">
                                {doc.status === 'pending' && <span className="text-yellow-600">Pending</span>}
                                {doc.status === 'verified' && <span className="text-green-600">Verified</span>}
                                {doc.status === 'rejected' && <span className="text-red-600">Rejected</span>}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-2 text-sm">
                                {doc.url && (
                                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">View</a>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </motion.div>
      </div>
    </div>
  );
};

export default UploadDocumentsPage;