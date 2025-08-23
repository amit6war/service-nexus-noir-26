
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
          provider_id
        `)
        .eq('is_active', true);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Fetch provider profiles separately for active services
      const providerIds = data?.map(service => service.provider_id).filter(Boolean) || [];
      
      let providerProfiles: any[] = [];
      if (providerIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('provider_profiles')
          .select(`
            user_id,
            business_name,
            rating,
            total_reviews,
            verification_status
          `)
          .in('user_id', providerIds)
          .eq('verification_status', 'approved');

        if (profilesError) {
          console.error('Error fetching provider profiles:', profilesError);
        } else {
          providerProfiles = profilesData || [];
        }
      }

      // Transform the data to match our Service interface
      const transformedServices: Service[] = (data || []).map(service => {
        const providerProfile = providerProfiles.find(
          profile => profile.user_id === service.provider_id
        );

        return {
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
          provider_profile: providerProfile ? {
            business_name: providerProfile.business_name || '',
            rating: providerProfile.rating || 0,
            total_reviews: providerProfile.total_reviews || 0,
            user_id: providerProfile.user_id,
            verification_status: providerProfile.verification_status
          } : undefined
        };
      }).filter(service => service.provider_profile); // Only include services with approved providers
      
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
