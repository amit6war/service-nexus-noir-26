
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
  };
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
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
          provider_id,
          provider_profiles!provider_id (
            business_name,
            rating,
            total_reviews,
            user_id,
            verification_status
          )
        `)
        .eq('is_active', true)
        .eq('provider_profiles.verification_status', 'approved');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Transform the data to match our Service interface
      const transformedServices: Service[] = (data || []).map(service => ({
        id: service.id,
        title: service.title,
        description: service.description || '',
        category: service.category,
        subcategory: service.subcategory,
        base_price: service.base_price || 0,
        duration_minutes: service.duration_minutes || 0,
        price_type: service.price_type || 'fixed',
        images: service.images || [],
        is_active: service.is_active,
        is_featured: service.is_featured || false,
        emergency_available: service.emergency_available || false,
        provider_id: service.provider_id,
        provider_profile: service.provider_profiles ? {
          business_name: service.provider_profiles.business_name || '',
          rating: service.provider_profiles.rating || 0,
          total_reviews: service.provider_profiles.total_reviews || 0,
          user_id: service.provider_profiles.user_id,
          verification_status: service.provider_profiles.verification_status
        } : undefined
      }));
      
      setServices(transformedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
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
