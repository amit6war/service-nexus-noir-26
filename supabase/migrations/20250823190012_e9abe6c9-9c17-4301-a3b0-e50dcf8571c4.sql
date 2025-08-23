-- Add detailed address fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address_line_1 text,
ADD COLUMN IF NOT EXISTS address_line_2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'United States',
ADD COLUMN IF NOT EXISTS latitude decimal(10,8),
ADD COLUMN IF NOT EXISTS longitude decimal(11,8);