-- =========================================================================
-- Phase 1: Admin auth, roles, pastors, and public submission inboxes
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- ENUMS ----------
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'editor');
CREATE TYPE public.submission_status AS ENUM ('new', 'in_progress', 'resolved', 'archived');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'declined', 'completed', 'cancelled', 'archived');
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected', 'archived');

-- ---------- updated_at helper ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================================
-- USER ROLES
-- =========================================================================
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin', 'editor')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Super admin inserts roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin updates roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin deletes roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================================
-- PASTORS
-- =========================================================================
CREATE TABLE public.pastors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT 'Pastor',
  bio text,
  photo_url text,
  email text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.pastors FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, full_name, title, bio, photo_url, sort_order) ON public.pastors TO anon;
GRANT SELECT ON public.pastors TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pastors TO authenticated;
GRANT ALL ON public.pastors TO service_role;

ALTER TABLE public.pastors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active pastors" ON public.pastors
  FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Staff reads all pastors" ON public.pastors
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins insert pastors" ON public.pastors
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update pastors" ON public.pastors
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Super admin deletes pastors" ON public.pastors
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER pastors_set_updated_at BEFORE UPDATE ON public.pastors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.pastors (full_name, title, bio, sort_order, is_active)
VALUES ('Pastor Abiodun Bamgbala', 'Lead Pastor', 'Lead Pastor of RCCG Praise Palace Northampton.', 0, true)
ON CONFLICT (full_name) DO NOTHING;

-- =========================================================================
-- CONTACT MESSAGES
-- =========================================================================
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  subject text,
  message text NOT NULL CHECK (length(btrim(message)) > 0),
  is_read boolean NOT NULL DEFAULT false,
  status public.submission_status NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.contact_messages FROM PUBLIC, anon, authenticated;
GRANT INSERT (first_name, last_name, email, subject, message) ON public.contact_messages TO anon, authenticated;
GRANT SELECT ON public.contact_messages TO authenticated;
GRANT UPDATE (is_read, status, admin_notes) ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone submits contact" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (is_read = false AND status = 'new' AND admin_notes IS NULL);
CREATE POLICY "Staff read contact" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins update contact" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER contact_set_updated_at BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- APPOINTMENT REQUESTS
-- =========================================================================
CREATE TABLE public.appointment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  pastor_id uuid NOT NULL REFERENCES public.pastors(id) ON DELETE RESTRICT,
  pastor_name text,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  reason text,
  notes text,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  is_read boolean NOT NULL DEFAULT false,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.appointment_requests FROM PUBLIC, anon, authenticated;
GRANT INSERT (name, email, phone, pastor_id, appointment_date, appointment_time, reason, notes)
  ON public.appointment_requests TO anon, authenticated;
GRANT SELECT ON public.appointment_requests TO authenticated;
GRANT UPDATE (status, is_read, admin_notes) ON public.appointment_requests TO authenticated;
GRANT ALL ON public.appointment_requests TO service_role;

ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone submits appointment" ON public.appointment_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND is_read = false AND admin_notes IS NULL);
CREATE POLICY "Staff read appointments" ON public.appointment_requests
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins update appointments" ON public.appointment_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.appointment_before_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_name text;
  v_active boolean;
BEGIN
  SELECT full_name, is_active INTO v_name, v_active
  FROM public.pastors WHERE id = NEW.pastor_id;
  IF v_name IS NULL THEN
    RAISE EXCEPTION 'Pastor not found';
  END IF;
  IF NOT v_active THEN
    RAISE EXCEPTION 'Selected pastor is not accepting appointments';
  END IF;
  IF NEW.appointment_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Appointment date must be today or later';
  END IF;
  NEW.pastor_name := v_name;
  RETURN NEW;
END;
$$;

CREATE TRIGGER appointment_before_insert_trg
  BEFORE INSERT ON public.appointment_requests
  FOR EACH ROW EXECUTE FUNCTION public.appointment_before_insert();

CREATE TRIGGER appointment_set_updated_at BEFORE UPDATE ON public.appointment_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- PRAYER REQUESTS
-- =========================================================================
CREATE TABLE public.prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text CHECK (email IS NULL OR email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  request text NOT NULL CHECK (length(btrim(request)) > 0),
  is_urgent boolean NOT NULL DEFAULT false,
  is_anonymous boolean NOT NULL DEFAULT false,
  is_read boolean NOT NULL DEFAULT false,
  status public.submission_status NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prayer_named_unless_anonymous CHECK (
    is_anonymous = true
    OR (full_name IS NOT NULL AND length(btrim(full_name)) > 0)
  )
);

REVOKE ALL ON public.prayer_requests FROM PUBLIC, anon, authenticated;
GRANT INSERT (full_name, email, phone, request, is_urgent, is_anonymous)
  ON public.prayer_requests TO anon, authenticated;
GRANT SELECT ON public.prayer_requests TO authenticated;
GRANT UPDATE (is_read, status, admin_notes) ON public.prayer_requests TO authenticated;
GRANT ALL ON public.prayer_requests TO service_role;

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone submits prayer" ON public.prayer_requests
  FOR INSERT TO anon, authenticated
  WITH CHECK (is_read = false AND status = 'new' AND admin_notes IS NULL);
CREATE POLICY "Staff read prayer" ON public.prayer_requests
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins update prayer" ON public.prayer_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER prayer_set_updated_at BEFORE UPDATE ON public.prayer_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================================
-- TESTIMONY SUBMISSIONS
-- =========================================================================
CREATE TABLE public.testimony_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  title text NOT NULL,
  testimony text NOT NULL CHECK (length(btrim(testimony)) > 0),
  allow_publish boolean NOT NULL DEFAULT false,
  review_status public.review_status NOT NULL DEFAULT 'pending',
  is_published boolean NOT NULL DEFAULT false,
  is_read boolean NOT NULL DEFAULT false,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT testimony_publish_requires_consent CHECK (
    is_published = false
    OR (allow_publish = true AND review_status = 'approved')
  )
);

REVOKE ALL ON public.testimony_submissions FROM PUBLIC, anon, authenticated;
GRANT INSERT (full_name, email, title, testimony, allow_publish) ON public.testimony_submissions TO anon, authenticated;
GRANT SELECT (id, full_name, title, testimony, created_at) ON public.testimony_submissions TO anon;
GRANT SELECT ON public.testimony_submissions TO authenticated;
GRANT UPDATE (review_status, is_published, is_read, admin_notes) ON public.testimony_submissions TO authenticated;
GRANT ALL ON public.testimony_submissions TO service_role;

ALTER TABLE public.testimony_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone submits testimony" ON public.testimony_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    review_status = 'pending' AND is_published = false
    AND is_read = false AND admin_notes IS NULL
  );
CREATE POLICY "Staff read testimony" ON public.testimony_submissions
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins update testimony" ON public.testimony_submissions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anon reads published testimonies" ON public.testimony_submissions
  FOR SELECT TO anon
  USING (review_status = 'approved' AND is_published = true AND allow_publish = true);

CREATE TRIGGER testimony_set_updated_at BEFORE UPDATE ON public.testimony_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE VIEW public.published_testimonies
WITH (security_invoker = true) AS
SELECT id, full_name, title, testimony, created_at
FROM public.testimony_submissions
WHERE review_status = 'approved' AND is_published = true AND allow_publish = true;

GRANT SELECT ON public.published_testimonies TO anon, authenticated;

-- =========================================================================
-- VISIT PLANS
-- =========================================================================
CREATE TABLE public.visit_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  service text,
  visit_date date,
  number_of_adults integer NOT NULL DEFAULT 1 CHECK (number_of_adults >= 1),
  number_of_children integer NOT NULL DEFAULT 0 CHECK (number_of_children >= 0),
  notes text,
  is_read boolean NOT NULL DEFAULT false,
  status public.submission_status NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.visit_plans FROM PUBLIC, anon, authenticated;
GRANT INSERT (full_name, email, phone, service, visit_date, number_of_adults, number_of_children, notes)
  ON public.visit_plans TO anon, authenticated;
GRANT SELECT ON public.visit_plans TO authenticated;
GRANT UPDATE (is_read, status, admin_notes) ON public.visit_plans TO authenticated;
GRANT ALL ON public.visit_plans TO service_role;

ALTER TABLE public.visit_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone submits visit" ON public.visit_plans
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    is_read = false AND status = 'new' AND admin_notes IS NULL
    AND (visit_date IS NULL OR visit_date >= CURRENT_DATE)
  );
CREATE POLICY "Staff read visit" ON public.visit_plans
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins update visit" ON public.visit_plans
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER visit_set_updated_at BEFORE UPDATE ON public.visit_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
