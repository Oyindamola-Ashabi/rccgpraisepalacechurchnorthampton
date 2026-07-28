-- ============ PHASE 2 CMS (incremental, corrected) ============

-- 1. SITE SETTINGS
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key boolean NOT NULL DEFAULT true UNIQUE CHECK (singleton_key = true),
  church_name text NOT NULL DEFAULT 'RCCG Praise Palace Northampton',
  short_description text,
  phone text,
  email text,
  address text,
  service_times text,
  map_url text,
  footer_text text,
  copyright_text text,
  instagram_url text,
  youtube_url text,
  facebook_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.site_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads site settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert site settings" ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update site settings" ON public.site_settings FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (church_name, short_description, phone, email, address, service_times, map_url, footer_text, copyright_text, instagram_url, youtube_url, facebook_url)
VALUES (
  'RCCG Praise Palace Northampton',
  'A vibrant Redeemed Christian Church of God parish in Northampton, UK. Come as you are — it shall end in praise.',
  '+44 7000 000 000',
  'rccgpraisepalace01@gmail.com',
  'Briar Hill Community Centre NN4 8SX',
  'Sunday Worship 10:00 AM · Wednesday Bible Study 7:00 PM',
  'https://www.google.com/maps/search/?api=1&query=Briar+Hill+Community+Centre+NN4+8SX',
  'A vibrant Redeemed Christian Church of God parish in Northampton, UK. Come as you are — it shall end in praise.',
  '© {year} RCCG Praise Palace Northampton. All rights reserved.',
  'https://www.instagram.com/rccg_praisepalace_northampton/',
  'https://www.youtube.com/@rccg_praisepalace_northampton',
  'https://www.facebook.com/profile.php?id=100069680592786'
);

-- 2. PAGE SECTIONS
CREATE TABLE public.page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL,
  section_key text NOT NULL,
  page_title text,
  headline text,
  subheading text,
  body text,
  cta_label text,
  cta_href text,
  image_url text,
  is_visible boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_slug, section_key)
);
REVOKE ALL ON public.page_sections FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.page_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_sections TO authenticated;
GRANT ALL ON public.page_sections TO service_role;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads visible sections" ON public.page_sections FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "Staff read sections" ON public.page_sections FOR SELECT TO authenticated USING (private.is_staff(auth.uid()) OR is_visible = true);
CREATE POLICY "Staff insert sections" ON public.page_sections FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Staff update sections" ON public.page_sections FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Admins delete sections" ON public.page_sections FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER page_sections_updated_at BEFORE UPDATE ON public.page_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. MEDIA LIBRARY
CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path text NOT NULL UNIQUE,
  public_url text NOT NULL,
  title text,
  alt_text text,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.media_assets FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read media" ON public.media_assets FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
CREATE POLICY "Staff insert media" ON public.media_assets FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Staff update media" ON public.media_assets FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Admins delete media" ON public.media_assets FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER media_assets_updated_at BEFORE UPDATE ON public.media_assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. GALLERY
CREATE TABLE public.gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  cover_image_url text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.gallery_albums FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.gallery_albums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_albums TO authenticated;
GRANT ALL ON public.gallery_albums TO service_role;
ALTER TABLE public.gallery_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published albums" ON public.gallery_albums FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "Staff read albums" ON public.gallery_albums FOR SELECT TO authenticated USING (private.is_staff(auth.uid()) OR is_published = true);
CREATE POLICY "Staff insert albums" ON public.gallery_albums FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Staff update albums" ON public.gallery_albums FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Admins delete albums" ON public.gallery_albums FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER gallery_albums_updated_at BEFORE UPDATE ON public.gallery_albums FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.gallery_albums(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX gallery_images_album_idx ON public.gallery_images (album_id, sort_order);
REVOKE ALL ON public.gallery_images FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published album images" ON public.gallery_images FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.gallery_albums a WHERE a.id = album_id AND a.is_published = true));
CREATE POLICY "Staff read album images" ON public.gallery_images FOR SELECT TO authenticated
  USING (private.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.gallery_albums a WHERE a.id = album_id AND a.is_published = true));
CREATE POLICY "Staff insert album images" ON public.gallery_images FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Staff update album images" ON public.gallery_images FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Admins delete album images" ON public.gallery_images FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER gallery_images_updated_at BEFORE UPDATE ON public.gallery_images FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. MINISTRIES
CREATE TABLE public.ministries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text,
  full_description text,
  image_url text,
  leader text,
  meeting_info text,
  link_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.ministries FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.ministries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ministries TO authenticated;
GRANT ALL ON public.ministries TO service_role;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads active ministries" ON public.ministries FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Staff read ministries" ON public.ministries FOR SELECT TO authenticated USING (private.is_staff(auth.uid()) OR is_active = true);
CREATE POLICY "Staff insert ministries" ON public.ministries FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Staff update ministries" ON public.ministries FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Admins delete ministries" ON public.ministries FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER ministries_updated_at BEFORE UPDATE ON public.ministries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. EVENTS
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  venue text,
  image_url text,
  registration_url text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_at IS NULL OR end_at >= start_at)
);
CREATE INDEX events_start_idx ON public.events (start_at);
REVOKE ALL ON public.events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published events" ON public.events FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "Staff read events" ON public.events FOR SELECT TO authenticated USING (private.is_staff(auth.uid()) OR is_published = true);
CREATE POLICY "Staff insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Staff update events" ON public.events FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
CREATE POLICY "Admins delete events" ON public.events FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. GIVING CONTENT
CREATE TABLE public.giving_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton_key boolean NOT NULL DEFAULT true UNIQUE CHECK (singleton_key = true),
  intro_text text,
  instructions text,
  payment_details text,
  external_link text,
  cta_label text,
  cta_href text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.giving_content FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.giving_content TO anon;
GRANT SELECT, INSERT, UPDATE ON public.giving_content TO authenticated;
GRANT ALL ON public.giving_content TO service_role;
ALTER TABLE public.giving_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads giving content" ON public.giving_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert giving content" ON public.giving_content FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update giving content" ON public.giving_content FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
CREATE TRIGGER giving_content_updated_at BEFORE UPDATE ON public.giving_content FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.giving_content (intro_text, instructions, payment_details, external_link, cta_label, cta_href)
VALUES (NULL, NULL, NULL, NULL, NULL, NULL);

-- 8. STORAGE POLICIES FOR THE "media" BUCKET (bucket itself is created via the Storage API)
CREATE POLICY "Public reads media bucket" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
CREATE POLICY "Staff upload media bucket" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND private.is_staff(auth.uid()));
CREATE POLICY "Staff update media bucket" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND private.is_staff(auth.uid())) WITH CHECK (bucket_id = 'media' AND private.is_staff(auth.uid()));
CREATE POLICY "Admins delete media bucket" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin')));