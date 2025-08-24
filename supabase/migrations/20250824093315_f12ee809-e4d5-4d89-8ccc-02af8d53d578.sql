
-- Step 1: Drop existing restrictive policies that block booking creation
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can manage own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Providers can manage assigned bookings" ON public.bookings;

-- Step 2: Recreate permissive policies with clear separation of commands

-- Admins: full access
CREATE POLICY "Admins can manage all bookings"
ON public.bookings
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Customers: can insert their own bookings
CREATE POLICY "Customers can insert own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (customer_id = auth.uid());

-- Participants (customer or provider) and admins: can view their bookings
CREATE POLICY "Participants can view bookings"
ON public.bookings
FOR SELECT
USING (
  customer_id = auth.uid()
  OR provider_user_id = auth.uid()
  OR is_admin(auth.uid())
);

-- Participants (customer or provider) and admins: can update their bookings
CREATE POLICY "Participants can update bookings"
ON public.bookings
FOR UPDATE
USING (
  customer_id = auth.uid()
  OR provider_user_id = auth.uid()
  OR is_admin(auth.uid())
)
WITH CHECK (
  customer_id = auth.uid()
  OR provider_user_id = auth.uid()
  OR is_admin(auth.uid())
);
