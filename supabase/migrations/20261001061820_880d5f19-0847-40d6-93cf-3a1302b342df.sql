CREATE TABLE public.kyc_documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 doc_type text NOT NULL CHECK (doc_type IN ('passport','national_id','drivers_license','proof_of_address','selfie')),
 file_path text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.kyc_documents TO authenticated;
GRANT ALL ON public.kyc_documents TO service_role;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY kyc_docs_read ON public.kyc_documents FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY kyc_docs_insert ON public.kyc_documents FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND file_path LIKE auth.uid()::text || '/%');

CREATE POLICY kyc_obj_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='kyc-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY kyc_obj_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='kyc-documents' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_staff(auth.uid())));

CREATE TABLE public.trader_connections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 trader_id uuid NOT NULL REFERENCES public.traders(id) ON DELETE CASCADE,
 platform text NOT NULL CHECK (platform IN ('mt4','mt5','deriv')),
 account_login text NOT NULL,
 server text,
 provider_account_id text,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','connected','failed','disconnected')),
 last_error text,
 balance numeric,
 equity numeric,
 currency text,
 last_synced_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (trader_id, platform, account_login)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trader_connections TO authenticated;
GRANT SELECT ON public.trader_connections TO anon;
GRANT ALL ON public.trader_connections TO service_role;
ALTER TABLE public.trader_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY conn_public_read ON public.trader_connections FOR SELECT TO anon, authenticated USING (status='connected' OR public.is_staff(auth.uid()));
CREATE POLICY conn_staff_insert ON public.trader_connections FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY conn_staff_update ON public.trader_connections FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY conn_staff_delete ON public.trader_connections FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE TRIGGER trader_connections_touch BEFORE UPDATE ON public.trader_connections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();