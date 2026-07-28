-- ============ Homepage editable cards (idempotent) ============
INSERT INTO public.page_sections (page_slug, section_key, headline, subheading, body, cta_label, cta_href, is_visible, sort_order)
VALUES
  ('home','hero_service_1','Worship','Sundays','10:00 AM',NULL,NULL,true,11),
  ('home','hero_service_2','Bible Study','Wednesdays','7:00 PM',NULL,NULL,true,12),
  ('home','hero_service_3','Night Vigil','Last Friday','11:00 PM',NULL,NULL,true,13),
  ('home','program_card_1','Sunday Service','10:00 AM','Worship, word and community for the whole family.',NULL,NULL,true,14),
  ('home','program_card_2','Bible Study','Wed · 7:00 PM','Go deep into the scriptures every Wednesday.',NULL,NULL,true,15),
  ('home','program_card_3','Night Vigil','Last Fri · 11:00 PM','A monthly night of prayer, worship and breakthrough.',NULL,NULL,true,16),
  ('home','program_card_4','Prayer Connect','Last Day · 11:30 PM','Closing every month in agreement and intercession.',NULL,NULL,true,17)
ON CONFLICT (page_slug, section_key) DO UPDATE SET
  headline = EXCLUDED.headline,
  subheading = EXCLUDED.subheading,
  body = EXCLUDED.body,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ============ Sermons ============
CREATE TABLE IF NOT EXISTS public.sermons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  speaker text,
  sermon_date date,
  short_description text,
  full_description text,
  category text,
  youtube_url text,
  youtube_video_id text,
  thumbnail_url text,
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sermons_youtube_required_when_published CHECK (
    is_published = false
    OR (coalesce(youtube_url, '') <> '' AND coalesce(youtube_video_id, '') <> '')
  )
);

REVOKE ALL ON public.sermons FROM anon, authenticated;
GRANT SELECT ON public.sermons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sermons TO authenticated;
GRANT ALL ON public.sermons TO service_role;

ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads published sermons" ON public.sermons;
CREATE POLICY "Public reads published sermons" ON public.sermons
  FOR SELECT TO anon USING (is_published = true);

DROP POLICY IF EXISTS "Staff read sermons" ON public.sermons;
CREATE POLICY "Staff read sermons" ON public.sermons
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()) OR is_published = true);

DROP POLICY IF EXISTS "Staff insert sermons" ON public.sermons;
CREATE POLICY "Staff insert sermons" ON public.sermons
  FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff update sermons" ON public.sermons;
CREATE POLICY "Staff update sermons" ON public.sermons
  FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins delete sermons" ON public.sermons;
CREATE POLICY "Admins delete sermons" ON public.sermons
  FOR DELETE TO authenticated USING (
    private.has_role(auth.uid(), 'super_admin'::app_role) OR private.has_role(auth.uid(), 'admin'::app_role)
  );

DROP TRIGGER IF EXISTS sermons_set_updated_at ON public.sermons;
CREATE TRIGGER sermons_set_updated_at BEFORE UPDATE ON public.sermons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS sermons_published_idx ON public.sermons (is_published, sort_order, sermon_date DESC);

-- ============ Podcasts ============
CREATE TABLE IF NOT EXISTS public.podcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  speaker_or_host text,
  description text,
  publication_date date,
  audio_file_url text,
  external_audio_url text,
  cover_image_url text,
  duration text,
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT podcasts_playback_source_required CHECK (
    is_published = false
    OR coalesce(audio_file_url, '') <> ''
    OR coalesce(external_audio_url, '') <> ''
  )
);

REVOKE ALL ON public.podcasts FROM anon, authenticated;
GRANT SELECT ON public.podcasts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcasts TO authenticated;
GRANT ALL ON public.podcasts TO service_role;

ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads published podcasts" ON public.podcasts;
CREATE POLICY "Public reads published podcasts" ON public.podcasts
  FOR SELECT TO anon USING (is_published = true);

DROP POLICY IF EXISTS "Staff read podcasts" ON public.podcasts;
CREATE POLICY "Staff read podcasts" ON public.podcasts
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()) OR is_published = true);

DROP POLICY IF EXISTS "Staff insert podcasts" ON public.podcasts;
CREATE POLICY "Staff insert podcasts" ON public.podcasts
  FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff update podcasts" ON public.podcasts;
CREATE POLICY "Staff update podcasts" ON public.podcasts
  FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins delete podcasts" ON public.podcasts;
CREATE POLICY "Admins delete podcasts" ON public.podcasts
  FOR DELETE TO authenticated USING (
    private.has_role(auth.uid(), 'super_admin'::app_role) OR private.has_role(auth.uid(), 'admin'::app_role)
  );

DROP TRIGGER IF EXISTS podcasts_set_updated_at ON public.podcasts;
CREATE TRIGGER podcasts_set_updated_at BEFORE UPDATE ON public.podcasts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS podcasts_published_idx ON public.podcasts (is_published, sort_order, publication_date DESC);

-- ============ Podcast audio storage policies ============
DROP POLICY IF EXISTS "Public listens to podcast audio" ON storage.objects;
CREATE POLICY "Public listens to podcast audio" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'podcasts');

DROP POLICY IF EXISTS "Staff upload podcast audio" ON storage.objects;
CREATE POLICY "Staff upload podcast audio" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'podcasts' AND private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff update podcast audio" ON storage.objects;
CREATE POLICY "Staff update podcast audio" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'podcasts' AND private.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'podcasts' AND private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins delete podcast audio" ON storage.objects;
CREATE POLICY "Admins delete podcast audio" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'podcasts' AND (
      private.has_role(auth.uid(), 'super_admin'::app_role) OR private.has_role(auth.uid(), 'admin'::app_role)
    )
  );