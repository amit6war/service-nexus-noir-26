-- Seed providers and services using existing auth users to satisfy FK
-- Build a temporary mapping of 4 real users
CREATE TEMP TABLE tmp_mapped AS
SELECT (ARRAY['p1','p2','p3','p4'])[ROW_NUMBER() OVER ()] AS label, id
FROM (
  SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 4
) t;

-- Safety: ensure we actually have 4 users
DO $$
DECLARE cnt int;
BEGIN
  SELECT COUNT(*) INTO cnt FROM tmp_mapped;
  IF cnt < 4 THEN
    RAISE EXCEPTION 'Not enough users to seed providers (need 4, found %)', cnt;
  END IF;
END $$;

-- Clean any previous seed data
DELETE FROM public.services s
USING tmp_mapped m
WHERE s.provider_id = m.id;

DELETE FROM public.provider_profiles pp
USING tmp_mapped m
WHERE pp.user_id = m.id;

-- Insert approved providers
INSERT INTO public.provider_profiles (
  id, user_id, business_name, description, rating, total_reviews,
  verification_status, years_experience, portfolio_images,
  business_email, business_phone, emergency_services
)
SELECT 
  m.id AS id,
  m.id AS user_id,
  CASE m.label
    WHEN 'p1' THEN 'SparkleClean Co'
    WHEN 'p2' THEN 'FixIT Tech Repair'
    WHEN 'p3' THEN 'GreenScape Pros'
    ELSE 'HandyHome Services'
  END AS business_name,
  CASE m.label
    WHEN 'p1' THEN 'Professional home and office cleaning with attention to detail.'
    WHEN 'p2' THEN 'Fast and reliable laptop, desktop, and phone repairs.'
    WHEN 'p3' THEN 'Lawn care and garden design that keeps your outdoors pristine.'
    ELSE 'Experienced pros for plumbing, furniture assembly and more.'
  END AS description,
  CASE m.label
    WHEN 'p1' THEN 4.7
    WHEN 'p2' THEN 4.8
    WHEN 'p3' THEN 4.6
    ELSE 4.9
  END AS rating,
  CASE m.label
    WHEN 'p1' THEN 152
    WHEN 'p2' THEN 98
    WHEN 'p3' THEN 73
    ELSE 210
  END AS total_reviews,
  'approved'::verification_status,
  CASE m.label
    WHEN 'p1' THEN 6
    WHEN 'p2' THEN 8
    WHEN 'p3' THEN 5
    ELSE 10
  END AS years_experience,
  CASE m.label
    WHEN 'p1' THEN ARRAY[
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1080&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=1080&q=80&auto=format&fit=crop'
    ]
    WHEN 'p2' THEN ARRAY[
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1080&q=80&auto=format&fit=crop'
    ]
    WHEN 'p3' THEN ARRAY[
      'https://images.unsplash.com/photo-1599719437592-94132f29b0ed?w=1080&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1080&q=80&auto=format&fit=crop'
    ]
    ELSE ARRAY[
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1080&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581091014534-8987c1d64718?w=1080&q=80&auto=format&fit=crop'
    ]
  END AS portfolio_images,
  CASE m.label
    WHEN 'p1' THEN 'hello@sparkleclean.example'
    WHEN 'p2' THEN 'support@fixit.example'
    WHEN 'p3' THEN 'book@greenscape.example'
    ELSE 'contact@handyhome.example'
  END AS business_email,
  CASE m.label
    WHEN 'p1' THEN '+1 555 100-1000'
    WHEN 'p2' THEN '+1 555 200-2000'
    WHEN 'p3' THEN '+1 555 300-3000'
    ELSE '+1 555 400-4000'
  END AS business_phone,
  CASE m.label
    WHEN 'p1' THEN true
    WHEN 'p2' THEN false
    WHEN 'p3' THEN false
    ELSE true
  END AS emergency_services
FROM tmp_mapped m;

-- Insert 8 services (2 per provider)
INSERT INTO public.services (
  id, provider_id, title, description, category, subcategory,
  base_price, duration_minutes, price_type, images, is_active, is_featured, emergency_available
)
SELECT * FROM (
  SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'::uuid, (SELECT id FROM tmp_mapped WHERE label='p1'),
         'Deep Home Cleaning', 'Comprehensive deep cleaning for kitchens, bathrooms, and living areas.',
         'Cleaning', 'Deep Cleaning', 120, 180, 'fixed',
         ARRAY['https://images.unsplash.com/photo-1581579188871-45ea61f2a0c8?w=1080&q=80&auto=format&fit=crop'], true, true, true
  UNION ALL
  SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'::uuid, (SELECT id FROM tmp_mapped WHERE label='p1'),
         'Regular Cleaning', 'Weekly or bi-weekly maintenance cleaning to keep your home fresh.',
         'Cleaning', 'Regular Cleaning', 80, 120, 'fixed',
         ARRAY['https://images.unsplash.com/photo-1581579188940-f04d6d2c560e?w=1080&q=80&auto=format&fit=crop'], true, false, false
  UNION ALL
  SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid, (SELECT id FROM tmp_mapped WHERE label='p2'),
         'Computer Repair', 'Diagnostics, hardware replacement, and OS issues solved.',
         'Technology', 'Computer Repair', 60, 60, 'hourly',
         ARRAY['https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=1080&q=80&auto=format&fit=crop'], true, true, false
  UNION ALL
  SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2'::uuid, (SELECT id FROM tmp_mapped WHERE label='p2'),
         'Phone Screen Replacement', 'Fast, high-quality screen replacements for most phone models.',
         'Technology', 'Phone Repair', 90, 45, 'fixed',
         ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1080&q=80&auto=format&fit=crop'], true, false, false
  UNION ALL
  SELECT 'cccccccc-cccc-cccc-cccc-ccccccccccc1'::uuid, (SELECT id FROM tmp_mapped WHERE label='p3'),
         'Lawn Care', 'Mowing, edging, and cleanup to keep your lawn pristine.',
         'Landscaping', 'Lawn Care', 50, 60, 'hourly',
         ARRAY['https://images.unsplash.com/photo-1599719437592-94132f29b0ed?w=1080&q=80&auto=format&fit=crop'], true, false, false
  UNION ALL
  SELECT 'cccccccc-cccc-cccc-cccc-ccccccccccc2'::uuid, (SELECT id FROM tmp_mapped WHERE label='p3'),
         'Garden Design', 'Custom plant selection and layout for beautiful gardens.',
         'Landscaping', 'Garden Design', 200, 180, 'fixed',
         ARRAY['https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1080&q=80&auto=format&fit=crop'], true, true, false
  UNION ALL
  SELECT 'dddddddd-dddd-dddd-dddd-ddddddddddd1'::uuid, (SELECT id FROM tmp_mapped WHERE label='p4'),
         'Emergency Plumbing', '24/7 urgent plumbing fixes for leaks and clogs.',
         'Home Repair', 'Plumbing', 100, 60, 'hourly',
         ARRAY['https://images.unsplash.com/photo-1581091014534-8987c1d64718?w=1080&q=80&auto=format&fit=crop'], true, true, true
  UNION ALL
  SELECT 'dddddddd-dddd-dddd-dddd-ddddddddddd2'::uuid, (SELECT id FROM tmp_mapped WHERE label='p4'),
         'Furniture Assembly', 'Professional assembly for home and office furniture.',
         'Home Repair', 'Assembly', 75, 90, 'fixed',
         ARRAY['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1080&q=80&auto=format&fit=crop'], true, false, false
) s(
  id, provider_id, title, description, category, subcategory,
  base_price, duration_minutes, price_type, images, is_active, is_featured, emergency_available
);

-- Cleanup temp table
DROP TABLE IF EXISTS tmp_mapped;