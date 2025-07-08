import { useState, useEffect } from 'react';
import applicationService, { Application, ApplicationFilters } from '../services/applicationService';

export const useApplications = (filters?: ApplicationFilters) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationService.getUserApplications(filters);
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [JSON.stringify(filters)]);

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
  };
};

export const useStaffApplications = (filters?: ApplicationFilters) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationService.getStaffApplications(filters);
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [JSON.stringify(filters)]);

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications,
  };
};

export const useApplication = (id: string) => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await applicationService.getApplicationById(id);
        setApplication(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch application');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  return {
    application,
    loading,
    error,
  };
};