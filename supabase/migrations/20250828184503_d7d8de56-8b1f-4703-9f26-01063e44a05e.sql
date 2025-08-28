
-- Add address fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN address_line_1 TEXT,
ADD COLUMN address_line_2 TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN country TEXT DEFAULT 'United States';

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, provider_user_id)
);

-- Enable RLS for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS policies for favorites
CREATE POLICY "Users can view their own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can manage their own favorites" ON public.favorites
  FOR ALL USING (auth.uid() = customer_id);

-- Create verification_notes table for admin notes
CREATE TABLE public.verification_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for verification_notes
ALTER TABLE public.verification_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies for verification_notes
CREATE POLICY "Admins can manage verification notes" ON public.verification_notes
  FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

CREATE POLICY "Providers can view their verification notes" ON public.verification_notes
  FOR SELECT USING (
    provider_id IN (SELECT id FROM public.provider_profiles WHERE user_id = auth.uid())
  );
