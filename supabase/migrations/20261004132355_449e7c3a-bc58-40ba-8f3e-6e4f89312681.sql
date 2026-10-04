DROP INDEX IF EXISTS public.one_super_admin;
INSERT INTO public.user_roles(user_id, role)
SELECT user_id, 'super_admin'::public.app_role FROM public.user_roles WHERE role='admin'
ON CONFLICT (user_id, role) DO NOTHING;
DELETE FROM public.user_roles WHERE role='admin';

CREATE OR REPLACE FUNCTION public.set_admin_role(_user_id uuid, _grant boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'super_admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'You cannot change your own role'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=_user_id) THEN RAISE EXCEPTION 'Account not found'; END IF;
  IF _grant THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (_user_id, 'super_admin') ON CONFLICT DO NOTHING;
    DELETE FROM public.user_roles WHERE user_id=_user_id AND role='admin';
  ELSE
    DELETE FROM public.user_roles WHERE user_id=_user_id AND role IN ('super_admin','admin');
  END IF;
  INSERT INTO public.audit_logs(actor_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), CASE WHEN _grant THEN 'super_admin_granted' ELSE 'super_admin_revoked' END, 'user', _user_id, '{}'::jsonb);
  INSERT INTO public.notifications(user_id, title, message)
  VALUES (_user_id, CASE WHEN _grant THEN 'Super Admin access granted' ELSE 'Super Admin access removed' END,
    CASE WHEN _grant THEN 'You can now manage all platform settings.' ELSE 'Your Administration access has been removed.' END);
END $$;

CREATE POLICY branding_admin_upload ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id='site-branding' AND public.has_role(auth.uid(),'super_admin') AND name ~ '^logo/[a-z0-9-]+\.(png|jpg|webp|svg)$');
CREATE POLICY branding_admin_read ON storage.objects FOR SELECT TO authenticated
USING (bucket_id='site-branding' AND public.has_role(auth.uid(),'super_admin'));
CREATE POLICY branding_admin_delete ON storage.objects FOR DELETE TO authenticated
USING (bucket_id='site-branding' AND public.has_role(auth.uid(),'super_admin'));
