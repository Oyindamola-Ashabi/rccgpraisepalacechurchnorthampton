-- 1. Private, non-exposed schema
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- 2. Role-check helpers, SECURITY DEFINER, locked search_path
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin', 'editor')
  );
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated, service_role;

-- 3. Repoint every policy
DROP POLICY IF EXISTS "Admins update appointments" ON public.appointment_requests;
CREATE POLICY "Admins update appointments" ON public.appointment_requests FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Staff read appointments" ON public.appointment_requests;
CREATE POLICY "Staff read appointments" ON public.appointment_requests FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins update contact" ON public.contact_messages;
CREATE POLICY "Admins update contact" ON public.contact_messages FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Staff read contact" ON public.contact_messages;
CREATE POLICY "Staff read contact" ON public.contact_messages FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins update prayer" ON public.prayer_requests;
CREATE POLICY "Admins update prayer" ON public.prayer_requests FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Staff read prayer" ON public.prayer_requests;
CREATE POLICY "Staff read prayer" ON public.prayer_requests FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins update testimony" ON public.testimony_submissions;
CREATE POLICY "Admins update testimony" ON public.testimony_submissions FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Staff read testimony" ON public.testimony_submissions;
CREATE POLICY "Staff read testimony" ON public.testimony_submissions FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins update visit" ON public.visit_plans;
CREATE POLICY "Admins update visit" ON public.visit_plans FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Staff read visit" ON public.visit_plans;
CREATE POLICY "Staff read visit" ON public.visit_plans FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins insert pastors" ON public.pastors;
CREATE POLICY "Admins insert pastors" ON public.pastors FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins update pastors" ON public.pastors;
CREATE POLICY "Admins update pastors" ON public.pastors FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Staff reads all pastors" ON public.pastors;
CREATE POLICY "Staff reads all pastors" ON public.pastors FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Super admin deletes pastors" ON public.pastors;
CREATE POLICY "Super admin deletes pastors" ON public.pastors FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super admin deletes roles" ON public.user_roles;
CREATE POLICY "Super admin deletes roles" ON public.user_roles FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Super admin inserts roles" ON public.user_roles;
CREATE POLICY "Super admin inserts roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Super admin updates roles" ON public.user_roles;
CREATE POLICY "Super admin updates roles" ON public.user_roles FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'));
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.is_staff(auth.uid()));

-- 4. Remove the exposed originals
DROP FUNCTION public.has_role(uuid, public.app_role);
DROP FUNCTION public.is_staff(uuid);