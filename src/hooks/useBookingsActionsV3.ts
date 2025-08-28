import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { CartItem } from '@/hooks/useCart';

interface CreateBookingsParams {
  items: CartItem[];
  address: {
    address_line_1: string;
    city: string;
    state: string;
    postal_code: string;
  };
  sessionId?: string;
}

export const useBookingsActionsV3 = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createBookingsFromCart = useMutation({
    mutationFn: async ({ items, address, sessionId }: CreateBookingsParams) => {
      console.log('🔄 Creating bookings from cart:', items.length, 'items');
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!items.length) {
        throw new Error('No items in cart to create bookings');
      }

      const bookings = [];
      
      // Create bookings sequentially to ensure proper error handling
      for (const item of items) {
        try {
          // Generate unique booking number
          const bookingNumber = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          
          const bookingData = {
            customer_id: user.id,
            provider_user_id: item.provider_id,
            service_id: item.service_id,
            booking_number: bookingNumber,
            status: 'confirmed' as const,
            service_date: item.slot_start_time || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            duration_minutes: item.duration_minutes,
            estimated_price: item.base_price,
            final_price: item.final_price,
            service_address: address.address_line_1,
            service_city: address.city,
            service_state: address.state,
            service_zip: address.postal_code,
            special_instructions: item.notes || null,
          };

          const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert(bookingData)
            .select()
            .single();

          if (bookingError) {
            console.error('❌ Error creating booking:', bookingError);
            throw new Error(`Failed to create booking for ${item.service_name}: ${bookingError.message}`);
          }

          console.log('✅ Booking created:', booking.booking_number);
          
          // Create payment record if session ID is provided
          if (sessionId) {
            const { error: paymentError } = await supabase
              .from('payments')
              .insert({
                booking_id: booking.id,
                customer_id: user.id,
                provider_user_id: item.provider_id,
                amount: Math.round(item.final_price * 100), // Convert to cents
                currency: 'USD',
                payment_status: 'completed',
                stripe_session_id: sessionId,
                payment_method: 'stripe_checkout',
                processed_at: new Date().toISOString(),
              });

            if (paymentError) {
              console.error('❌ Error creating payment record:', paymentError);
              // Don't throw here as booking was successful, just log the error
            } else {
              console.log('✅ Payment record created for booking:', booking.booking_number);
            }
          }

          bookings.push(booking);
        } catch (error) {
          console.error('❌ Error processing item:', item.service_name, error);
          throw error;
        }
      }

      // Clear cart items after successful booking creation
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (clearError) {
        console.error('❌ Error clearing cart:', clearError);
        // Don't throw here as bookings were created successfully
      } else {
        console.log('✅ Cart cleared after booking creation');
      }

      return bookings;
    },
    onSuccess: (bookings) => {
      console.log('✅ All bookings created successfully:', bookings.length);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['customer-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      toast({
        title: "Bookings Created Successfully",
        description: `${bookings.length} booking${bookings.length > 1 ? 's' : ''} created successfully.`,
      });
    },
    onError: (error) => {
      console.error('❌ Error creating bookings:', error);
      toast({
        title: "Booking Creation Failed",
        description: error.message || "Failed to create bookings. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    createBookingsFromCart: createBookingsFromCart.mutateAsync,
    isCreatingBookings: createBookingsFromCart.isPending
  };
};
