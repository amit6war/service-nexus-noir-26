-- Fix the Stripe webhook to properly handle booking creation and payment recording
-- Add function to validate provider existence
CREATE OR REPLACE FUNCTION public.validate_provider_exists(provider_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.provider_profiles 
    WHERE user_id = provider_user_id 
    AND verification_status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;