
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface ServiceProvider {
  user_id: string;
  business_name: string;
  business_address?: string;
  rating?: number;
  total_reviews?: number;
  verification_status: string;
  description?: string;
}

export const useServicesProviders = (serviceId?: string) => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProviders = async () => {
      if (!serviceId) {
        setProviders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching providers for service:', serviceId);

        // Fetch approved providers - using actual columns from provider_profiles table
        const { data: serviceProviders, error: providersError } = await supabase
          .from('provider_profiles')
          .select(`
            user_id,
            business_name,
            business_address,
            rating,
            total_reviews,
            verification_status,
            description
          `)
          .eq('verification_status', 'approved')
          .limit(20);

        if (providersError) {
          throw new Error(`Failed to fetch providers: ${providersError.message}`);
        }

        console.log('📋 Providers fetched:', serviceProviders?.length || 0);
        setProviders(serviceProviders || []);

      } catch (error) {
        console.error('[useServicesProviders] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load providers';
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [serviceId, toast]);

  return {
    providers,
    loading,
    error,
  };
};
