CREATE TABLE public.prime_ai_gateway_status (
  id integer PRIMARY KEY CHECK (id = 1),
  provider_blocked boolean NOT NULL DEFAULT false,
  safe_message text NOT NULL DEFAULT '',
  blocked_at timestamptz
);
GRANT ALL ON public.prime_ai_gateway_status TO service_role;
ALTER TABLE public.prime_ai_gateway_status ENABLE ROW LEVEL SECURITY;