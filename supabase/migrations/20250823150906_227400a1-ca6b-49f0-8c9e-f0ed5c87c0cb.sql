
-- Seed approved provider profiles and active services
-- Notes:
-- - We insert approved provider profiles with user_id values that match services.provider_id.
-- - Public can SELECT provider_profiles where verification_status='approved' and services where is_active=true, so RLS will allow reads.
-- - Using gen_random_uuid() for primary keys and ON CONFLICT (id) DO NOTHING to avoid duplicate insert errors if re-run.

-- 1) Providers (approved)
INSERT INTO public.provider_profiles (
  id, user_id, business_name, description, rating, total_reviews,
  verification_status, years_experience, portfolio_images, business_email, business_phone, emergency_services
) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'SparkleClean Co', 'Professional home and office cleaning with attention to detail.', 4.7, 152, 'approved', 6,
    ARRAY[
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1080&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=1080&q=80&auto=format&fit=crop'
    ],
    'hello@sparkleclean.example', '+1 555 100-1000', true
  ),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'FixIT Tech Repair', 'Fast and reliable laptop, desktop, and phone repairs.', 4.8, 98, 'approved', 8,
    ARRAY[
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1080&q=80&auto=format&fit=crop'
    ],
    'support@fixit.example', '+1 555 200-2000', false
  ),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'GreenScape Pros', 'Lawn care and garden design that keeps your outdoors pristine.', 4.6, 73, 'approved', 5,
    ARRAY[
      'https://images.unsplash.com/photo-1599719437592-94132f29b0ed?w=1080&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1080&q=80&auto=format&fit=crop'
    ],
    'book@greenscape.example', '+1 555 300-3000', false
  ),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'HandyHome Services', 'Experienced pros for plumbing, furniture assembly and more.', 4.9, 210, 'approved', 10,
    ARRAY[
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1080&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581091014534-8987c1d64718?w=1080&q=80&auto=format&fit=crop'
    ],
    'contact@handyhome.example', '+1 555 400-4000', true
  )
ON CONFLICT (id) DO NOTHING;

-- 2) Services (active) mapped to above providers via provider_id = provider_profiles.user_id
INSERT INTO public.services (
  id, provider_id, title, description, category, subcategory,
  base_price, duration_minutes, price_type, images, is_active, is_featured, emergency_available
) VALUES
  -- SparkleClean Co (Cleaning)
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Deep Home Cleaning', 'Comprehensive deep cleaning for kitchens, bathrooms, and living areas.', 'Cleaning', 'Deep Cleaning', 120, 180, 'fixed',
    ARRAY[
      'https://images.unsplash.com/photo-1581579188871-45ea61f2a0c8?w=1080&q=80&auto=format&fit=crop'
    ], true, true, true
  ),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Regular Cleaning', 'Weekly or bi-weekly maintenance cleaning to keep your home fresh.', 'Cleaning', 'Regular Cleaning', 80, 120, 'fixed',
    ARRAY[
      'https://images.unsplash.com/photo-1581579188940-f04d6d2c560e?w=1080&q=80&auto=format&fit=crop'
    ], true, false, false
  ),

  -- FixIT Tech Repair (Technology)
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Computer Repair', 'Diagnostics, hardware replacement, and OS issues solved.', 'Technology', 'Computer Repair', 60, 60, 'hourly',
    ARRAY[
      'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=1080&q=80&auto=format&fit=crop'
    ], true, true, false
  ),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Phone Screen Replacement', 'Fast, high-quality screen replacements for most phone models.', 'Technology', 'Phone Repair', 90, 45, 'fixed',
    ARRAY[
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1080&q=80&auto=format&fit=crop'
    ], true, false, false
  ),

  -- GreenScape Pros (Landscaping)
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Lawn Care', 'Mowing, edging, and cleanup to keep your lawn pristine.', 'Landscaping', 'Lawn Care', 50, 60, 'hourly',
    ARRAY[
      'https://images.unsplash.com/photo-1599719437592-94132f29b0ed?w=1080&q=80&auto=format&fit=crop'
    ], true, false, false
  ),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Garden Design', 'Custom plant selection and layout for beautiful gardens.', 'Landscaping', 'Garden Design', 200, 180, 'fixed',
    ARRAY[
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1080&q=80&auto=format&fit=crop'
    ], true, true, false
  ),

  -- HandyHome Services (Home Repair)
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Emergency Plumbing', '24/7 urgent plumbing fixes for leaks and clogs.', 'Home Repair', 'Plumbing', 100, 60, 'hourly',
    ARRAY[
      'https://images.unsplash.com/photo-1581091014534-8987c1d64718?w=1080&q=80&auto=format&fit=crop'
    ], true, true, true
  ),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Furniture Assembly', 'Professional assembly for home and office furniture.', 'Home Repair', 'Assembly', 75, 90, 'fixed',
    ARRAY[
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1080&q=80&auto=format&fit=crop'
    ], true, false, false
  )
ON CONFLICT (id) DO NOTHING;
