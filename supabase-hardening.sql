-- Run once on an existing Supabase project to apply the security fixes
-- from the open-source cleanup. New projects get all of this from
-- supabase-migrations.sql.

-- 1. Nobody writes to temp-avatars anymore. Existing images stay readable.
DROP POLICY IF EXISTS "Anyone can upload temp avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update temp avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete temp avatars" ON storage.objects;

-- 2. Only Stanford addresses may create an account, for every signup path.
CREATE OR REPLACE FUNCTION public.enforce_stanford_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.email IS NULL OR lower(NEW.email) NOT LIKE '%@stanford.edu' THEN
    RAISE EXCEPTION 'Only @stanford.edu email addresses can sign up';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_stanford_email ON auth.users;
CREATE TRIGGER enforce_stanford_email
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.enforce_stanford_email();
