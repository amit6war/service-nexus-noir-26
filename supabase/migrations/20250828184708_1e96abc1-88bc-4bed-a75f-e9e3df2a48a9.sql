
-- Add category and subcategory columns to services table
ALTER TABLE public.services 
ADD COLUMN category TEXT,
ADD COLUMN subcategory TEXT;

-- Update existing services to have a default category if needed
UPDATE public.services 
SET category = 'General Services' 
WHERE category IS NULL;
