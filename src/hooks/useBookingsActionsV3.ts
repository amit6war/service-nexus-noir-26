
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateBookingData {
  customer_id: string;
  provider_user_id: string;
  service_id: string;
  service_date: string;
  duration_minutes: number;
  final_price: number;
  service_address: string;
  service_city: string;
  service_state: string;
  service_zip?: string;
  special_instructions?: string;
}

export const useBookingsActionsV3 = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createBooking = async (bookingData: CreateBookingData) => {
    setLoading(true);
    try {
      // Calculate platform fee (e.g., 10% of final price)
      const platform_fee = bookingData.final_price * 0.1;
      const provider_earnings = bookingData.final_price - platform_fee;

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          customer_id: bookingData.customer_id,
          provider_user_id: bookingData.provider_user_id,
          service_id: bookingData.service_id,
          status: 'confirmed',
          service_date: bookingData.service_date,
          duration_minutes: bookingData.duration_minutes,
          final_price: bookingData.final_price,
          platform_fee,
          provider_earnings,
          service_address: bookingData.service_address,
          service_city: bookingData.service_city,
          service_state: bookingData.service_state,
          service_zip: bookingData.service_zip || '',
          special_instructions: bookingData.special_instructions || ''
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }

      toast({
        title: 'Booking Created',
        description: 'Your booking has been created successfully.',
      });
      
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: status as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Booking Updated',
        description: `Booking status updated to ${status}.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBooking,
    updateBookingStatus,
    loading
  };
};
