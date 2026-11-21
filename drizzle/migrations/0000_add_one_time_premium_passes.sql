CREATE TABLE public.premium_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL DEFAULT 'merchant-of-record',
  provider_order_id text NOT NULL UNIQUE,
  plan text NOT NULL CHECK (plan IN ('30', '90')),
  starts_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'refunded')),
  currency text,
  amount integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.premium_passes TO authenticated;
GRANT ALL ON public.premium_passes TO service_role;
ALTER TABLE public.premium_passes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read their own premium passes" ON public.premium_passes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE INDEX premium_passes_user_expiry_idx ON public.premium_passes (user_id, expires_at);

CREATE TABLE public.payment_unmatched_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'merchant-of-record',
  provider_order_id text NOT NULL UNIQUE,
  reason text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_unmatched_orders TO service_role;
ALTER TABLE public.payment_unmatched_orders ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION public.record_premium_payment(p_user_id uuid, p_order_id text, p_plan text, p_currency text DEFAULT NULL, p_amount integer DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_starts_at timestamptz;
BEGIN
  IF p_plan NOT IN ('30', '90') OR p_plan IS NULL OR p_order_id IS NULL OR length(p_order_id) = 0 THEN
    RAISE EXCEPTION 'Invalid payment';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  IF EXISTS (SELECT 1 FROM public.premium_passes WHERE provider_order_id = p_order_id) THEN
    RETURN;
  END IF;
  SELECT greatest(now(), coalesce(max(expires_at), now())) INTO v_starts_at
    FROM public.premium_passes WHERE user_id = p_user_id AND status = 'active';
  INSERT INTO public.premium_passes (user_id, provider_order_id, plan, starts_at, expires_at, currency, amount)
    VALUES (p_user_id, p_order_id, p_plan, v_starts_at, v_starts_at + (p_plan::integer * interval '1 day'), p_currency, p_amount)
    ON CONFLICT (provider_order_id) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.record_premium_payment(uuid, text, text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_premium_payment(uuid, text, text, text, integer) TO service_role;