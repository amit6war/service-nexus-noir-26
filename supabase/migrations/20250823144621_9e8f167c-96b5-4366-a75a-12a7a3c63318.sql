
-- Insert approved provider profiles (id is required; set equal to user_id for simplicity)
INSERT INTO public.provider_profiles (
  id, user_id, business_name, description, rating, total_reviews, years_experience,
  business_phone, business_email, business_website, service_areas, certifications,
  verification_status, portfolio_images
)
SELECT
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Elite Home Services',
  'Professional home cleaning and maintenance services with over 10 years of experience.',
  4.8, 156, 10,
  '+1-555-0101', 'contact@elitehome.com', 'https://elitehome.com',
  ARRAY['New York', 'Brooklyn', 'Queens'],
  ARRAY['Licensed', 'Insured', 'Background Checked'],
  'approved',
  ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500']
WHERE NOT EXISTS (SELECT 1 FROM public.provider_profiles WHERE id = '11111111-1111-1111-1111-111111111111');

INSERT INTO public.provider_profiles (
  id, user_id, business_name, description, rating, total_reviews, years_experience,
  business_phone, business_email, business_website, service_areas, certifications,
  verification_status, portfolio_images
)
SELECT
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'TechFix Solutions',
  'Expert computer and electronics repair services. Fast, reliable, and affordable.',
  4.9, 203, 8,
  '+1-555-0202', 'support@techfix.com', 'https://techfixsolutions.com',
  ARRAY['Manhattan', 'Brooklyn', 'Bronx'],
  ARRAY['CompTIA A+', 'Electronics Certified', 'Insured'],
  'approved',
  ARRAY['https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500', 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=500']
WHERE NOT EXISTS (SELECT 1 FROM public.provider_profiles WHERE id = '22222222-2222-2222-2222-222222222222');

INSERT INTO public.provider_profiles (
  id, user_id, business_name, description, rating, total_reviews, years_experience,
  business_phone, business_email, business_website, service_areas, certifications,
  verification_status, portfolio_images
)
SELECT
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  'Garden Masters',
  'Transform your outdoor space with our professional landscaping and gardening services.',
  4.7, 89, 12,
  '+1-555-0303', 'info@gardenmasters.com', 'https://gardenmasters.com',
  ARRAY['Queens', 'Long Island', 'Staten Island'],
  ARRAY['Landscape Certified', 'Organic Gardening', 'Licensed'],
  'approved',
  ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500', 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=500']
WHERE NOT EXISTS (SELECT 1 FROM public.provider_profiles WHERE id = '33333333-3333-3333-3333-333333333333');

INSERT INTO public.provider_profiles (
  id, user_id, business_name, description, rating, total_reviews, years_experience,
  business_phone, business_email, business_website, service_areas, certifications,
  verification_status, portfolio_images
)
SELECT
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  'QuickFix Handyman',
  '24/7 emergency handyman services. No job too small, no problem too big.',
  4.6, 342, 15,
  '+1-555-0404', 'emergency@quickfix.com', 'https://quickfixhandyman.com',
  ARRAY['New York', 'Brooklyn', 'Queens', 'Bronx'],
  ARRAY['Licensed Contractor', 'Insured', 'Emergency Services'],
  'approved',
  ARRAY['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500', 'https://images.unsplash.com/photo-1609010697446-11f2155278f0?w=500']
WHERE NOT EXISTS (SELECT 1 FROM public.provider_profiles WHERE id = '44444444-4444-4444-4444-444444444444');

-- Insert services for each provider (idempotent via NOT EXISTS)
INSERT INTO public.services (
  id, provider_id, title, description, category, subcategory, base_price, duration_minutes,
  price_type, is_active, is_featured, emergency_available, images, service_areas, includes,
  excludes, requirements
)
SELECT
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Deep House Cleaning',
  'Complete deep cleaning service including all rooms, bathrooms, kitchen, and common areas.',
  'Cleaning', 'Deep Cleaning', 120.00, 180,
  'fixed', true, true, false,
  ARRAY['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500'],
  ARRAY['New York', 'Brooklyn', 'Queens'],
  ARRAY['All cleaning supplies', 'Vacuum cleaning', 'Mopping', 'Dusting', 'Bathroom sanitization'],
  ARRAY['Window exterior cleaning', 'Carpet deep cleaning', 'Appliance interior cleaning'],
  ARRAY['Access to property', 'Clear pathways']
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

INSERT INTO public.services (
  id, provider_id, title, description, category, subcategory, base_price, duration_minutes,
  price_type, is_active, is_featured, emergency_available, images, service_areas, includes,
  excludes, requirements
)
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'Regular House Cleaning',
  'Weekly or bi-weekly house cleaning service to keep your home spotless.',
  'Cleaning', 'Regular Cleaning', 80.00, 120,
  'fixed', true, false, false,
  ARRAY['https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=500'],
  ARRAY['New York', 'Brooklyn', 'Queens'],
  ARRAY['Basic cleaning supplies', 'Dusting', 'Vacuuming', 'Kitchen cleaning', 'Bathroom cleaning'],
  ARRAY['Deep cleaning services', 'Window cleaning', 'Organizing'],
  ARRAY['Regular schedule commitment']
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

INSERT INTO public.services (
  id, provider_id, title, description, category, subcategory, base_price, duration_minutes,
  price_type, is_active, is_featured, emergency_available, images, service_areas, includes,
  excludes, requirements
)
SELECT
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '22222222-2222-2222-2222-222222222222',
  'Computer Repair & Diagnostics',
  'Complete computer repair service including hardware diagnostics, software troubleshooting, and virus removal.',
  'Technology', 'Computer Repair', 90.00, 90,
  'hourly', true, true, true,
  ARRAY['https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=500', 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=500'],
  ARRAY['Manhattan', 'Brooklyn', 'Bronx'],
  ARRAY['Full diagnostics', 'Software repair', 'Hardware inspection', 'Virus removal', 'Performance optimization'],
  ARRAY['Hardware replacement parts', 'Data recovery', 'Custom software installation'],
  ARRAY['Computer access', 'Admin passwords if needed']
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE id = 'cccccccc-cccc-cccc-cccc-cccccccccccc');

INSERT INTO public.services (
  id, provider_id, title, description, category, subcategory, base_price, duration_minutes,
  price_type, is_active, is_featured, emergency_available, images, service_areas, includes,
  excludes, requirements
)
SELECT
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '22222222-2222-2222-2222-222222222222',
  'Phone & Tablet Repair',
  'Expert repair services for smartphones and tablets including screen replacement and battery issues.',
  'Technology', 'Mobile Repair', 65.00, 60,
  'fixed', true, false, true,
  ARRAY['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500'],
  ARRAY['Manhattan', 'Brooklyn', 'Bronx'],
  ARRAY['Screen repair', 'Battery replacement', 'Water damage assessment', 'Software troubleshooting'],
  ARRAY['Premium screen protectors', 'Cases', 'Data transfer'],
  ARRAY['Device unlock code', 'Backup important data beforehand']
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE id = 'dddddddd-dddd-dddd-dddd-dddddddddddd');

INSERT INTO public.services (
  id, provider_id, title, description, category, subcategory, base_price, duration_minutes,
  price_type, is_active, is_featured, emergency_available, images, service_areas, includes,
  excludes, requirements
)
SELECT
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '33333333-3333-3333-3333-333333333333',
  'Lawn Care & Maintenance',
  'Professional lawn care including mowing, edging, fertilizing, and seasonal maintenance.',
  'Landscaping', 'Lawn Care', 55.00, 90,
  'fixed', true, false, false,
  ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500', 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=500'],
  ARRAY['Queens', 'Long Island', 'Staten Island'],
  ARRAY['Lawn mowing', 'Edge trimming', 'Leaf cleanup', 'Basic fertilizing'],
  ARRAY['Tree trimming', 'Flower planting', 'Irrigation system work'],
  ARRAY['Yard access', 'Water source available']
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

INSERT INTO public.services (
  id, provider_id, title, description, category, subcategory, base_price, duration_minutes,
  price_type, is_active, is_featured, emergency_available, images, service_areas, includes,
  excludes, requirements
)
SELECT
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '33333333-3333-3333-3333-333333333333',
  'Garden Design & Planting',
  'Custom garden design and professional planting services to beautify your outdoor space.',
  'Landscaping', 'Garden Design', 200.00, 240,
  'fixed', true, true, false,
  ARRAY['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500'],
  ARRAY['Queens', 'Long Island', 'Staten Island'],
  ARRAY['Garden design consultation', 'Plant selection', 'Professional planting', 'Initial watering'],
  ARRAY['Ongoing maintenance', 'Irrigation installation', 'Hardscaping'],
  ARRAY['Site access', 'Soil preparation', 'Design approval']
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE id = 'ffffffff-ffff-ffff-ffff-ffffffffffff');

INSERT INTO public.services (
  id, provider_id, title, description, category, subcategory, base_price, duration_minutes,
  price_type, is_active, is_featured, emergency_available, images, service_areas, includes,
  excludes, requirements
)
SELECT
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  '44444444-4444-4444-4444-444444444444',
  'Emergency Plumbing Repair',
  '24/7 emergency plumbing services for leaks, clogs, and urgent repairs.',
  'Home Repair', 'Plumbing', 125.00, 120,
  'hourly', true, false, true,
  ARRAY['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500'],
  ARRAY['New York', 'Brooklyn', 'Queens', 'Bronx'],
  ARRAY['Emergency response', 'Basic tools', 'Common repair parts', 'Leak detection'],
  ARRAY['Major pipe replacement', 'Appliance installation', 'Permit work'],
  ARRAY['Property access', 'Water shutoff location']
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE id = 'gggggggg-gggg-gggg-gggg-gggggggggggg');

INSERT INTO public.services (
  id, provider_id, title, description, category, subcategory, base_price, duration_minutes,
  price_type, is_active, is_featured, emergency_available, images, service_areas, includes,
  excludes, requirements
)
SELECT
  'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  '44444444-4444-4444-4444-444444444444',
  'Furniture Assembly',
  'Professional furniture assembly service for all types of furniture and equipment.',
  'Home Repair', 'Assembly', 45.00, 90,
  'fixed', true, false, false,
  ARRAY['https://images.unsplash.com/photo-1609010697446-11f2155278f0?w=500'],
  ARRAY['New York', 'Brooklyn', 'Queens', 'Bronx'],
  ARRAY['Professional assembly', 'All necessary tools', 'Hardware check', 'Final inspection'],
  ARRAY['Furniture moving', 'Wall mounting', 'Custom modifications'],
  ARRAY['All parts and hardware included', 'Assembly instructions']
WHERE NOT EXISTS (SELECT 1 FROM public.services WHERE id = 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh');
