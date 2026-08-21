CREATE TABLE public.founder_demo_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  email text NOT NULL UNIQUE,
  access_code text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.founder_demo_access TO service_role;

ALTER TABLE public.founder_demo_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No client access to founder demo accounts"
ON public.founder_demo_access
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);