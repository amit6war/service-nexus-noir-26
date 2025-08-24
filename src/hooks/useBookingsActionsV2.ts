
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

// Lightweight mutation context to avoid deep types
type MutationCtx = unknown;

export const useBookingsActionsV2 = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Accept booking
  const acceptBooking = useMutation({
    mutationFn: async ({ bookingId, notes }: { bookingId: string; notes?: string }): Promise<Booking> => {
      console.log('🔄 Accepting booking:', bookingId);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const res = await supabase
        .from('bookings')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          provider_notes: notes || null
        })
        .eq('id', bookingId)
        .eq('provider_id', user.id)
        .select('*')
        .single();

      if (res.error) {
        console.error('❌ Error accepting booking:', res.error);
        throw new Error(res.error.message);
      }

      return res.data as unknown as Booking;
    },
    onSuccess: async (data: Booking) => {
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
    onError: (error: unknown) => {
      console.error('❌ Failed to accept booking:', error);
      toast({
        title: "Error",
        description: "Failed to accept booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mark in progress
  const markInProgress = useMutation({
    mutationFn: async ({ bookingId, notes }: { bookingId: string; notes?: string }): Promise<Booking> => {
      console.log('🔄 Marking booking in progress:', bookingId);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const res = await supabase
        .from('bookings')
        .update({
          status: 'in_progress',
          provider_notes: notes || null
        })
        .eq('id', bookingId)
        .eq('provider_id', user.id)
        .select('*')
        .single();

      if (res.error) {
        console.error('❌ Error marking booking in progress:', res.error);
        throw new Error(res.error.message);
      }

      return res.data as unknown as Booking;
    },
    onSuccess: async (data: Booking) => {
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
    onError: (error: unknown) => {
      console.error('❌ Failed to mark booking in progress:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Complete booking
  const completeBooking = useMutation({
    mutationFn: async ({ bookingId, notes }: { bookingId: string; notes?: string }): Promise<Booking> => {
      console.log('🔄 Completing booking:', bookingId);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const res = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          provider_notes: notes || null
        })
        .eq('id', bookingId)
        .eq('provider_id', user.id)
        .select('*')
        .single();

      if (res.error) {
        console.error('❌ Error completing booking:', res.error);
        throw new Error(res.error.message);
      }

      return res.data as unknown as Booking;
    },
    onSuccess: async (data: Booking) => {
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
    onError: (error: unknown) => {
      console.error('❌ Failed to complete booking:', error);
      toast({
        title: "Error",
        description: "Failed to complete booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Cancel booking
  const cancelBooking = useMutation({
    mutationFn: async ({ bookingId, reason }: CancelBookingParams): Promise<Booking> => {
      console.log('🔄 Cancelling booking:', bookingId, 'Reason:', reason);
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const res = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          customer_notes: reason
        })
        .eq('id', bookingId)
        .eq('customer_id', user.id)
        .select('*')
        .single();

      if (res.error) {
        console.error('❌ Error cancelling booking:', res.error);
        throw new Error(res.error.message);
      }

      return res.data as unknown as Booking;
    },
    onSuccess: async (data: Booking) => {
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
    onError: (error: unknown) => {
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
