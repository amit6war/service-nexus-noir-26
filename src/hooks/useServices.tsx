
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  base_price: number;
  duration_minutes: number;
  price_type: string;
  images?: string[];
  is_active: boolean;
  is_featured: boolean;
  emergency_available: boolean;
  provider_id?: string;
  provider_profile?: {
    business_name: string;
    rating: number;
    total_reviews: number;
    user_id: string;
    verification_status: string;
    description?: string;
    years_experience?: number;
    portfolio_images?: string[];
  };
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchServices = useCallback(async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setLoading(true);
      }
      setError(null);
      
      // Simple, fast query for services only
      const { data: rawServices, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          title,
          description,
          category,
          subcategory,
          base_price,
          duration_minutes,
          price_type,
          images,
          is_active,
          is_featured,
          emergency_available,
          provider_id
        `)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .limit(50);

      if (servicesError) {
        throw new Error(`Failed to fetch services: ${servicesError.message}`);
      }

      if (!rawServices || rawServices.length === 0) {
        setServices([]);
        if (showLoadingState) {
          setLoading(false);
        }
        return;
      }

      // Map to final format without provider data for now (faster loading)
      const servicesWithoutProviders = rawServices.map(service => ({
        id: service.id,
        title: service.title || 'Untitled Service',
        description: service.description || '',
        category: service.category || 'Other',
        subcategory: service.subcategory,
        base_price: service.base_price || 0,
        duration_minutes: service.duration_minutes || 30,
        price_type: service.price_type || 'fixed',
        images: service.images || [],
        is_active: service.is_active || false,
        is_featured: service.is_featured || false,
        emergency_available: service.emergency_available || false,
        provider_id: service.provider_id,
      }));

      setServices(servicesWithoutProviders);
      
    } catch (error) {
      console.error('[useServices] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load services';
      setError(errorMessage);
      setServices([]);
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  }, []);

  const silentRefresh = useCallback(async () => {
    await fetchServices(false);
  }, [fetchServices]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { 
    services, 
    loading, 
    error, 
    refetch: fetchServices,
    silentRefresh
  };
};
