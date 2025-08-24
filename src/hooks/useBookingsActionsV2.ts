
// Production-grade booking actions with comprehensive error handling
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { validateData, BookingSchema } from '@/lib/validation';
import { AuthenticationError, BookingError, ValidationError } from '@/lib/errors';
import type { Database } from '@/integrations/supabase/types';
import type { CartItem, Booking, Address } from '@/types';

interface BookingOperationResult {
  success: boolean;
  data?: Booking[];
  error?: string;
}

export const useBookingsActionsV2 = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createBookingsFromCart = async (
    cartItems: CartItem[], 
    address: Address
  ): Promise<BookingOperationResult> => {
    if (!user?.id) {
      const error = new AuthenticationError('User not authenticated');
      toast({
        title: 'Authentication Required',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    }

    setLoading(true);
    const createdBookings: Booking[] = [];
    
    try {
      console.log('📝 Creating bookings from cart:', cartItems.length, 'items');

      // Validate input data
      const validatedItems = cartItems.map(item => 
        validateData(CartItemSchema, item)
      );

      // Create bookings sequentially for better error handling
      for (const item of validatedItems) {
        let actualProviderId = item.provider_id;

        // Validate provider ID format and fetch if needed
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(item.provider_id)) {
          console.log('🔍 Fetching provider for service:', item.service_id);
          
          const serviceResult = await apiService.query('services', 
            supabase
              .from('services')
              .select('provider_id')
              .eq('id', item.service_id)
              .single()
          );

          if (!serviceResult.success || !serviceResult.data) {
            throw new BookingError(`Service not found: ${item.service_title}`);
          }

          actualProviderId = (serviceResult.data as any).provider_id;
        }

        // Create booking data with validation
        const bookingData = {
          customer_id: user.id,
          provider_user_id: actualProviderId,
          service_id: item.service_id,
          service_date: item.scheduled_date,
          duration_minutes: item.duration_minutes,
          final_price: item.price,
          platform_fee: Math.round(item.price * 0.1 * 100) / 100,
          provider_earnings: Math.round(item.price * 0.9 * 100) / 100,
          special_instructions: item.special_instructions || '',
          service_address: `${address.address_line_1}${address.address_line_2 ? ', ' + address.address_line_2 : ''}, ${address.city}, ${address.state} ${address.postal_code}`,
          service_city: address.city,
          service_state: address.state,
          service_zip: address.postal_code,
          booking_number: `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };

        // Validate booking data
        const validatedBookingData = validateData(BookingSchema, bookingData);

        console.log('💾 Creating booking:', validatedBookingData.booking_number);

        const bookingResult = await apiService.mutate<Booking>(() => 
          supabase
            .from('bookings')
            .insert(validatedBookingData as Database['public']['Tables']['bookings']['Insert'])
            .select()
            .single()
        );

        if (!bookingResult.success || !bookingResult.data) {
          throw new BookingError(`Failed to create booking for ${item.service_title}: ${bookingResult.error}`);
        }

        createdBookings.push(bookingResult.data);
        console.log('✅ Booking created:', bookingResult.data.booking_number);
      }

      toast({
        title: 'Bookings Created Successfully',
        description: `${createdBookings.length} booking${createdBookings.length > 1 ? 's' : ''} created successfully.`
      });

      return { success: true, data: createdBookings };

    } catch (error) {
      console.error('❌ Error creating bookings:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: 'Error Creating Bookings',
        description: errorMessage,
        variant: 'destructive'
      });

      // If some bookings were created but not all, we should handle partial success
      if (createdBookings.length > 0) {
        console.warn('⚠️ Partial success: Created', createdBookings.length, 'out of', cartItems.length, 'bookings');
        
        toast({
          title: 'Partial Success',
          description: `Created ${createdBookings.length} out of ${cartItems.length} bookings. Please check your booking history.`,
          variant: 'destructive'
        });
      }

      return { success: false, error: errorMessage, data: createdBookings.length > 0 ? createdBookings : undefined };
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (bookingId: string): Promise<boolean> => {
    if (!user?.id) {
      throw new AuthenticationError('User not authenticated');
    }

    setLoading(true);
    try {
      const result = await apiService.mutate(() =>
        supabase
          .from('bookings')
          .update({ 
            status: 'confirmed',
            confirmed_at: new Date().toISOString()
          } as Database['public']['Tables']['bookings']['Update'])
          .eq('id', bookingId)
          .eq('customer_id', user.id)
      );

      if (!result.success) {
        throw new BookingError(`Failed to confirm booking: ${result.error}`);
      }

      toast({
        title: 'Booking Confirmed',
        description: 'Your service has been confirmed successfully.'
      });

      return true;
    } catch (error) {
      const appError = handleError(error);
      toast({
        title: 'Error',
        description: appError.message,
        variant: 'destructive'
      });
      throw appError;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string, reason?: string): Promise<boolean> => {
    if (!user?.id) {
      throw new AuthenticationError('User not authenticated');
    }

    setLoading(true);
    try {
      const result = await apiService.mutate(() =>
        supabase
          .from('bookings')
          .update({ 
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancelled_by: user.id,
            cancellation_reason: reason
          } as Database['public']['Tables']['bookings']['Update'])
          .eq('id', bookingId)
          .eq('customer_id', user.id)
      );

      if (!result.success) {
        throw new BookingError(`Failed to cancel booking: ${result.error}`);
      }

      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully.'
      });

      return true;
    } catch (error) {
      const appError = handleError(error);
      toast({
        title: 'Error',
        description: appError.message,
        variant: 'destructive'
      });
      throw appError;
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
