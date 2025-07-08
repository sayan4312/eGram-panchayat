import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle as AlertCircleIcon,
  Plus,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useServices } from '../../hooks/useServices';
import serviceService from '../../services/serviceService';
import applicationService from '../../services/applicationService';
import { useForm, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/common/Modal';

interface ServiceApplication {
  serviceId: string;
  formData: Record<string, any>;
}

const ApplyForServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [uploadedDocs, setUploadedDocs] = useState<{ [docName: string]: File | null }>({});
  const [docUploadErrors, setDocUploadErrors] = useState<{ [docName: string]: string }>({});

  const { services, loading, error } = useServices();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ServiceApplication>();

  const categories = [
    { id: 'all', name: t('services.categories.all'), icon: FileText },
    { id: 'general', name: 'General', icon: FileText },
    { id: 'revenue', name: 'Revenue', icon: FileText },
    { id: 'public-works', name: 'Public Works', icon: Building },
    { id: 'health', name: 'Health', icon: User },
    { id: 'education', name: 'Education', icon: FileText },
    { id: 'welfare', name: 'Welfare', icon: User },
    { id: 'water-supply', name: 'Water Supply', icon: ArrowRight },
    { id: 'sanitation', name: 'Sanitation', icon: FileText },
    { id: 'other', name: 'Other', icon: FileText },
  ];

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory && service.isActive;
  });

  const handleApplyClick = (service: any) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleDocChange = (docName: string, file: File | null) => {
    setUploadedDocs(prev => ({ ...prev, [docName]: file }));
    setDocUploadErrors(prev => ({ ...prev, [docName]: '' }));
  };

  const onSubmit = async (data: any) => {
    if (!selectedService) return;

    // Validate required document uploads
    const missingDocs = (selectedService.requiredDocuments || []).filter((doc: string) => !uploadedDocs[doc]);
    if (missingDocs.length > 0) {
      const errors: { [docName: string]: string } = {};
      missingDocs.forEach((doc: string) => { errors[doc] = 'This document is required'; });
      setDocUploadErrors(errors);
      toast.error('Please upload all required documents');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare form data
      let flatData = { ...data };
      while (flatData.formData && typeof flatData.formData === 'object') {
        flatData = { ...flatData, ...flatData.formData };
        delete flatData.formData;
      }
      
      const applicationData = {
        serviceId: selectedService._id,
        formData: flatData,
      };

      // Convert uploadedDocs object to array of files
      const files = Object.values(uploadedDocs).filter(file => file !== null) as File[];

      // Submit application to backend
      const result = await applicationService.submitApplication(applicationData, files);
      
      toast.success(t('success.applicationSubmitted', { service: selectedService.title }));
      reset();
      setIsModalOpen(false);
      setUploadedDocs({});
      setDocUploadErrors({});
      navigate('/applications');
    } catch (error: any) {
      console.error('Application submission error:', error);
      const errorMessage = error.response?.data?.message || t('errors.applicationSubmitFailed');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (field: any) => {
    const fieldName = field.name;
    const commonProps = {
      ...register(fieldName, { required: field.required ? `${field.label} is required` : false }),
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    };

    switch (field.type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'date':
        return <input type="date" {...commonProps} />;
      case 'number':
        return <input type="number" {...commonProps} />;
      case 'textarea':
        return <textarea rows={3} {...commonProps} />;
      default:
        return <input type="text" {...commonProps} />;
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Services</h2>
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
          <h1 className="text-3xl font-bold text-gray-900">{t('services.title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('services.subtitle')}
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
                placeholder={t('services.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <category.icon className="h-4 w-4 mr-2" />
              {category.name}
            </button>
          ))}
        </motion.div>

        {/* Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredServices.map((service, index) => {
            const categoryIcon = categories.find(cat => cat.id === service.category)?.icon || FileText;
            const IconComponent = categoryIcon;
            
            return (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-primary-600">{service.fee}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-3">{service.description}</p>
                  <p className="text-sm text-blue-600 mb-4">{service.department}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{t('services.processing')}: {service.processingTime}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>{service.requiredDocuments.length} {t('services.documentsRequired')}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleApplyClick(service)}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    {t('services.applyNow')}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Application Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`${t('services.applyNow')} - ${selectedService?.title}`}
          size="xl"
        >
          {selectedService && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{t('services.serviceDetails')}</h4>
                <p className="text-sm text-gray-600 mb-2">{selectedService.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <span className="ml-2 font-medium">{selectedService.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{t('services.processing')} Time:</span>
                    <span className="ml-2 font-medium">{selectedService.processingTime}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fee:</span>
                    <span className="ml-2 font-medium">{selectedService.fee}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-gray-500">{t('services.requiredDocuments')}:</span>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                    {selectedService.requiredDocuments.map((doc: string, index: number) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Service Specific Fields */}
              {selectedService.formFields && selectedService.formFields.length > 0 && (
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">{t('services.serviceSpecificInfo')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedService.formFields.map((field: any, index: number) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label} {field.required && '*'}
                        </label>
                        {renderFormField(field)}
                        {(errors as FieldErrors<any>)[field.name]?.message && (
                          <p className="text-red-600 text-sm mt-1">{(errors as FieldErrors<any>)[field.name]?.message as string}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Document Uploads */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Upload Required Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedService.requiredDocuments as string[]).map((doc: string, idx: number) => (
                    <div key={doc}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{doc} *</label>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={e => handleDocChange(doc, e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      {docUploadErrors[doc] && (
                        <p className="text-red-600 text-sm mt-1">{docUploadErrors[doc]}</p>
                      )}
                      {uploadedDocs[doc] && (
                        <p className="text-xs text-green-600 mt-1">Selected: {uploadedDocs[doc]?.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('services.purpose')}
                </label>
                <textarea
                  {...register('formData.purpose')}
                  rows={3}
                  placeholder={t('services.purposePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      {t('services.submitting')}
                    </>
                  ) : (
                    t('services.submitApplication')
                  )}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ApplyForServicesPage;