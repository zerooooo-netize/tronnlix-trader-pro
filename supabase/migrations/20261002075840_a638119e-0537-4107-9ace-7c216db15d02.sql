CREATE OR REPLACE FUNCTION public.list_user_roles()
RETURNS TABLE(user_id uuid, role app_role)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY SELECT r.user_id, r.role FROM public.user_roles r WHERE r.role IN ('admin','super_admin');
END $$;

CREATE OR REPLACE FUNCTION public.set_admin_role(_user_id uuid, _grant boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  IF public.has_role(_user_id,'super_admin') THEN RAISE EXCEPTION 'The Super Admin account cannot be changed'; END IF;
  IF _user_id = auth.uid() THEN RAISE EXCEPTION 'You cannot change your own role'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id=_user_id) THEN RAISE EXCEPTION 'Account not found'; END IF;
  IF _grant THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (_user_id,'admin') ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id=_user_id AND role='admin';
  END IF;
  INSERT INTO public.audit_logs(actor_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), CASE WHEN _grant THEN 'admin_granted' ELSE 'admin_revoked' END, 'user', _user_id, '{}'::jsonb);
  INSERT INTO public.notifications(user_id, title, message)
  VALUES (_user_id, CASE WHEN _grant THEN 'Admin access granted' ELSE 'Admin access removed' END,
    CASE WHEN _grant THEN 'You can now open the Administration workspace.' ELSE 'Your Administration access has been removed.' END);
END $$;

REVOKE EXECUTE ON FUNCTION public.list_user_roles() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_admin_role(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_user_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_admin_role(uuid, boolean) TO authenticated;