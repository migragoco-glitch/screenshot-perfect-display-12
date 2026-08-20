CREATE TABLE public.founders_circle_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.founders_circle_signups TO anon, authenticated;
GRANT ALL ON public.founders_circle_signups TO service_role;
ALTER TABLE public.founders_circle_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join the founders circle"
  ON public.founders_circle_signups FOR INSERT TO anon, authenticated
  WITH CHECK (length(email) BETWEEN 5 AND 255 AND email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$');

CREATE TABLE public.csat_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  positive BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.csat_responses TO anon, authenticated;
GRANT ALL ON public.csat_responses TO service_role;
ALTER TABLE public.csat_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a csat response"
  ON public.csat_responses FOR INSERT TO anon, authenticated
  WITH CHECK (length(session_id) BETWEEN 1 AND 64);

CREATE TABLE public.nps_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 10),
  comment TEXT CHECK (comment IS NULL OR length(comment) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.nps_responses TO anon, authenticated;
GRANT ALL ON public.nps_responses TO service_role;
ALTER TABLE public.nps_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an nps response"
  ON public.nps_responses FOR INSERT TO anon, authenticated
  WITH CHECK (length(session_id) BETWEEN 1 AND 64);

CREATE TABLE public.roadmap_progress (
  user_id UUID NOT NULL DEFAULT auth.uid(),
  task_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, task_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_progress TO authenticated;
GRANT ALL ON public.roadmap_progress TO service_role;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own roadmap progress"
  ON public.roadmap_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.validation_signals()
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'founders_circle', (SELECT count(*) FROM public.founders_circle_signups),
    'csat_total', (SELECT count(*) FROM public.csat_responses),
    'csat_positive', (SELECT count(*) FROM public.csat_responses WHERE positive),
    'nps_total', (SELECT count(*) FROM public.nps_responses),
    'nps_avg', (SELECT coalesce(round(avg(score)::numeric, 1), 0) FROM public.nps_responses),
    'nps_promoters', (SELECT count(*) FROM public.nps_responses WHERE score >= 9),
    'nps_detractors', (SELECT count(*) FROM public.nps_responses WHERE score <= 6)
  );
$$;
GRANT EXECUTE ON FUNCTION public.validation_signals() TO anon, authenticated;