ALTER TABLE public.ministries ADD COLUMN IF NOT EXISTS group_key text NOT NULL DEFAULT 'church';
ALTER TABLE public.ministries DROP CONSTRAINT IF EXISTS ministries_group_key_check;
ALTER TABLE public.ministries ADD CONSTRAINT ministries_group_key_check CHECK (group_key IN ('church','outreach'));
UPDATE public.ministries SET group_key='outreach' WHERE slug IN ('praisepalace-radio','praise-palace-business-school','raising-champions-youth-camp');
GRANT SELECT (group_key) ON public.ministries TO anon, authenticated;
GRANT UPDATE (group_key), INSERT (group_key) ON public.ministries TO authenticated;
UPDATE public.nav_items SET href='/ministries/outreach' WHERE id='42b4e030-2669-4065-b371-b79f232656e8';
UPDATE public.nav_items SET href='/ministries/community-outreach' WHERE id='f8bc1297-5d78-4c69-8719-a943c65f4a8e';