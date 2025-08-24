-- Add stripe_session_id column to payments table for linking Stripe sessions to payments
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session_id 
ON public.payments(stripe_session_id);