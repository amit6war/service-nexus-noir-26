
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBookingsActionsV2 = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const acceptBooking = async (bookingId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Booking Accepted',
        description: 'You have successfully accepted this booking.',
      });
      
      return true;
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept booking. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const rejectBooking = async (bookingId: string, reason: string = '') => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Booking Rejected',
        description: 'You have rejected this booking.',
      });
      
      return true;
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject booking. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completeBooking = async (bookingId: string) => {
    setLoading(true);
    try {
      const { data: booking } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', bookingId)
        .single();

      if (booking?.status !== 'confirmed') {
        toast({
          title: 'Cannot Complete',
          description: 'Only confirmed bookings can be marked as completed.',
          variant: 'destructive'
        });
        return false;
      }

      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Booking Completed',
        description: 'Booking has been marked as completed.',
      });
      
      return true;
    } catch (error) {
      console.error('Error completing booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete booking. Please try again.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    acceptBooking,
    rejectBooking,
    completeBooking,
    loading
  };
};
