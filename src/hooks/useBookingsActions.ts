import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type UUID = string;

export type CartItem = {
  service_id: UUID;
  provider_id: UUID; // provider's user_id (may come as non-UUID from older flows; we'll resolve from backend)
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

// Helper to check UUID format
const isUUID = (val: string | undefined | null) => {
  if (!val || typeof val !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(val);
};

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

      console.log('[Bookings] Creating bookings with items:', items);
      console.log('[Bookings] Customer ID:', customerId);

      // Resolve provider IDs from backend using the service_id to avoid invalid provider IDs from cart
      const distinctServiceIds = Array.from(new Set(items.map(i => i.service_id)));
      console.log('[Bookings] Distinct service IDs to resolve providers:', distinctServiceIds);

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, provider_id')
        .in('id', distinctServiceIds);

      if (servicesError) {
        console.error('[Bookings] Error fetching services for provider resolution:', servicesError);
        throw new Error(`Failed to fetch services for provider mapping: ${servicesError.message}`);
      }

      const serviceProviderMap: Record<string, string> = {};
      (servicesData ?? []).forEach(svc => {
        // @ts-expect-error Supabase typed id as UUID; cast to string for map key
        serviceProviderMap[String(svc.id)] = String(svc.provider_id);
      });
      console.log('[Bookings] Service -> Provider map:', serviceProviderMap);

      // Validate providers exist and finalize provider IDs
      const resolvedProviderIds: string[] = [];
      for (const item of items) {
        let providerId = item.provider_id;

        // If providerId is not a UUID, resolve from the services table using service_id
        if (!isUUID(providerId)) {
          const mapped = serviceProviderMap[item.service_id];
          if (mapped && isUUID(mapped)) {
            console.log('[Bookings] Resolved provider via service map:', {
              service_id: item.service_id,
              original_provider_id: item.provider_id,
              resolved_provider_id: mapped,
            });
            providerId = mapped;
          } else {
            console.error('[Bookings] Unable to resolve provider for service:', item.service_id, 'item:', item);
            throw new Error(`Could not resolve provider for service ${item.service_id}. Please try re-adding the service.`);
          }
        }

        // Check if provider exists in the system
        const { data: providerExists, error: providerError } = await supabase
          .from('provider_profiles')
          .select('user_id')
          .eq('user_id', providerId)
          .maybeSingle();

        if (providerError) {
          console.error('[Bookings] Provider lookup error:', { provider_id: providerId, error: providerError });
          throw new Error(`Provider lookup failed: ${providerError.message}`);
        }

        if (!providerExists) {
          console.error('[Bookings] Provider not found in system:', providerId);
          throw new Error(`Provider not found in system: ${providerId}`);
        }

        resolvedProviderIds.push(providerId);
      }

      // Build typed booking rows using resolved provider IDs
      const rows: BookingInsert[] = items.map((item, idx) => ({
        customer_id: customerId,
        provider_user_id: resolvedProviderIds[idx],
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

      console.log('[Bookings] Inserting booking rows:', rows);

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .insert(rows)
          .select('id, booking_number, status, service_date, final_price');

        if (error) {
          console.error('[Bookings] Booking creation error:', error);
          throw new Error(error.message);
        }

        console.log('[Bookings] Bookings created successfully:', data);

        toast({
          title: 'Bookings created',
          description: `${data?.length ?? 0} booking(s) added successfully.`,
        });

        return true;
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
