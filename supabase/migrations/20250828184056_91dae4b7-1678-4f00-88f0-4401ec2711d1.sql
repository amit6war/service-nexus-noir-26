
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE app_role AS ENUM ('customer', 'provider', 'admin', 'superadmin');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'under_review', 'expired');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'disputed');
CREATE TYPE document_type AS ENUM ('business_license', 'insurance_certificate', 'id_proof', 'professional_certification', 'background_check', 'other');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role app_role DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider profiles
CREATE TABLE public.provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT NOT NULL,
  business_address TEXT,
  business_phone TEXT,
  business_email TEXT,
  description TEXT,
  years_experience INTEGER DEFAULT 0,
  verification_status verification_status DEFAULT 'pending',
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  emergency_passes INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  portfolio_images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service categories
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.service_categories(id),
  title TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price_type TEXT DEFAULT 'fixed',
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  emergency_available BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider availability
CREATE TABLE public.provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider_id, date, start_time)
);

-- Cart items
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  slot_start_time TIMESTAMPTZ,
  slot_end_time TIMESTAMPTZ,
  service_description TEXT,
  location_address TEXT,
  notes TEXT,
  category TEXT,
  subcategory TEXT,
  provider_avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  status booking_status DEFAULT 'pending',
  service_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  final_price DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  provider_earnings DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  service_address TEXT NOT NULL,
  service_city TEXT NOT NULL,
  service_state TEXT NOT NULL,
  service_zip TEXT,
  booking_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_fee DECIMAL(10,2),
  refund_amount DECIMAL(10,2),
  cancellation_reason TEXT
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  payment_status payment_status DEFAULT 'pending',
  stripe_charge_id TEXT,
  stripe_session_id TEXT,
  payment_method TEXT,
  processed_at TIMESTAMPTZ,
  payment_intent_id TEXT,
  refund_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification documents
CREATE TABLE public.verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  verification_status verification_status DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can insert their profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for provider_profiles
CREATE POLICY "Anyone can view approved providers" ON public.provider_profiles
  FOR SELECT USING (verification_status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Providers can manage their own profile" ON public.provider_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all provider profiles" ON public.provider_profiles
  FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- RLS Policies for service_categories
CREATE POLICY "Anyone can view active categories" ON public.service_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.service_categories
  FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage their own services" ON public.services
  FOR ALL USING (
    provider_id IN (SELECT id FROM public.provider_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all services" ON public.services
  FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- RLS Policies for provider_availability
CREATE POLICY "Anyone can view availability" ON public.provider_availability
  FOR SELECT USING (is_available = true);

CREATE POLICY "Providers can manage their availability" ON public.provider_availability
  FOR ALL USING (
    provider_id IN (SELECT id FROM public.provider_profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for cart_items
CREATE POLICY "Users can manage their own cart" ON public.cart_items
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for bookings
CREATE POLICY "Users can view their bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = provider_user_id);

CREATE POLICY "Customers can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Providers and customers can update their bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = provider_user_id);

CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- RLS Policies for payments
CREATE POLICY "Users can view their payments" ON public.payments
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can create payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews for their bookings" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND 
    booking_id IN (SELECT id FROM public.bookings WHERE customer_id = auth.uid() AND status = 'completed')
  );

-- RLS Policies for verification_documents
CREATE POLICY "Providers can manage their documents" ON public.verification_documents
  FOR ALL USING (
    provider_id IN (SELECT id FROM public.provider_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all documents" ON public.verification_documents
  FOR ALL USING (public.get_current_user_role() IN ('admin', 'superadmin'));

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update provider rating
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.provider_profiles 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews 
      WHERE provider_id = NEW.provider_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews 
      WHERE provider_id = NEW.provider_id
    ),
    updated_at = NOW()
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_provider_rating_trigger
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_provider_rating();

-- Insert sample service categories
INSERT INTO public.service_categories (name, description) VALUES
('Home Cleaning', 'Professional home cleaning services'),
('Plumbing', 'Plumbing repairs and installations'),
('Electrical', 'Electrical work and repairs'),
('Beauty & Wellness', 'Beauty treatments and wellness services'),
('Appliance Repair', 'Repair services for home appliances'),
('Painting', 'Interior and exterior painting services');

-- Generate booking numbers function
CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Set default booking number
ALTER TABLE public.bookings ALTER COLUMN booking_number SET DEFAULT public.generate_booking_number();
