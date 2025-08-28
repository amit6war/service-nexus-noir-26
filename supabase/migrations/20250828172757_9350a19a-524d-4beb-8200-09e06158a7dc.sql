
-- Add unique constraint for cart_metadata table to fix ON CONFLICT specification error
ALTER TABLE public.cart_metadata 
ADD CONSTRAINT cart_metadata_user_id_unique UNIQUE (user_id);

-- Enable realtime for cart_metadata table for real-time updates
ALTER TABLE public.cart_metadata REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_metadata;

-- Enable realtime for cart_items table for real-time updates
ALTER TABLE public.cart_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cart_items;

-- Enable realtime for bookings table for real-time updates
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Enable realtime for payments table for real-time updates
ALTER TABLE public.payments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
