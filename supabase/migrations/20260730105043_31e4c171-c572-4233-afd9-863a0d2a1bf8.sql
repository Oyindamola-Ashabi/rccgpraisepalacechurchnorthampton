-- =====================================================================
-- 1. SECTION TEMPLATES ON page_sections
-- =====================================================================
ALTER TABLE public.page_sections
  ADD COLUMN IF NOT EXISTS section_template text NOT NULL DEFAULT 'custom';

CREATE UNIQUE INDEX IF NOT EXISTS page_sections_page_key_uidx
  ON public.page_sections (page_slug, section_key);

-- =====================================================================
-- 2. page_section_items
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.page_section_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.page_sections(id) ON DELETE CASCADE,
  item_key text NOT NULL,
  title text,
  subtitle text,
  body text,
  image_url text,
  icon_key text,
  cta_label text,
  cta_href text,
  link_type text NOT NULL DEFAULT 'internal',
  link_target text NOT NULL DEFAULT 'self',
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT page_section_items_link_type_chk CHECK (link_type IN ('internal','external','none')),
  CONSTRAINT page_section_items_link_target_chk CHECK (link_target IN ('self','blank'))
);

CREATE UNIQUE INDEX IF NOT EXISTS page_section_items_section_key_uidx
  ON public.page_section_items (section_id, item_key);
CREATE INDEX IF NOT EXISTS page_section_items_section_idx
  ON public.page_section_items (section_id, sort_order);

GRANT SELECT ON public.page_section_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_section_items TO authenticated;
GRANT ALL ON public.page_section_items TO service_role;

ALTER TABLE public.page_section_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads visible items" ON public.page_section_items;
CREATE POLICY "Public reads visible items" ON public.page_section_items
  FOR SELECT TO anon USING (is_visible = true);

DROP POLICY IF EXISTS "Staff read items" ON public.page_section_items;
CREATE POLICY "Staff read items" ON public.page_section_items
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()) OR is_visible = true);

DROP POLICY IF EXISTS "Staff insert items" ON public.page_section_items;
CREATE POLICY "Staff insert items" ON public.page_section_items
  FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff update items" ON public.page_section_items;
CREATE POLICY "Staff update items" ON public.page_section_items
  FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins delete items" ON public.page_section_items;
CREATE POLICY "Admins delete items" ON public.page_section_items
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(),'super_admin') OR private.has_role(auth.uid(),'admin'));

DROP TRIGGER IF EXISTS page_section_items_updated_at ON public.page_section_items;
CREATE TRIGGER page_section_items_updated_at BEFORE UPDATE ON public.page_section_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- 3. NAVIGATION
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.nav_items(id) ON DELETE CASCADE,
  label text NOT NULL,
  href text NOT NULL DEFAULT '/',
  link_type text NOT NULL DEFAULT 'internal',
  is_external boolean NOT NULL DEFAULT false,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  location text NOT NULL DEFAULT 'header',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT nav_items_link_type_chk CHECK (link_type IN ('internal','external','none')),
  CONSTRAINT nav_items_location_chk CHECK (location IN ('header','footer')),
  CONSTRAINT nav_items_href_chk CHECK (
    href ~ '^/[A-Za-z0-9/_\-\.\?=&#]*$' OR href ~* '^https?://[^\s<>"'']+$'
  ),
  CONSTRAINT nav_items_not_admin_chk CHECK (href !~* '^/admin')
);

CREATE INDEX IF NOT EXISTS nav_items_location_idx ON public.nav_items (location, sort_order);

-- Genuine idempotency: a menu cannot hold two entries with the same label
-- under the same parent in the same location.
CREATE UNIQUE INDEX IF NOT EXISTS nav_items_root_label_uidx
  ON public.nav_items (location, label) WHERE parent_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS nav_items_child_label_uidx
  ON public.nav_items (parent_id, label) WHERE parent_id IS NOT NULL;

GRANT SELECT ON public.nav_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_items TO authenticated;
GRANT ALL ON public.nav_items TO service_role;

ALTER TABLE public.nav_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads visible nav" ON public.nav_items;
CREATE POLICY "Public reads visible nav" ON public.nav_items
  FOR SELECT TO anon USING (is_visible = true);

DROP POLICY IF EXISTS "Staff read nav" ON public.nav_items;
CREATE POLICY "Staff read nav" ON public.nav_items
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()) OR is_visible = true);

DROP POLICY IF EXISTS "Staff insert nav" ON public.nav_items;
CREATE POLICY "Staff insert nav" ON public.nav_items
  FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff update nav" ON public.nav_items;
CREATE POLICY "Staff update nav" ON public.nav_items
  FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins delete nav" ON public.nav_items;
CREATE POLICY "Admins delete nav" ON public.nav_items
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(),'super_admin') OR private.has_role(auth.uid(),'admin'));

DROP TRIGGER IF EXISTS nav_items_updated_at ON public.nav_items;
CREATE TRIGGER nav_items_updated_at BEFORE UPDATE ON public.nav_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- 4. EVENTS : slug + detail page
-- =====================================================================
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS detail_page text;

UPDATE public.events
SET slug = regexp_replace(lower(trim(title)), '[^a-z0-9]+', '-', 'g')
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS events_slug_uidx ON public.events (slug);

-- =====================================================================
-- 5. EVENT REGISTRATIONS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  event_slug text NOT NULL DEFAULT 'couples-retreat',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  number_of_attendees integer NOT NULL DEFAULT 1,
  message text,
  status public.submission_status NOT NULL DEFAULT 'new',
  is_read boolean NOT NULL DEFAULT false,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT event_registrations_attendees_chk CHECK (number_of_attendees BETWEEN 1 AND 50),
  CONSTRAINT event_registrations_email_chk CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

GRANT INSERT (event_id, event_slug, full_name, email, phone, number_of_attendees, message)
  ON public.event_registrations TO anon, authenticated;
GRANT SELECT, UPDATE (status, is_read, admin_notes) ON public.event_registrations TO authenticated;
GRANT ALL ON public.event_registrations TO service_role;

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone registers" ON public.event_registrations;
CREATE POLICY "Anyone registers" ON public.event_registrations
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND is_read = false AND admin_notes IS NULL);

DROP POLICY IF EXISTS "Staff read registrations" ON public.event_registrations;
CREATE POLICY "Staff read registrations" ON public.event_registrations
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff update registrations" ON public.event_registrations;
CREATE POLICY "Staff update registrations" ON public.event_registrations
  FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins delete registrations" ON public.event_registrations;
CREATE POLICY "Admins delete registrations" ON public.event_registrations
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(),'super_admin') OR private.has_role(auth.uid(),'admin'));

DROP TRIGGER IF EXISTS event_registrations_updated_at ON public.event_registrations;
CREATE TRIGGER event_registrations_updated_at BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- 6. GALLERY ALBUM GROUPING
-- =====================================================================
ALTER TABLE public.gallery_albums ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'gallery';
ALTER TABLE public.gallery_albums ADD COLUMN IF NOT EXISTS event_slug text;
ALTER TABLE public.gallery_albums ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.gallery_albums ADD COLUMN IF NOT EXISTS album_year integer;
ALTER TABLE public.gallery_albums ADD COLUMN IF NOT EXISTS album_date date;

-- =====================================================================
-- 7. PODCASTS : three source types (constraint corrected)
-- =====================================================================
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS playback_type text NOT NULL DEFAULT 'upload';
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS youtube_url text;
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS youtube_video_id text;

ALTER TABLE public.podcasts DROP CONSTRAINT IF EXISTS podcasts_playback_type_chk;
ALTER TABLE public.podcasts
  ADD CONSTRAINT podcasts_playback_type_chk CHECK (playback_type IN ('upload','external','youtube'));

UPDATE public.podcasts SET playback_type = 'external'
WHERE playback_type = 'upload'
  AND coalesce(audio_file_url,'') = ''
  AND coalesce(external_audio_url,'') <> '';

ALTER TABLE public.podcasts
  DROP CONSTRAINT IF EXISTS podcasts_playback_source_required;

ALTER TABLE public.podcasts
  ADD CONSTRAINT podcasts_playback_source_required CHECK (
    is_published = false
    OR (playback_type = 'upload'   AND coalesce(audio_file_url, '') <> '')
    OR (playback_type = 'external' AND coalesce(external_audio_url, '') <> '')
    OR (playback_type = 'youtube'  AND coalesce(youtube_url, '') <> '' AND coalesce(youtube_video_id, '') <> '')
  );

-- =====================================================================
-- 8. STARTER RECORDS (created only when missing)
-- =====================================================================

-- 8a. Editable section records
INSERT INTO public.page_sections (page_slug, section_key, section_template, sort_order)
VALUES
  ('home','hero','hero',0),
  ('home','hero_slide_1','image_grid',1),
  ('home','hero_slide_2','image_grid',2),
  ('home','hero_slide_3','image_grid',3),
  ('home','hero_service_1','card_grid',5),
  ('home','hero_service_2','card_grid',6),
  ('home','hero_service_3','card_grid',7),
  ('home','welcome','image_and_text',8),
  ('home','programs','card_grid',9),
  ('home','ministries','card_grid',14),
  ('home','pastor','image_and_text',15),
  ('home','community','image_and_text',16),
  ('home','events','event_list',17),
  ('home','giving_cta','cta',18),
  ('media','hero','hero',0),
  ('gallery','hero','hero',0),
  ('events','hero','hero',0),
  ('couples-retreat','hero','hero',0),
  ('couples-retreat','intro','rich_text',1),
  ('couples-retreat','details','image_and_text',2),
  ('couples-retreat','register','form_section',3),
  ('couples-retreat','albums','album_list',4),
  ('couples-retreat','contact','cta',5)
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- 8b. Six "Grow. Serve. Belong." cards, each with its original image
INSERT INTO public.page_section_items
  (section_id, item_key, title, body, image_url, icon_key, cta_label, cta_href, link_type, link_target, sort_order)
SELECT s.id, v.item_key, v.title, v.body, v.image_url, v.icon_key, v.cta_label, v.cta_href, v.link_type, v.link_target, v.sort_order
FROM public.page_sections s
JOIN (VALUES
  ('card_1','PraisePalace Radio','Faith-filled broadcasts, worship and word — streaming globally.','/site-images/PIC2.jpg','radio','Visit site','https://praisepalaceradio.com/','external','blank',0),
  ('card_2','Business School','Empowering kingdom entrepreneurs with practical wisdom.','/site-images/BS.png','graduation-cap','Visit site','https://praisepalacebusinessschool.com/','external','blank',1),
  ('card_3','Youth Camp','A powerful gathering for the next generation.','/site-images/YC.jpg','tent','Visit site','https://raisingchampions.org.uk','external','blank',2),
  ('card_4','Men Fellowship','Brothers building one another in faith, character and purpose.','/site-images/MEN.jpg','users','Learn more','/ministries/mens-fellowship','internal','self',3),
  ('card_5','Women Fellowship','A sisterhood of prayer, encouragement and kingdom service.','/site-images/WOMEN.jpg','heart','Learn more','/ministries/womens-fellowship','internal','self',4),
  ('card_6','Couples Retreat','A refreshing retreat for married couples — love, legacy and laughter.','/site-images/PIC1.jpg','sparkles','See the retreat','/events/couples-retreat','internal','self',5)
) AS v(item_key,title,body,image_url,icon_key,cta_label,cta_href,link_type,link_target,sort_order) ON true
WHERE s.page_slug = 'home' AND s.section_key = 'ministries'
ON CONFLICT (section_id, item_key) DO NOTHING;

-- 8c. Couples Retreat event series: unpublished, no invented date or venue
INSERT INTO public.events (title, slug, description, start_at, venue, is_featured, is_published, sort_order, detail_page)
SELECT 'Couples Retreat','couples-retreat',
       'Our Couples Retreat series. Add the confirmed date, time and venue, then publish.',
       now(), NULL, false, false, 0, '/events/couples-retreat'
WHERE NOT EXISTS (SELECT 1 FROM public.events WHERE slug = 'couples-retreat');

-- 8d. Header navigation imported exactly from the live site menu
INSERT INTO public.nav_items (label, href, link_type, is_external, sort_order, location)
SELECT v.label, v.href, 'internal', false, v.sort_order, 'header'
FROM (VALUES
  ('Home','/',0),
  ('About','/about',1),
  ('Ministries','/ministries',2),
  ('Events','/events',3),
  ('Media','/media',4),
  ('Sermons','/sermons',5),
  ('Book Appointment','/book-appointment',6),
  ('Connect','/contact',7),
  ('Give','/give',8)
) AS v(label,href,sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.nav_items n
  WHERE n.location='header' AND n.parent_id IS NULL AND n.label = v.label
);

-- Children of each top-level entry
INSERT INTO public.nav_items (parent_id, label, href, link_type, is_external, sort_order, location)
SELECT p.id, v.label, v.href, v.link_type, v.is_external, v.sort_order, 'header'
FROM public.nav_items p
JOIN (VALUES
  ('Ministries','All Ministries','/ministries','internal',false,0),
  ('Ministries','Men Fellowship','/ministries/mens-fellowship','internal',false,1),
  ('Ministries','Women Fellowship','/ministries/womens-fellowship','internal',false,2),
  ('Ministries','PraisePalace Radio','https://praisepalaceradio.com/','external',true,3),
  ('Ministries','Business School','https://praisepalacebusinessschool.com/','external',true,4),
  ('Ministries','Youth Camp','https://raisingchampions.org.uk','external',true,5),
  ('Ministries','Community','/ministries','none',false,6),
  ('Events','All Events','/events','internal',false,0),
  ('Events','Couples Retreat','/events/couples-retreat','internal',false,1),
  ('Media','All Media','/media','internal',false,0),
  ('Media','Gallery','/media/gallery','internal',false,1),
  ('Media','Podcast','/media/podcast','internal',false,2),
  ('Media','Podcast Episodes','/podcasts','internal',false,3),
  ('Media','Sermons','/sermons','internal',false,4),
  ('Connect','Contact Us','/contact','internal',false,0),
  ('Connect','Plan a Visit','/plan-a-visit','internal',false,1),
  ('Connect','Prayer Request','/prayer-request','internal',false,2),
  ('Connect','Testimonies','/testimonies','internal',false,3),
  ('Connect','Share a Testimony','/share-testimony','internal',false,4)
) AS v(parent_label,label,href,link_type,is_external,sort_order) ON p.label = v.parent_label
WHERE p.location='header' AND p.parent_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.nav_items c WHERE c.parent_id = p.id AND c.label = v.label
  );

-- UK SME Growth Summit nested inside Community
INSERT INTO public.nav_items (parent_id, label, href, link_type, is_external, sort_order, location)
SELECT c.id, 'UK SME Growth Summit', 'https://uksmegrowthsummit.co.uk/', 'external', true, 0, 'header'
FROM public.nav_items c
JOIN public.nav_items p ON p.id = c.parent_id
WHERE c.label = 'Community' AND p.label = 'Ministries' AND p.location = 'header' AND p.parent_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.nav_items g WHERE g.parent_id = c.id AND g.label = 'UK SME Growth Summit'
  );
