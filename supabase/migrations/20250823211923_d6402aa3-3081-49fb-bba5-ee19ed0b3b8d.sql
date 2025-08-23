
-- Add status transitions and cancellation fields to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_processed_at TIMESTAMP WITH TIME ZONE;

-- Update booking status enum to include 'confirmed'
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'confirmed';

-- Create a table to track booking status changes
CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_status booking_status,
  new_status booking_status NOT NULL,
  changed_by UUID NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS on booking status history
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- Create policies for booking status history
CREATE POLICY "Users can view booking status history" ON public.booking_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b 
    WHERE b.id = booking_id 
    AND (b.customer_id = auth.uid() OR b.provider_user_id = auth.uid())
  ) OR is_admin(auth.uid())
);

CREATE POLICY "Users can insert booking status history" ON public.booking_status_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b 
    WHERE b.id = booking_id 
    AND (b.customer_id = auth.uid() OR b.provider_user_id = auth.uid())
  ) OR is_admin(auth.uid())
);

-- Create function to calculate cancellation fees
CREATE OR REPLACE FUNCTION calculate_cancellation_fee(
  booking_date TIMESTAMP WITH TIME ZONE,
  booking_amount NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  hours_until_service INTEGER;
  fee_percentage NUMERIC;
BEGIN
  -- Calculate hours between now and service date
  hours_until_service := EXTRACT(EPOCH FROM (booking_date - now())) / 3600;
  
  -- Determine fee percentage based on cancellation timing
  IF hours_until_service >= 24 THEN
    fee_percentage := 0.15; -- 15% if more than 24 hours
  ELSE
    fee_percentage := 0.25; -- 25% if less than 24 hours
  END IF;
  
  RETURN ROUND(booking_amount * fee_percentage, 2);
END;
$$ LANGUAGE plpgsql;

-- Create function to handle booking status transitions
CREATE OR REPLACE FUNCTION update_booking_status(
  booking_uuid UUID,
  new_status booking_status,
  user_uuid UUID,
  status_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  current_booking RECORD;
  old_status booking_status;
  is_valid_transition BOOLEAN := FALSE;
BEGIN
  -- Get current booking details
  SELECT * INTO current_booking FROM public.bookings WHERE id = booking_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;
  
  old_status := current_booking.status;
  
  -- Validate status transitions
  CASE 
    -- Provider can mark as completed
    WHEN old_status = 'pending' AND new_status = 'completed' AND user_uuid = current_booking.provider_user_id THEN
      is_valid_transition := TRUE;
    -- Customer can confirm completed service
    WHEN old_status = 'completed' AND new_status = 'confirmed' AND user_uuid = current_booking.customer_id THEN 
      is_valid_transition := TRUE;
    -- Anyone can cancel (with proper fees)
    WHEN new_status = 'cancelled' AND (user_uuid = current_booking.customer_id OR user_uuid = current_booking.provider_user_id OR is_admin(user_uuid)) THEN
      is_valid_transition := TRUE;
    -- Admins can make any transition
    WHEN is_admin(user_uuid) THEN
      is_valid_transition := TRUE;
  END CASE;
  
  IF NOT is_valid_transition THEN
    RAISE EXCEPTION 'Invalid status transition from % to % for user %', old_status, new_status, user_uuid;
  END IF;
  
  -- Update booking status
  UPDATE public.bookings 
  SET 
    status = new_status,
    updated_at = now(),
    completed_at = CASE WHEN new_status = 'completed' THEN now() ELSE completed_at END,
    confirmed_at = CASE WHEN new_status = 'confirmed' THEN now() ELSE confirmed_at END,
    cancelled_at = CASE WHEN new_status = 'cancelled' THEN now() ELSE cancelled_at END,
    cancellation_fee = CASE 
      WHEN new_status = 'cancelled' AND user_uuid = current_booking.customer_id 
      THEN calculate_cancellation_fee(current_booking.service_date, current_booking.final_price)
      ELSE cancellation_fee 
    END,
    refund_amount = CASE 
      WHEN new_status = 'cancelled' AND user_uuid = current_booking.customer_id 
      THEN current_booking.final_price - calculate_cancellation_fee(current_booking.service_date, current_booking.final_price)
      ELSE refund_amount 
    END
  WHERE id = booking_uuid;
  
  -- Log status change
  INSERT INTO public.booking_status_history (booking_id, old_status, new_status, changed_by, notes)
  VALUES (booking_uuid, old_status, new_status, user_uuid, status_notes);
  
  -- Create notification for status changes
  CASE new_status
    WHEN 'completed' THEN
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        current_booking.customer_id,
        'booking_completed',
        'Service Completed',
        'Your service has been marked as completed. Please confirm to finalize.',
        jsonb_build_object('booking_id', booking_uuid, 'booking_number', current_booking.booking_number)
      );
    WHEN 'confirmed' THEN
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        current_booking.provider_user_id,
        'booking_confirmed',
        'Service Confirmed',
        'Customer has confirmed the completed service.',
        jsonb_build_object('booking_id', booking_uuid, 'booking_number', current_booking.booking_number)
      );
    WHEN 'cancelled' THEN
      -- Notify the other party about cancellation
      INSERT INTO public.notifications (user_id, type, title, message, data)
      VALUES (
        CASE WHEN user_uuid = current_booking.customer_id THEN current_booking.provider_user_id ELSE current_booking.customer_id END,
        'booking_cancelled',
        'Service Cancelled',
        'A booked service has been cancelled.',
        jsonb_build_object('booking_id', booking_uuid, 'booking_number', current_booking.booking_number)
      );
  END CASE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
