import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type UUID = string;

export type CartItem = {
  service_id: UUID;
  provider_id: UUID; // provider's user_id
  service_title?: string;
  provider_name?: string;
  price: number;
  duration_minutes?: number;
  scheduled_date: string; // ISO string e.g. 2025-01-01T10:00:00
  special_instructions?: string;
};

export type Address = {
  address_line_1: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string; // Changed from postal_code to match checkout form
  country?: string;
};

export type CreatedBooking = {
  id: UUID;
  booking_number: string;
  status: 'pending' | 'completed' | 'cancelled' | 'confirmed';
  service_date: string;
  final_price: number | null;
};

function generateBookingNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${ts}-${rnd}`;
}

function formatServiceAddress(addr: Address) {
  const line2 = addr.address_line_2 ? `, ${addr.address_line_2}` : '';
  const city = addr.city ? `, ${addr.city}` : '';
  const state = addr.state ? `, ${addr.state}` : '';
  const zip = addr.zip_code ? ` ${addr.zip_code}` : '';
  const country = addr.country ? `, ${addr.country}` : '';
  return `${addr.address_line_1}${line2}${city}${state}${zip}${country}`.trim();
}

type BookingInsert = Database['public']['Tables']['bookings']['Insert'];

export const useBookingsActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createBookingsFromCart = useMemo(() => {
    return async (items: CartItem[], address: Address): Promise<boolean> => {
      if (!items || items.length === 0) {
        throw new Error('No items to book.');
      }

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        throw new Error('You must be logged in to create bookings.');
      }

      const customerId = userData.user.id;
      const service_address = formatServiceAddress(address);

      console.log('Creating bookings with items:', items);
      console.log('Customer ID:', customerId);

      // Validate that all provider_ids are valid UUIDs
      for (const item of items) {
        if (!item.provider_id || typeof item.provider_id !== 'string') {
          throw new Error(`Invalid provider ID: ${item.provider_id}`);
        }
        
        // Check if provider exists in the system
        const { data: providerExists, error: providerError } = await supabase
          .from('provider_profiles')
          .select('user_id')
          .eq('user_id', item.provider_id)
          .single();

        if (providerError || !providerExists) {
          console.error('Provider validation failed:', { provider_id: item.provider_id, error: providerError });
          throw new Error(`Provider not found: ${item.provider_id}`);
        }
      }

      // Build typed booking rows (omit status to use DB default 'pending')
      const rows: BookingInsert[] = items.map((item) => ({
        customer_id: customerId,
        provider_user_id: item.provider_id,
        service_id: item.service_id,
        service_date: item.scheduled_date,
        duration_minutes: item.duration_minutes ?? null,
        final_price: item.price,
        estimated_price: item.price,
        special_instructions: item.special_instructions || null,
        booking_number: generateBookingNumber(),
        service_address,
        service_city: address.city ?? null,
        service_state: address.state ?? null,
        service_zip: address.zip_code ?? null,
      }));

      console.log('Inserting booking rows:', rows);

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .insert(rows)
          .select('id, booking_number, status, service_date, final_price');

        if (error) {
          console.error('Booking creation error:', error);
          throw new Error(error.message);
        }

        console.log('Bookings created successfully:', data);

        toast({
          title: 'Bookings created',
          description: `${data?.length ?? 0} booking(s) added successfully.`,
        });

        return true;
      } catch (error) {
        console.error('Error creating bookings:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    };
  }, [toast]);

  const markCompleted = useMemo(() => {
    return async (bookingId: UUID, notes?: string) => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) throw new Error('Not authenticated.');

      const { data, error } = await supabase.rpc('update_booking_status', {
        booking_uuid: bookingId,
        new_status: 'completed',
        user_uuid: userData.user.id,
        status_notes: notes ?? null,
      });

      if (error) throw new Error(error.message);
      if (data) {
        toast({
          title: 'Marked as completed',
          description: 'The booking was marked as completed.',
        });
      }
      return data as boolean;
    };
  }, [toast]);

  const confirmBooking = useMemo(() => {
    return async (bookingId: UUID, notes?: string) => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) throw new Error('Not authenticated.');

      const { data, error } = await supabase.rpc('update_booking_status', {
        booking_uuid: bookingId,
        new_status: 'confirmed',
        user_uuid: userData.user.id,
        status_notes: notes ?? null,
      });

      if (error) throw new Error(error.message);
      if (data) {
        toast({
          title: 'Booking confirmed',
          description: 'Thanks for confirming the completed service.',
        });
      }
      return data as boolean;
    };
  }, [toast]);

  const cancelBooking = useMemo(() => {
    return async (bookingId: UUID, reason?: string) => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) throw new Error('Not authenticated.');

      const { data, error } = await supabase.rpc('update_booking_status', {
        booking_uuid: bookingId,
        new_status: 'cancelled',
        user_uuid: userData.user.id,
        status_notes: reason ?? null,
      });

      if (error) throw new Error(error.message);
      if (data) {
        toast({
          title: 'Booking cancelled',
          description:
            'Your booking was cancelled. Any applicable fee and refund were calculated automatically.',
          variant: 'destructive',
        });
      }
      return data as boolean;
    };
  }, [toast]);

  return {
    loading,
    createBookingsFromCart,
    markCompleted,
    confirmBooking,
    cancelBooking,
  };
};
