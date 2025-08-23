
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

  console.log('[useServices] Hook initialized, loading:', loading);

  const fetchServices = useCallback(async () => {
    try {
      console.log('[useServices] Starting to fetch services...');
      setLoading(true);
      setError(null);
      
      // Test connection first
      const { data: testConnection } = await supabase.from('services').select('count', { count: 'exact', head: true });
      console.log('[useServices] Connection test - service count:', testConnection);

      // Fetch services with a simple query first
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
        .eq('is_active', true);

      console.log('[useServices] Raw services query result:', { rawServices, servicesError });

      if (servicesError) {
        console.error('[useServices] Services query error:', servicesError);
        throw new Error(`Failed to fetch services: ${servicesError.message}`);
      }

      if (!rawServices || rawServices.length === 0) {
        console.log('[useServices] No services found, setting empty array');
        setServices([]);
        setLoading(false);
        return;
      }

      console.log('[useServices] Found services:', rawServices.length);

      // Get unique provider IDs
      const providerIds = [...new Set(rawServices.map(service => service.provider_id).filter(Boolean))];
      console.log('[useServices] Provider IDs to fetch:', providerIds);

      if (providerIds.length === 0) {
        console.log('[useServices] No provider IDs found');
        // Map services without provider info
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
        setLoading(false);
        return;
      }

      // Fetch provider profiles
      const { data: providers, error: providersError } = await supabase
        .from('provider_profiles')
        .select(`
          user_id,
          business_name,
          rating,
          total_reviews,
          verification_status,
          description,
          years_experience,
          portfolio_images
        `)
        .in('user_id', providerIds);

      console.log('[useServices] Provider profiles query result:', { providers, providersError });

      if (providersError) {
        console.error('[useServices] Provider profiles query error:', providersError);
        // Continue without provider info
      }

      // Combine services with provider data
      const combinedServices = rawServices.map(service => {
        const provider = providers?.find(p => p.user_id === service.provider_id);
        
        const baseService = {
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
        };

        if (provider) {
          return {
            ...baseService,
            provider_profile: {
              business_name: provider.business_name || 'Unknown Provider',
              rating: provider.rating || 0,
              total_reviews: provider.total_reviews || 0,
              user_id: provider.user_id,
              verification_status: provider.verification_status || 'pending',
              description: provider.description,
              years_experience: provider.years_experience,
              portfolio_images: provider.portfolio_images || []
            }
          };
        }

        return baseService;
      });

      console.log('[useServices] Final combined services:', combinedServices.length);
      setServices(combinedServices);
      
    } catch (error) {
      console.error('[useServices] Error in fetchServices:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load services';
      setError(errorMessage);
      
      // Don't show toast for now to avoid spam
      console.error('[useServices] Setting error state:', errorMessage);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('[useServices] useEffect triggered, calling fetchServices');
    fetchServices();
  }, [fetchServices]);

  return { 
    services, 
    loading, 
    error, 
    refetch: fetchServices 
  };
};
