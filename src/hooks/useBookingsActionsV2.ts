
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

interface Booking {
  id: string;
  service_id: string;
  provider_id: string;
  customer_id: string;
  scheduled_date: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  customer_notes?: string;
  provider_notes?: string;
  accepted_at?: string;
  completed_at?: string;
  cancelled_at?: string;
}

interface CancelBookingParams {
  bookingId: string;
  reason: string;
}

export const useBookingsActionsV2 = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const acceptBooking = useMutation({
    mutationFn: async ({ bookingId, notes }: { bookingId: string; notes?: string }) => {
      console.log('🔄 Accepting booking:', bookingId);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update booking status to accepted
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          provider_notes: notes || null
        })
        .eq('id', bookingId)
        .eq('provider_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error accepting booking:', error);
        throw error;
      }

      return data;
    },
    onSuccess: async (data) => {
      console.log('✅ Booking accepted successfully:', data);
      
      // Add status history entry
      try {
        const { error: historyError } = await supabase
          .from('booking_status_history')
          .insert({
            booking_id: data.id,
            old_status: 'pending',
            new_status: 'accepted',
            changed_by: user?.id || '',
            notes: 'Booking accepted by provider'
          });

        if (historyError) {
          console.warn('⚠️ Failed to add status history:', historyError);
        }
      } catch (error) {
        console.warn('⚠️ Failed to add status history:', error);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      
      toast({
        title: "Booking Accepted",
        description: "The booking has been accepted successfully. The customer will be notified.",
      });
    },
    onError: (error) => {
      console.error('❌ Failed to accept booking:', error);
      toast({
        title: "Error",
        description: "Failed to accept booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  const markInProgress = useMutation({
    mutationFn: async ({ bookingId, notes }: { bookingId: string; notes?: string }) => {
      console.log('🔄 Marking booking in progress:', bookingId);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update booking status to in_progress
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'in_progress',
          provider_notes: notes || null
        })
        .eq('id', bookingId)
        .eq('provider_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error marking booking in progress:', error);
        throw error;
      }

      return data;
    },
    onSuccess: async (data) => {
      console.log('✅ Booking marked in progress successfully:', data);
      
      // Add status history entry
      try {
        const { error: historyError } = await supabase
          .from('booking_status_history')
          .insert({
            booking_id: data.id,
            old_status: 'accepted',
            new_status: 'in_progress',
            changed_by: user?.id || '',
            notes: 'Service started by provider'
          });

        if (historyError) {
          console.warn('⚠️ Failed to add status history:', historyError);
        }
      } catch (error) {
        console.warn('⚠️ Failed to add status history:', error);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      
      toast({
        title: "Status Updated",
        description: "The booking is now marked as in progress.",
      });
    },
    onError: (error) => {
      console.error('❌ Failed to mark booking in progress:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      });
    }
  });

  const completeBooking = useMutation({
    mutationFn: async ({ bookingId, notes }: { bookingId: string; notes?: string }) => {
      console.log('🔄 Completing booking:', bookingId);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update booking status to completed
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          provider_notes: notes || null
        })
        .eq('id', bookingId)
        .eq('provider_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error completing booking:', error);
        throw error;
      }

      return data;
    },
    onSuccess: async (data) => {
      console.log('✅ Booking completed successfully:', data);
      
      // Add status history entry
      try {
        const { error: historyError } = await supabase
          .from('booking_status_history')
          .insert({
            booking_id: data.id,
            old_status: 'in_progress',
            new_status: 'completed',
            changed_by: user?.id || '',
            notes: 'Service completed by provider'
          });

        if (historyError) {
          console.warn('⚠️ Failed to add status history:', historyError);
        }
      } catch (error) {
        console.warn('⚠️ Failed to add status history:', error);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      
      toast({
        title: "Booking Completed",
        description: "The booking has been marked as completed successfully.",
      });
    },
    onError: (error) => {
      console.error('❌ Failed to complete booking:', error);
      toast({
        title: "Error",
        description: "Failed to complete booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  const cancelBooking = useMutation({
    mutationFn: async ({ bookingId, reason }: CancelBookingParams) => {
      console.log('🔄 Cancelling booking:', bookingId, 'Reason:', reason);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Update booking status to cancelled
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          customer_notes: reason
        })
        .eq('id', bookingId)
        .eq('customer_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error cancelling booking:', error);
        throw error;
      }

      return data;
    },
    onSuccess: async (data) => {
      console.log('✅ Booking cancelled successfully:', data);
      
      // Add status history entry
      try {
        const { error: historyError } = await supabase
          .from('booking_status_history')
          .insert({
            booking_id: data.id,
            old_status: 'pending',
            new_status: 'cancelled',
            changed_by: user?.id || '',
            notes: 'Booking cancelled by customer',
          });

        if (historyError) {
          console.warn('⚠️ Failed to add status history:', historyError);
        }
      } catch (error) {
        console.warn('⚠️ Failed to add status history:', error);
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      
      toast({
        title: "Booking Cancelled",
        description: "The booking has been cancelled successfully.",
      });
    },
    onError: (error) => {
      console.error('❌ Failed to cancel booking:', error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    acceptBooking,
    markInProgress,
    completeBooking,
    cancelBooking,
    isLoading: acceptBooking.isPending || markInProgress.isPending || completeBooking.isPending
  };
};
