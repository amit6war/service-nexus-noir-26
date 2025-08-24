
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';
import { formatError } from '@/lib/errorFormatter';

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
      console.log('🔄 Creating bookings from cart:', cartItems);

      // Create bookings for each cart item
      const bookingPromises = cartItems.map(async (item) => {
        let actualProviderId = item.provider_id;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(item.provider_id)) {
          console.log('❌ Invalid provider_id format, fetching from services table for service_id:', item.service_id);
          
          const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .select('provider_id')
            .eq('id', item.service_id)
            .single();

          if (serviceError) {
            console.error('❌ Error fetching service provider:', serviceError);
            throw new Error(`Failed to get provider for service ${item.service_title}`);
          }

          if (!serviceData) {
            throw new Error(`Service not found: ${item.service_title}`);
          }

          actualProviderId = serviceData.provider_id as string;
          console.log('✅ Found actual provider_id:', actualProviderId);
        }

        // Validate that the provider exists and is approved
        const { data: providerData, error: providerError } = await supabase
          .from('provider_profiles')
          .select('user_id, verification_status')
          .eq('user_id', actualProviderId)
          .eq('verification_status', 'approved')
          .single();

        if (providerError || !providerData) {
          console.error('❌ Provider validation failed:', providerError);
          throw new Error(`Provider not found or not approved for service ${item.service_title}`);
        }

        // Format the address properly
        const serviceAddress = `${address.address_line_1}${address.address_line_2 ? ', ' + address.address_line_2 : ''}, ${address.city}, ${address.state} ${address.postal_code}`;

        const bookingData: Database['public']['Tables']['bookings']['Insert'] = {
          customer_id: user.id,
          provider_user_id: actualProviderId,
          service_id: item.service_id,
          service_date: item.scheduled_date,
          duration_minutes: item.duration_minutes,
          final_price: item.price,
          platform_fee: Math.round(item.price * 0.1 * 100) / 100,
          provider_earnings: Math.round(item.price * 0.9 * 100) / 100,
          special_instructions: item.special_instructions || '',
          service_address: serviceAddress,
          service_city: address.city,
          service_state: address.state,
          service_zip: address.postal_code,
          booking_number: `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };

        console.log('📝 Creating booking with data:', bookingData);

        const { data, error } = await supabase
          .from('bookings')
          .insert(bookingData)
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating booking:', error);
          // Let outer catch wrap with readable message
          throw error;
        }

        console.log('✅ Booking created successfully:', data);
        return data;
      });

      const createdBookings = await Promise.all(bookingPromises);
      
      console.log('🎉 All bookings created successfully:', createdBookings);

      return true;
    } catch (error) {
      const msg = formatError(error);
      console.error('❌ Error in createBookingsFromCart:', error, '->', msg);
      // Throw a clean Error so PaymentSuccess shows the exact details
      throw new Error(msg);
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
      const msg = formatError(error);
      console.error('Error confirming booking:', error, '->', msg);
      toast({
        title: 'Error',
        description: 'Failed to confirm booking. Please try again.',
        variant: 'destructive'
      });
      throw new Error(msg);
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
      const msg = formatError(error);
      console.error('Error cancelling booking:', error, '->', msg);
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive'
      });
      throw new Error(msg);
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
