-- =====================================================================
-- 1. Couples Retreat registration fields, grants and consent rule
-- =====================================================================
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS spouse_name text,
  ADD COLUMN IF NOT EXISTS accommodation_preference text,
  ADD COLUMN IF NOT EXISTS dietary_requirements text,
  ADD COLUMN IF NOT EXISTS accessibility_requirements text,
  ADD COLUMN IF NOT EXISTS consent_given boolean NOT NULL DEFAULT false;

REVOKE INSERT ON public.event_registrations FROM anon, authenticated;
GRANT INSERT (
  event_id,
  event_slug,
  full_name,
  email,
  phone,
  spouse_name,
  number_of_attendees,
  accommodation_preference,
  dietary_requirements,
  accessibility_requirements,
  message,
  consent_given
) ON public.event_registrations TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone registers" ON public.event_registrations;
CREATE POLICY "Anyone registers" ON public.event_registrations
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'new'::submission_status
    AND is_read = false
    AND admin_notes IS NULL
    AND consent_given = true
  );

-- =====================================================================
-- 2. Event videos (separate from Sermons and Watch Live)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.event_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  event_slug text,
  title text NOT NULL,
  description text,
  youtube_url text,
  youtube_video_id text,
  thumbnail_url text,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.event_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_videos TO authenticated;
GRANT ALL ON public.event_videos TO service_role;

ALTER TABLE public.event_videos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='event_videos' AND policyname='Public reads visible event videos') THEN
    CREATE POLICY "Public reads visible event videos" ON public.event_videos
      FOR SELECT TO anon USING (is_visible = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='event_videos' AND policyname='Staff read event videos') THEN
    CREATE POLICY "Staff read event videos" ON public.event_videos
      FOR SELECT TO authenticated USING (private.is_staff(auth.uid()) OR is_visible = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='event_videos' AND policyname='Staff insert event videos') THEN
    CREATE POLICY "Staff insert event videos" ON public.event_videos
      FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='event_videos' AND policyname='Staff update event videos') THEN
    CREATE POLICY "Staff update event videos" ON public.event_videos
      FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='event_videos' AND policyname='Admins delete event videos') THEN
    CREATE POLICY "Admins delete event videos" ON public.event_videos
      FOR DELETE TO authenticated
      USING (private.has_role(auth.uid(),'super_admin'::app_role) OR private.has_role(auth.uid(),'admin'::app_role));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='event_videos_set_updated_at') THEN
    CREATE TRIGGER event_videos_set_updated_at BEFORE UPDATE ON public.event_videos
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- =====================================================================
-- 3. Parent sections — created only when genuinely missing
-- =====================================================================
CREATE UNIQUE INDEX IF NOT EXISTS page_sections_page_key_uidx
  ON public.page_sections (page_slug, section_key);

INSERT INTO public.page_sections (page_slug, section_key, section_template, headline, subheading, body, sort_order, is_visible)
VALUES
  ('home','hero_slides','image_grid','Hero Background Slides',NULL,NULL,1,true),
  ('home','hero_services','card_grid','Hero Service Times',NULL,NULL,2,true),
  ('home','programs','card_grid','Weekly Rhythms of Grace','Our Programs','A steady heartbeat of prayer, worship and word — come as you are.',3,true),
  ('home','community','image_and_text','Community','In the Community','Reaching beyond our walls into the wider community.',7,true),
  ('about','life_gallery','image_grid','Life at Praise Palace','Our Family','Moments of fellowship, worship and joy across our community.',8,true),
  ('media','live_video','video','Watch Live','Live & On Demand','Join our live broadcast or catch up on the latest service.',5,true),
  ('couples-retreat','upcoming','custom','Upcoming Retreat',NULL,'Details of the next Couples Retreat will be announced soon.',3,true)
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- =====================================================================
-- 4. Move existing wording and pictures into the new grouped cards.
--    Only runs for a section that currently has no cards at all.
-- =====================================================================
WITH parents AS (
  SELECT id, page_slug, section_key FROM public.page_sections
  WHERE (page_slug, section_key) IN (
    ('home','hero_slides'),('home','hero_services'),('home','programs'),
    ('home','community'),('about','life_gallery')
  )
),
empty_parents AS (
  SELECT p.* FROM parents p
  WHERE NOT EXISTS (SELECT 1 FROM public.page_section_items i WHERE i.section_id = p.id)
),
old AS (
  SELECT section_key, headline, subheading, body, image_url, cta_label, cta_href
  FROM public.page_sections WHERE page_slug = 'home'
),
seed(page_slug, section_key, item_key, source_key, title, subtitle, body, icon_key, cta_href, link_type, link_target, sort_order) AS (
  VALUES
    ('home','hero_slides','slide_1','hero_slide_1','Hero slide 1',NULL,NULL,NULL,NULL,'none','self',0),
    ('home','hero_slides','slide_2','hero_slide_2','Hero slide 2',NULL,NULL,NULL,NULL,'none','self',1),
    ('home','hero_slides','slide_3','hero_slide_3','Hero slide 3',NULL,NULL,NULL,NULL,'none','self',2),
    ('home','hero_services','service_1','hero_service_1','Worship','Sundays','10:00 AM','heart',NULL,'none','self',0),
    ('home','hero_services','service_2','hero_service_2','Bible Study','Wednesdays','7:00 PM','book-open',NULL,'none','self',1),
    ('home','hero_services','service_3','hero_service_3','Night Vigil','Last Friday','11:00 PM','sparkles',NULL,'none','self',2),
    ('home','programs','program_1','program_card_1','Sunday Service','10:00 AM','Worship, word and community for the whole family.','heart',NULL,'none','self',0),
    ('home','programs','program_2','program_card_2','Bible Study','Wed · 7:00 PM','Go deep into the scriptures every Wednesday.','book-open',NULL,'none','self',1),
    ('home','programs','program_3','program_card_3','Night Vigil','Last Fri · 11:00 PM','A monthly night of prayer, worship and breakthrough.','music',NULL,'none','self',2),
    ('home','programs','program_4','program_card_4','Prayer Connect','Last Day · 11:30 PM','Closing every month in agreement and intercession.','users',NULL,'none','self',3),
    ('home','community','uk_sme_growth_summit',NULL,'UK SME Growth Summit',NULL,'Equipping small and medium businesses across the UK to grow with purpose.','graduation-cap','https://uksmegrowthsummit.co.uk/','external','blank',0),
    ('about','life_gallery','life_1',NULL,'Family fellowship',NULL,NULL,NULL,NULL,'none','self',0),
    ('about','life_gallery','life_2',NULL,'Fathers'' honour',NULL,NULL,NULL,NULL,'none','self',1),
    ('about','life_gallery','life_3',NULL,'Welcoming our guests',NULL,NULL,NULL,NULL,'none','self',2),
    ('about','life_gallery','life_4',NULL,'Shared meals',NULL,NULL,NULL,NULL,'none','self',3),
    ('about','life_gallery','life_5',NULL,'Family life',NULL,NULL,NULL,NULL,'none','self',4),
    ('about','life_gallery','life_6',NULL,'Table fellowship',NULL,NULL,NULL,NULL,'none','self',5)
)
INSERT INTO public.page_section_items
  (section_id, item_key, title, subtitle, body, image_url, icon_key, cta_label, cta_href, link_type, link_target, sort_order, is_visible)
SELECT
  p.id,
  s.item_key,
  COALESCE(NULLIF(o.headline,''), s.title),
  COALESCE(NULLIF(o.subheading,''), s.subtitle),
  COALESCE(NULLIF(o.body,''), s.body),
  NULLIF(o.image_url,''),
  s.icon_key,
  NULLIF(o.cta_label,''),
  COALESCE(NULLIF(o.cta_href,''), s.cta_href),
  s.link_type,
  s.link_target,
  s.sort_order,
  true
FROM seed s
JOIN empty_parents p ON p.page_slug = s.page_slug AND p.section_key = s.section_key
LEFT JOIN old o ON o.section_key = s.source_key;

-- =====================================================================
-- 5. Retire the older duplicate records (kept, never deleted)
-- =====================================================================
UPDATE public.page_sections
SET section_template = 'retired'
WHERE page_slug = 'home'
  AND section_key IN (
    'hero_slide_1','hero_slide_2','hero_slide_3',
    'hero_service_1','hero_service_2','hero_service_3',
    'program_card_1','program_card_2','program_card_3','program_card_4',
    'ministry_card_1','ministry_card_2','ministry_card_3'
  )
  AND section_template <> 'retired';

-- =====================================================================
-- 6. Keep the internal layout value correct automatically
-- =====================================================================
UPDATE public.page_sections SET section_template='image_grid'
  WHERE (page_slug,section_key) IN (('home','hero_slides'),('about','life_gallery')) AND section_template<>'image_grid';
UPDATE public.page_sections SET section_template='card_grid'
  WHERE page_slug='home' AND section_key IN ('hero_services','programs','ministries') AND section_template<>'card_grid';
UPDATE public.page_sections SET section_template='video'
  WHERE page_slug='media' AND section_key='live_video' AND section_template<>'video';
