
-- Create the app_role enum type
CREATE TYPE public.app_role AS ENUM ('customer', 'provider', 'admin', 'superadmin');

-- Update the profiles table to use the app_role enum
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE app_role USING role::text::app_role;

-- Add unique constraint on email in auth.users (this is handled by Supabase automatically)
-- Add additional fields to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add gender column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE public.profiles ADD COLUMN gender text;
    END IF;
    
    -- Ensure the handle_new_user function works with the new structure
END $$;

-- Update the handle_new_user function to properly handle the new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone, gender, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'gender',
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer'::app_role)
  );
  RETURN NEW;
END;
$$;
