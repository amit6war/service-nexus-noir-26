
import { useState, useEffect } from 'react';
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
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      setLoading(true);
      
      // First fetch all active services
      const { data: servicesData, error: servicesError } = await supabase
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

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
        throw servicesError;
      }

      if (!servicesData || servicesData.length === 0) {
        setServices([]);
        return;
      }

      // Get unique provider IDs
      const providerIds = [...new Set(servicesData.map(service => service.provider_id).filter(Boolean))];
      
      // Fetch provider profiles for these services
      const { data: providersData, error: providersError } = await supabase
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
        .in('user_id', providerIds)
        .eq('verification_status', 'approved');

      if (providersError) {
        console.error('Error fetching providers:', providersError);
        // Continue without provider data rather than failing completely
      }

      // Transform and combine the data
      const transformedServices = servicesData
        .map(service => {
          const provider = providersData?.find(p => p.user_id === service.provider_id);
          
          if (!provider) {
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
        .filter(service => service !== null);
      
      console.log('Fetched services:', transformedServices);
      setServices(transformedServices);
    } catch (error) {
      console.error('Error in fetchServices:', error);
      toast({
        title: "Error",
        description: "Failed to load services. Please try again.",
        variant: "destructive"
      });
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return { services, loading, refetch: fetchServices };
};
