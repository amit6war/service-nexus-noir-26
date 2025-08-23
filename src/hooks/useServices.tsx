
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

  console.log('useServices hook initialized, loading:', loading);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching services...');
      
      // First fetch all active services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true);

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        throw servicesError;
      }

      console.log('Services data:', servicesData);

      if (!servicesData || servicesData.length === 0) {
        console.log('No services found');
        setServices([]);
        return;
      }

      // Get unique provider IDs
      const providerIds = [...new Set(servicesData.map(service => service.provider_id).filter(Boolean))];
      console.log('Provider IDs:', providerIds);
      
      if (providerIds.length === 0) {
        console.log('No provider IDs found in services');
        setServices([]);
        return;
      }

      // Fetch approved provider profiles
      const { data: providersData, error: providersError } = await supabase
        .from('provider_profiles')
        .select('*')
        .in('user_id', providerIds)
        .eq('verification_status', 'approved');

      if (providersError) {
        console.error('Error fetching providers:', providersError);
        throw providersError;
      }

      console.log('Providers data:', providersData);

      if (!providersData || providersData.length === 0) {
        console.log('No approved providers found');
        setServices([]);
        return;
      }

      // Transform and combine the data
      const transformedServices = servicesData
        .map(service => {
          const provider = providersData.find(p => p.user_id === service.provider_id);
          
          if (!provider) {
            console.log(`No approved provider found for service ${service.id} with provider_id ${service.provider_id}`);
            return null; // Skip services without approved providers
          }

          return {
            id: service.id,
            title: service.title,
            description: service.description || '',
            category: service.category,
            subcategory: service.subcategory || undefined,
            base_price: service.base_price || 0,
            duration_minutes: service.duration_minutes || 30,
            price_type: service.price_type || 'fixed',
            images: service.images || [],
            is_active: service.is_active,
            is_featured: service.is_featured || false,
            emergency_available: service.emergency_available || false,
            provider_id: service.provider_id,
            provider_profile: {
              business_name: provider.business_name || 'Unknown Provider',
              rating: provider.rating || 0,
              total_reviews: provider.total_reviews || 0,
              user_id: provider.user_id,
              verification_status: provider.verification_status,
              description: provider.description,
              years_experience: provider.years_experience,
              portfolio_images: provider.portfolio_images || []
            }
          };
        })
        .filter(service => service !== null) as Service[];
      
      console.log('Final transformed services:', transformedServices);
      setServices(transformedServices);
    } catch (error) {
      console.error('Error in fetchServices:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load services';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive"
      });
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    console.log('useEffect triggered, calling fetchServices');
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refetch: fetchServices };
};
