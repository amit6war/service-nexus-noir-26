import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export interface CartItem {
  id: string;
  service_id: string;
  service_title: string;
  provider_id: string;
  provider_name: string;
  price: number;
  scheduled_date: string;
  duration_minutes: number;
  special_instructions?: string;
}

export const useBookingsActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createBookingsFromCart = async (cartItems: CartItem[], address: any): Promise<boolean> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      console.log('Creating bookings from cart:', cartItems);

      // Create bookings for each cart item
      const bookingPromises = cartItems.map(async (item) => {
        let actualProviderId = item.provider_id;

        // If provider_id is not a valid UUID, fetch from services table
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(item.provider_id)) {
          console.log('Invalid provider_id format, fetching from services table for service_id:', item.service_id);
          
          const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .select('provider_id')
            .eq('id', item.service_id)
            .single();

          if (serviceError) {
            console.error('Error fetching service provider:', serviceError);
            throw new Error(`Failed to get provider for service ${item.service_title}`);
          }

          if (!serviceData) {
            throw new Error(`Service not found: ${item.service_title}`);
          }

          actualProviderId = serviceData.provider_id as string;
          console.log('Found actual provider_id:', actualProviderId);
        }

        // Validate that the provider exists and is approved
        const { data: providerData, error: providerError } = await supabase
          .from('provider_profiles')
          .select('user_id, verification_status')
          .eq('user_id', actualProviderId)
          .eq('verification_status', 'approved')
          .single();

        if (providerError || !providerData) {
          console.error('Provider validation failed:', providerError);
          throw new Error(`Provider not found or not approved for service ${item.service_title}`);
        }

        const bookingData: Database['public']['Tables']['bookings']['Insert'] = {
          customer_id: user.id,
          provider_user_id: actualProviderId,
          service_id: item.service_id,
          service_date: item.scheduled_date,
          duration_minutes: item.duration_minutes,
          final_price: item.price,
          platform_fee: Math.round(item.price * 0.1 * 100) / 100, // 10% platform fee
          provider_earnings: Math.round(item.price * 0.9 * 100) / 100, // 90% to provider
          special_instructions: item.special_instructions || '',
          service_address: `${address.address_line_1}${address.address_line_2 ? ', ' + address.address_line_2 : ''}, ${address.city}, ${address.state} ${address.zip_code}`,
          service_city: address.city,
          service_state: address.state,
          service_zip: address.zip_code,
          booking_number: `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          // status omitted to use DB default 'pending'
        };

        console.log('Creating booking with data:', bookingData);

        const { data, error } = await supabase
          .from('bookings')
          .insert(bookingData)
          .select()
          .single();

        if (error) {
          console.error('Error creating booking:', error);
          throw error;
        }

        console.log('Booking created successfully:', data);
        return data;
      });

      const createdBookings = await Promise.all(bookingPromises);
      
      console.log('All bookings created successfully:', createdBookings);

      toast({
        title: 'Bookings Created Successfully',
        description: `${createdBookings.length} booking${createdBookings.length > 1 ? 's' : ''} created successfully.`
      });

      return true;
    } catch (error) {
      console.error('Error in createBookingsFromCart:', error);
      toast({
        title: 'Error Creating Bookings',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (bookingId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        } as Database['public']['Tables']['bookings']['Update'])
        .eq('id', bookingId)
        .eq('customer_id', user.id);

      if (error) throw error;

      toast({
        title: 'Booking Confirmed',
        description: 'Your service has been confirmed successfully.'
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to confirm booking. Please try again.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string, reason?: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: user.id,
          cancellation_reason: reason
        } as Database['public']['Tables']['bookings']['Update'])
        .eq('id', bookingId)
        .eq('customer_id', user.id);

      if (error) throw error;

      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully.'
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBookingsFromCart,
    confirmBooking,
    cancelBooking,
    loading
  };
};
