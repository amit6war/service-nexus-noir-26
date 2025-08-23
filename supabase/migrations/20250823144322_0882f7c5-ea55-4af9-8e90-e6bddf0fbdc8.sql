
-- Allow public read access to active services
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services"
  ON public.services
  FOR SELECT
  USING (is_active = true);

-- Allow public read access to approved provider profiles
DROP POLICY IF EXISTS "Public can view approved provider profiles" ON public.provider_profiles;
CREATE POLICY "Public can view approved provider profiles"
  ON public.provider_profiles
  FOR SELECT
  USING (verification_status = 'approved'::verification_status);
