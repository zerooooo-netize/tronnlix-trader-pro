CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin manages settings" ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER app_settings_touch BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.user_trading_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  platform text NOT NULL CHECK (platform IN ('mt4','mt5','deriv')),
  account_login text NOT NULL,
  server text,
  provider_account_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','connected','failed','disconnected')),
  balance numeric, equity numeric, currency text,
  last_error text, last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform, account_login)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_trading_accounts TO authenticated;
GRANT ALL ON public.user_trading_accounts TO service_role;
ALTER TABLE public.user_trading_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner or staff read" ON public.user_trading_accounts FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Owner insert" ON public.user_trading_accounts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner update" ON public.user_trading_accounts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owner or staff delete" ON public.user_trading_accounts FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE TRIGGER user_trading_accounts_touch BEFORE UPDATE ON public.user_trading_accounts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.exec_sql(_sql text, _actor uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb; n bigint; q text := btrim(_sql);
BEGIN
  IF NOT public.has_role(_actor,'super_admin') THEN RAISE EXCEPTION 'Only the Super Admin can run SQL'; END IF;
  INSERT INTO public.audit_logs(actor_id, action, entity_type, details) VALUES (_actor, 'sql_console', 'database', jsonb_build_object('sql', left(q, 4000)));
  IF q ~* '^(select|with|table|values|show|explain)' THEN
    EXECUTE format('SELECT coalesce(jsonb_agg(t), ''[]''::jsonb) FROM (%s) t', rtrim(q, '; ')) INTO result;
    RETURN jsonb_build_object('rows', result);
  ELSE
    EXECUTE q; GET DIAGNOSTICS n = ROW_COUNT;
    RETURN jsonb_build_object('affected', n);
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.exec_sql(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text, uuid) TO service_role;