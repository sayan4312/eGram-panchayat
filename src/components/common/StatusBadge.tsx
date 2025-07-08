import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          label: 'Pending',
        };
      case 'approved':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Approved',
        };
      case 'rejected':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'Rejected',
        };
      case 'in-review':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          label: 'In Review',
        };
      case 'completed':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Completed',
        };
      case 'verified':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Verified',
        };
      case 'invalid':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'Invalid',
        };
      case 'active':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Active',
        };
      case 'inactive':
        return {
          bgColor: 'bg-gray-200',
          textColor: 'text-gray-800',
          label: 'Inactive',
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          label: 'Unknown',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;