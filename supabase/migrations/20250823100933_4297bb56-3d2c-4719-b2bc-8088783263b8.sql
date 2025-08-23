
-- 1) Enums (created only if missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE public.booking_status AS ENUM ('pending','accepted','in_progress','completed','cancelled','disputed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
    CREATE TYPE public.message_type AS ENUM ('text','image','file','location','system');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM ('pending','processing','completed','failed','refunded','disputed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM (
      'booking_request','booking_accepted','booking_cancelled','booking_completed',
      'payment_received','payment_failed','review_received','message_received',
      'verification_approved','verification_rejected','system_announcement'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_type') THEN
    CREATE TYPE public.dispute_type AS ENUM ('service_quality','payment','cancellation','no_show','other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_status') THEN
    CREATE TYPE public.dispute_status AS ENUM ('open','investigating','resolved','closed');
  END IF;
END $$;

-- 2) Service categories
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  slug varchar(100) UNIQUE NOT NULL,
  description text,
  icon_url text,
  parent_id uuid REFERENCES public.service_categories(id),
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_categories' AND policyname='Public can view service categories'
  ) THEN
    CREATE POLICY "Public can view service categories"
      ON public.service_categories
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_categories' AND policyname='Admins can manage service categories'
  ) THEN
    CREATE POLICY "Admins can manage service categories"
      ON public.service_categories
      FOR ALL
      TO authenticated
      USING (is_admin(auth.uid()))
      WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

-- 3) Extend existing services table (non-breaking)
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.service_categories(id),
  ADD COLUMN IF NOT EXISTS includes text[],
  ADD COLUMN IF NOT EXISTS excludes text[],
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS emergency_available boolean DEFAULT false;

-- 4) Provider profile metrics (non-breaking)
ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_jobs integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completion_rate numeric(5,2) DEFAULT 0;

-- 5) Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.services(id),
  booking_number varchar(20) UNIQUE NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  service_date timestamptz NOT NULL,
  duration_minutes integer,
  service_address text NOT NULL,
  service_city varchar(100),
  service_state varchar(100),
  service_zip varchar(20),
  coordinates point,
  special_instructions text,
  estimated_price numeric(10,2),
  final_price numeric(10,2),
  platform_fee numeric(10,2),
  provider_earnings numeric(10,2),
  is_emergency boolean DEFAULT false,
  is_recurring boolean DEFAULT false,
  recurring_schedule jsonb,
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  cancelled_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Customers manage their bookings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bookings' AND policyname='Customers can manage own bookings'
  ) THEN
    CREATE POLICY "Customers can manage own bookings"
      ON public.bookings
      FOR ALL
      TO authenticated
      USING (customer_id = auth.uid())
      WITH CHECK (customer_id = auth.uid());
  END IF;

  -- Providers manage assigned bookings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bookings' AND policyname='Providers can manage assigned bookings'
  ) THEN
    CREATE POLICY "Providers can manage assigned bookings"
      ON public.bookings
      FOR ALL
      TO authenticated
      USING (provider_user_id = auth.uid())
      WITH CHECK (provider_user_id = auth.uid());
  END IF;

  -- Admins can view/update all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='bookings' AND policyname='Admins can manage all bookings'
  ) THEN
    CREATE POLICY "Admins can manage all bookings"
      ON public.bookings
      FOR ALL
      TO authenticated
      USING (is_admin(auth.uid()))
      WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

-- 6) Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title varchar(200),
  comment text,
  images text[],
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Reviewers can create/update their reviews
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='Reviewers can insert their reviews'
  ) THEN
    CREATE POLICY "Reviewers can insert their reviews"
      ON public.reviews
      FOR INSERT
      TO authenticated
      WITH CHECK (reviewer_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='Reviewers can update their reviews'
  ) THEN
    CREATE POLICY "Reviewers can update their reviews"
      ON public.reviews
      FOR UPDATE
      TO authenticated
      USING (reviewer_id = auth.uid())
      WITH CHECK (reviewer_id = auth.uid());
  END IF;

  -- Participants and admins can view
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='Participants and admins can view reviews'
  ) THEN
    CREATE POLICY "Participants and admins can view reviews"
      ON public.reviews
      FOR SELECT
      TO authenticated
      USING (
        reviewer_id = auth.uid()
        OR provider_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.id = reviews.booking_id AND b.customer_id = auth.uid()
        )
        OR is_admin(auth.uid())
      );
  END IF;

  -- Admins manage all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='reviews' AND policyname='Admins can manage all reviews'
  ) THEN
    CREATE POLICY "Admins can manage all reviews"
      ON public.reviews
      FOR ALL
      TO authenticated
      USING (is_admin(auth.uid()))
      WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

-- 7) Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id),
  message_type public.message_type NOT NULL DEFAULT 'text',
  content text,
  attachments text[],
  is_read boolean DEFAULT false,
  read_at timestamptz,
  is_system_message boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='Users can send messages'
  ) THEN
    CREATE POLICY "Users can send messages"
      ON public.messages
      FOR INSERT
      TO authenticated
      WITH CHECK (sender_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='Users can view own messages'
  ) THEN
    CREATE POLICY "Users can view own messages"
      ON public.messages
      FOR SELECT
      TO authenticated
      USING (sender_id = auth.uid() OR recipient_id = auth.uid() OR is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='Admins can manage all messages'
  ) THEN
    CREATE POLICY "Admins can manage all messages"
      ON public.messages
      FOR ALL
      TO authenticated
      USING (is_admin(auth.uid()))
      WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

-- 8) Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.profiles(id),
  provider_user_id uuid REFERENCES public.profiles(id),
  payment_intent_id text,
  amount numeric(10,2) NOT NULL,
  platform_fee numeric(10,2),
  provider_earnings numeric(10,2),
  currency varchar(3) DEFAULT 'USD',
  payment_method text,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  stripe_charge_id text,
  refund_amount numeric(10,2) DEFAULT 0,
  refund_reason text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- View own payments (customer/provider) or admin
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Participants and admins can view payments'
  ) THEN
    CREATE POLICY "Participants and admins can view payments"
      ON public.payments
      FOR SELECT
      TO authenticated
      USING (
        customer_id = auth.uid()
        OR provider_user_id = auth.uid()
        OR is_admin(auth.uid())
      );
  END IF;

  -- Allow insert by booking participants (typical flow uses Edge Functions with service role)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Participants can insert payments'
  ) THEN
    CREATE POLICY "Participants can insert payments"
      ON public.payments
      FOR INSERT
      TO authenticated
      WITH CHECK (
        customer_id = auth.uid()
        OR provider_user_id = auth.uid()
        OR is_admin(auth.uid())
      );
  END IF;

  -- Admin can update
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='payments' AND policyname='Admins can update payments'
  ) THEN
    CREATE POLICY "Admins can update payments"
      ON public.payments
      FOR UPDATE
      TO authenticated
      USING (is_admin(auth.uid()))
      WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

-- 9) Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title varchar(200) NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  is_read boolean DEFAULT false,
  read_at timestamptz,
  action_url text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Users can view own notifications'
  ) THEN
    CREATE POLICY "Users can view own notifications"
      ON public.notifications
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid() OR is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Users or admins can insert notifications'
  ) THEN
    CREATE POLICY "Users or admins can insert notifications"
      ON public.notifications
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid() OR is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Users can update own notifications'
  ) THEN
    CREATE POLICY "Users can update own notifications"
      ON public.notifications
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notifications' AND policyname='Admins can manage all notifications'
  ) THEN
    CREATE POLICY "Admins can manage all notifications"
      ON public.notifications
      FOR ALL
      TO authenticated
      USING (is_admin(auth.uid()))
      WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

-- 10) Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_id, provider_user_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorites' AND policyname='Customers manage own favorites'
  ) THEN
    CREATE POLICY "Customers manage own favorites"
      ON public.favorites
      FOR ALL
      TO authenticated
      USING (customer_id = auth.uid())
      WITH CHECK (customer_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorites' AND policyname='Admins can view all favorites'
  ) THEN
    CREATE POLICY "Admins can view all favorites"
      ON public.favorites
      FOR SELECT
      TO authenticated
      USING (is_admin(auth.uid()));
  END IF;
END $$;

-- 11) Disputes
CREATE TABLE IF NOT EXISTS public.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  complainant_id uuid REFERENCES public.profiles(id),
  respondent_id uuid REFERENCES public.profiles(id),
  admin_id uuid REFERENCES public.profiles(id),
  type public.dispute_type NOT NULL,
  status public.dispute_status NOT NULL DEFAULT 'open',
  title varchar(200) NOT NULL,
  description text NOT NULL,
  evidence text[],
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disputes' AND policyname='Complainant can insert disputes'
  ) THEN
    CREATE POLICY "Complainant can insert disputes"
      ON public.disputes
      FOR INSERT
      TO authenticated
      WITH CHECK (complainant_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disputes' AND policyname='Parties and admins can view disputes'
  ) THEN
    CREATE POLICY "Parties and admins can view disputes"
      ON public.disputes
      FOR SELECT
      TO authenticated
      USING (
        complainant_id = auth.uid()
        OR respondent_id = auth.uid()
        OR is_admin(auth.uid())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='disputes' AND policyname='Admins can manage disputes'
  ) THEN
    CREATE POLICY "Admins can manage disputes"
      ON public.disputes
      FOR ALL
      TO authenticated
      USING (is_admin(auth.uid()))
      WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

-- 12) System settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key varchar(100) UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  updated_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Public can view public settings
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='system_settings' AND policyname='Public can view public settings'
  ) THEN
    CREATE POLICY "Public can view public settings"
      ON public.system_settings
      FOR SELECT
      TO public
      USING (is_public = true);
  END IF;

  -- Admins can manage all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='system_settings' AND policyname='Admins can manage all settings'
  ) THEN
    CREATE POLICY "Admins can manage all settings"
      ON public.system_settings
      FOR ALL
      TO authenticated
      USING (is_admin(auth.uid()))
      WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

-- 13) Rating recalculation trigger (handles insert/update/delete)
CREATE OR REPLACE FUNCTION public.recalc_provider_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prov_id uuid;
BEGIN
  -- Determine provider user id from NEW or OLD booking_id
  SELECT b.provider_user_id
    INTO prov_id
  FROM public.bookings b
  WHERE b.id = COALESCE(NEW.booking_id, OLD.booking_id);

  IF prov_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  UPDATE public.provider_profiles pp
  SET
    rating = COALESCE((
      SELECT ROUND(AVG(r.rating)::numeric, 2)
      FROM public.reviews r
      JOIN public.bookings b ON b.id = r.booking_id
      WHERE b.provider_user_id = prov_id
    ), 0),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews r
      JOIN public.bookings b ON b.id = r.booking_id
      WHERE b.provider_user_id = prov_id
    )
  WHERE pp.user_id = prov_id;

  RETURN COALESCE(NEW, OLD);
END
$$;

DROP TRIGGER IF EXISTS trig_recalc_provider_rating ON public.reviews;
CREATE TRIGGER trig_recalc_provider_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.recalc_provider_rating();

-- 14) Storage buckets
insert into storage.buckets (id, name, public) values
  ('profile-images','profile-images', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values
  ('service-images','service-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values
  ('review-images','review-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values
  ('message-attachments','message-attachments', false)
on conflict (id) do nothing;

-- 15) Storage RLS policies (folder convention: "<user_id>/...")
-- service-images: public read, owner write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read service images'
  ) THEN
    CREATE POLICY "Public read service images"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'service-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Upload service images'
  ) THEN
    CREATE POLICY "Upload service images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'service-images' AND (name LIKE auth.uid()::text || '/%'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Manage own service images'
  ) THEN
    CREATE POLICY "Manage own service images"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'service-images' AND (name LIKE auth.uid()::text || '/%'))
      WITH CHECK (bucket_id = 'service-images' AND (name LIKE auth.uid()::text || '/%'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Delete own service images'
  ) THEN
    CREATE POLICY "Delete own service images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'service-images' AND (name LIKE auth.uid()::text || '/%'));
  END IF;
END $$;

-- profile-images: private to owner
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Read own profile images'
  ) THEN
    CREATE POLICY "Read own profile images"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (bucket_id = 'profile-images' AND (name LIKE auth.uid()::text || '/%'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Upload profile images'
  ) THEN
    CREATE POLICY "Upload profile images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'profile-images' AND (name LIKE auth.uid()::text || '/%'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Manage own profile images'
  ) THEN
    CREATE POLICY "Manage own profile images"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'profile-images' AND (name LIKE auth.uid()::text || '/%'))
      WITH CHECK (bucket_id = 'profile-images' AND (name LIKE auth.uid()::text || '/%'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Delete own profile images'
  ) THEN
    CREATE POLICY "Delete own profile images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'profile-images' AND (name LIKE auth.uid()::text || '/%'));
  END IF;
END $$;

-- review-images: public read, owner write
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read review images'
  ) THEN
    CREATE POLICY "Public read review images"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'review-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Upload review images'
  ) THEN
    CREATE POLICY "Upload review images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'review-images' AND (name LIKE auth.uid()::text || '/%'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Manage own review images'
  ) THEN
    CREATE POLICY "Manage own review images"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'review-images' AND (name LIKE auth.uid()::text || '/%'))
      WITH CHECK (bucket_id = 'review-images' AND (name LIKE auth.uid()::text || '/%'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Delete own review images'
  ) THEN
    CREATE POLICY "Delete own review images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'review-images' AND (name LIKE auth.uid()::text || '/%'));
  END IF;
END $$;

-- message-attachments: private to owner
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Read own message attachments'
  ) THEN
    CREATE POLICY "Read own message attachments"
      ON storage.objects
      FOR SELECT
      TO authenticated
      USING (bucket_id = 'message-attachments' AND (name LIKE auth.uid()::text || '/%'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Upload message attachments'
  ) THEN
    CREATE POLICY "Upload message attachments"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'message-attachments' AND (name LIKE auth.uid()::text || '/%'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Manage own message attachments'
  ) THEN
    CREATE POLICY "Manage own message attachments"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'message-attachments' AND (name LIKE auth.uid()::text || '/%'))
      WITH CHECK (bucket_id = 'message-attachments' AND (name LIKE auth.uid()::text || '/%'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Delete own message attachments'
  ) THEN
    CREATE POLICY "Delete own message attachments"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'message-attachments' AND (name LIKE auth.uid()::text || '/%'));
  END IF;
END $$;
