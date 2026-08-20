REVOKE EXECUTE ON FUNCTION public.validation_signals() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.validation_signals() TO service_role;
REVOKE SELECT ON public.founders_circle_signups FROM anon, authenticated;
GRANT INSERT ON public.founders_circle_signups TO anon, authenticated;
GRANT ALL ON public.founders_circle_signups TO service_role;