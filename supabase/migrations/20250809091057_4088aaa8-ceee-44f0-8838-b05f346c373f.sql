-- Add gender column to profiles for capturing user gender during signup
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gender text;

-- Storage policies for verification-documents bucket to allow providers to upload their own files and admins to access all
-- Ensure RLS is enabled on storage.objects (it is by default in Supabase projects)

-- Providers can upload their own verification documents into a folder named by their user id
CREATE POLICY IF NOT EXISTS "Providers can upload verification docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Providers can view their own verification documents
CREATE POLICY IF NOT EXISTS "Providers can read their verification docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all verification documents
CREATE POLICY IF NOT EXISTS "Admins can view all verification docs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents' AND public.is_admin(auth.uid())
);

-- Admins can update/delete verification documents
CREATE POLICY IF NOT EXISTS "Admins can manage verification docs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-documents' AND public.is_admin(auth.uid())
);

CREATE POLICY IF NOT EXISTS "Admins can delete verification docs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-documents' AND public.is_admin(auth.uid())
);