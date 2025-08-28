
-- End any existing transactions and start fresh
COMMIT;

-- Drop existing objects in the correct order to avoid dependency issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;

-- Safely recreate the app_role enum
DO $$ 
BEGIN
    -- Check if the enum exists and drop it if it does
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        DROP TYPE app_role CASCADE;
    END IF;
    
    -- Create the enum type
    CREATE TYPE app_role AS ENUM ('customer', 'provider', 'admin', 'superadmin');
END $$;

-- Recreate the handle_new_user function with improved error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Start a new transaction block for this function
  BEGIN
    -- Get the role from metadata, default to customer
    user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'customer'::app_role);
    
    -- Insert into profiles table
    INSERT INTO public.profiles (
      id, 
      first_name, 
      last_name, 
      phone, 
      role
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      user_role
    );
    
    RETURN NEW;
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't block user creation
      RAISE WARNING 'Failed to create profile for user %: %, SQLSTATE: %', NEW.id, SQLERRM, SQLSTATE;
      RETURN NEW;
  END;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recreate the get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(role, 'customer'::app_role) FROM public.profiles WHERE id = auth.uid();
$$;

-- Ensure the profiles table has the correct structure
ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'customer'::app_role;

-- Commit the transaction
COMMIT;
