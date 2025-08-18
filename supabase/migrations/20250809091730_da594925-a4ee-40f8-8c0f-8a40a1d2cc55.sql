-- Add gender column to profiles for capturing user gender during signup
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gender text;

-- Create storage policies for verification-documents bucket using conditional DO blocks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'storage' AND p.tablename = 'objects' AND p.policyname = 'Providers can upload verification docs'
  ) THEN
    CREATE POLICY "Providers can upload verification docs"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'storage' AND p.tablename = 'objects' AND p.policyname = 'Providers can read their verification docs'
  ) THEN
    CREATE POLICY "Providers can read their verification docs"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'storage' AND p.tablename = 'objects' AND p.policyname = 'Admins can view all verification docs'
  ) THEN
    CREATE POLICY "Admins can view all verification docs"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
      bucket_id = 'verification-documents' AND public.is_admin(auth.uid())
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'storage' AND p.tablename = 'objects' AND p.policyname = 'Admins can manage verification docs'
  ) THEN
    CREATE POLICY "Admins can manage verification docs"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'verification-documents' AND public.is_admin(auth.uid())
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = 'storage' AND p.tablename = 'objects' AND p.policyname = 'Admins can delete verification docs'
  ) THEN
    CREATE POLICY "Admins can delete verification docs"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'verification-documents' AND public.is_admin(auth.uid())
    );
  END IF;
END$$;