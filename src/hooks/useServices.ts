import { useState, useEffect } from 'react';
import serviceService, { Service } from '../services/serviceService';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await serviceService.getAllServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
  };
};

export const useService = (id: string) => {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await serviceService.getServiceById(id);
        setService(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch service');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  return {
    service,
    loading,
    error,
  };
};