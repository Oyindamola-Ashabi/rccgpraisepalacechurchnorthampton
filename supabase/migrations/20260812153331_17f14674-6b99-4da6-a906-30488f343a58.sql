ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE public.appointment_status ADD VALUE IF NOT EXISTS 'reschedule_requested';

ALTER TABLE public.appointment_requests
  ADD COLUMN IF NOT EXISTS proposed_date date,
  ADD COLUMN IF NOT EXISTS proposed_time time without time zone,
  ADD COLUMN IF NOT EXISTS reschedule_message text,
  ADD COLUMN IF NOT EXISTS pastor_notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS visitor_notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS visitor_notified_status public.appointment_status,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz,
  ADD COLUMN IF NOT EXISTS status_changed_by uuid;

GRANT SELECT (proposed_date, proposed_time, reschedule_message, pastor_notified_at, visitor_notified_at, visitor_notified_status, status_changed_at, status_changed_by) ON public.appointment_requests TO authenticated;
GRANT UPDATE (proposed_date, proposed_time, reschedule_message) ON public.appointment_requests TO authenticated;
GRANT ALL ON public.appointment_requests TO service_role;
GRANT ALL ON public.pastors TO service_role;

CREATE TABLE IF NOT EXISTS public.appointment_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointment_requests(id) ON DELETE CASCADE,
  recipient_kind text NOT NULL,
  recipient_email text NOT NULL,
  notification_type text NOT NULL,
  status_at_send public.appointment_status,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  triggered_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.appointment_notifications TO authenticated;
GRANT ALL ON public.appointment_notifications TO service_role;
ALTER TABLE public.appointment_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read appointment notifications" ON public.appointment_notifications
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));