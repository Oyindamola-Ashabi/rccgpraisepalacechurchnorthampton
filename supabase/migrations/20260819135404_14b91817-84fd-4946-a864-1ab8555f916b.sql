-- ============ 1. Events: additive fields ============
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'general';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS registration_open boolean NOT NULL DEFAULT false;

-- ============ 2. Album categories ============
CREATE TABLE IF NOT EXISTS public.album_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.album_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_categories TO authenticated;
GRANT ALL ON public.album_categories TO service_role;

ALTER TABLE public.album_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public reads active album categories" ON public.album_categories;
CREATE POLICY "Public reads active album categories" ON public.album_categories
  FOR SELECT TO anon USING (is_active = true);

DROP POLICY IF EXISTS "Signed in reads album categories" ON public.album_categories;
CREATE POLICY "Signed in reads album categories" ON public.album_categories
  FOR SELECT TO authenticated USING (is_active = true OR private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff insert album categories" ON public.album_categories;
CREATE POLICY "Staff insert album categories" ON public.album_categories
  FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff update album categories" ON public.album_categories;
CREATE POLICY "Staff update album categories" ON public.album_categories
  FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins delete album categories" ON public.album_categories;
CREATE POLICY "Admins delete album categories" ON public.album_categories
  FOR DELETE TO authenticated USING (
    private.has_role(auth.uid(), 'super_admin'::app_role) OR private.has_role(auth.uid(), 'admin'::app_role)
  );

DROP TRIGGER IF EXISTS album_categories_updated_at ON public.album_categories;
CREATE TRIGGER album_categories_updated_at BEFORE UPDATE ON public.album_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed categories from the wording already used by existing albums.
-- NOTE: gallery_albums.category values are NOT modified; the website matches
-- albums to categories by comparing simplified (slug) forms of the wording.
INSERT INTO public.album_categories (name, slug, sort_order)
SELECT initcap(trim(category)),
       regexp_replace(regexp_replace(lower(trim(category)), '[^a-z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'),
       0
FROM (
  SELECT DISTINCT ON (regexp_replace(regexp_replace(lower(trim(category)), '[^a-z0-9]+', '-', 'g'), '^-+|-+$', '', 'g'))
         category
    FROM public.gallery_albums
   WHERE category IS NOT NULL AND trim(category) <> ''
) s
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.album_categories (name, slug, sort_order) VALUES ('Couples Retreat', 'couples-retreat', 0)
ON CONFLICT (slug) DO NOTHING;

-- ============ 3. Couples Retreat page content (creates missing blocks only) ============
INSERT INTO public.page_sections (page_slug, section_key, headline, subheading, body, sort_order, is_visible, section_template)
VALUES
 ('couples-retreat','intro','Every marriage needs intentional investment.',NULL,'Our retreat provides a relaxed, welcoming and Christ-centred environment where couples can spend quality time together while receiving practical and biblical guidance for building a healthy and lasting marriage.',1,true,'image_and_text'),
 ('couples-retreat','expect','What to Expect',NULL,'The Couples Retreat combines biblical teaching, practical relationship sessions, prayer, meaningful conversations, fellowship and quality time together. Throughout the retreat, we explore important areas of married life, including:',2,true,'card_grid'),
 ('couples-retreat','time_away','Time Away for the Two of You',NULL,'Life can become extremely busy. Between work, children, ministry, business and other responsibilities, couples can sometimes spend more time managing life together than intentionally enjoying their marriage.

The retreat gives you permission to slow down. It is an opportunity to talk without rushing, laugh together, enjoy each other''s company, reflect on your journey and remember why you chose one another.',3,true,'image_and_text'),
 ('couples-retreat','christ_centred','A Christ-Centred Experience','“Though one may be overpowered, two can defend themselves. A cord of three strands is not quickly broken.” | Ecclesiastes 4:12','We believe strong marriages are built intentionally and that God should remain at the centre of the marriage relationship.

Our sessions therefore combine biblical principles with practical conversations that couples can apply to everyday married life.',4,true,'rich_text'),
 ('couples-retreat','who','Who Should Attend?',NULL,'The retreat is designed for married couples at every stage of marriage.

You don''t need to be experiencing difficulties before attending a marriage retreat. Healthy marriages also need investment, encouragement and renewal.

Whether you want to strengthen an already healthy marriage, reconnect after a busy season, improve communication or simply enjoy intentional time together, you are welcome.',5,true,'rich_text'),
 ('couples-retreat','why','Why Attend?',NULL,'Because great marriages don''t happen by accident.

They are built through intentional love, communication, forgiveness, friendship, commitment, prayer and continuous investment in one another.

Sometimes one weekend of intentional conversation can begin changes that positively influence many years of marriage.',7,true,'rich_text'),
 ('couples-retreat','annual','Our Annual Retreats',NULL,'Both retreats provide fresh themes and conversations, so couples are encouraged to attend regularly rather than viewing the retreat as a one-time experience.',8,true,'card_grid'),
 ('couples-retreat','closing','Come and Grow Together','Stronger Together. Better Together. Growing Together.','Your marriage deserves time. Your relationship deserves investment. And your journey together is worth celebrating.

Join other couples in a warm and encouraging environment as we learn, laugh, worship, pray and grow together.

We look forward to welcoming you to our next Couples Retreat.',9,true,'cta')
ON CONFLICT (page_slug, section_key) DO NOTHING;

-- Fill only fields that are still empty, so Admin edits are never overwritten.
UPDATE public.page_sections SET
  subheading = COALESCE(NULLIF(trim(subheading),''), 'Couples Retreat'),
  headline   = COALESCE(NULLIF(trim(headline),''), 'Stronger Together. Growing in Love, Faith & Partnership.'),
  body       = COALESCE(NULLIF(trim(body),''), 'Our Couples Retreat is a special time created for married couples to step away from the demands and distractions of everyday life and intentionally invest in their marriage.

Held twice every year, in May and October, the retreat provides an opportunity for couples to reconnect, strengthen their relationship, deepen their understanding of one another and grow together spiritually.

Whether you have been married for a few months or many years, every marriage needs intentional investment.')
WHERE page_slug='couples-retreat' AND section_key='hero';

UPDATE public.page_sections SET
  headline = COALESCE(NULLIF(trim(headline),''), 'Your Marriage Is Worth Investing In'),
  body     = CASE WHEN COALESCE(trim(body),'') IN ('','Details of the next Couples Retreat will be announced soon.')
                  THEN 'This will be another opportunity for couples to step away from their normal routines and enjoy a refreshing time of connection, learning, fellowship, prayer and relaxation.

Come prepared to invest in each other, create new memories and discover practical ways to make your marriage even stronger. Spaces may be limited, so couples are encouraged to register early.'
                  ELSE body END,
  sort_order = 6
WHERE page_slug='couples-retreat' AND section_key='upcoming';

UPDATE public.page_sections SET
  headline = COALESCE(NULLIF(trim(headline),''), 'Register Your Interest'),
  subheading = COALESCE(NULLIF(trim(subheading),''), 'Registration'),
  body = COALESCE(NULLIF(trim(body),''), 'Tell us who is coming and we will be in touch with the full retreat details.')
WHERE page_slug='couples-retreat' AND section_key='register';

UPDATE public.page_sections SET
  headline = COALESCE(NULLIF(trim(headline),''), 'Questions about the retreat?'),
  body = COALESCE(NULLIF(trim(body),''), 'Our team is glad to help you plan your time away.')
WHERE page_slug='couples-retreat' AND section_key='contact';

-- Repeatable items: only when the section has none yet.
INSERT INTO public.page_section_items (section_id, item_key, title, sort_order, is_visible)
SELECT s.id, 'expect-' || v.ord, v.title, v.ord, true
FROM public.page_sections s
CROSS JOIN (VALUES
  (0,'Communication and understanding'),(1,'Building and maintaining trust'),
  (2,'Managing differences and resolving conflict'),(3,'Love, intimacy and emotional connection'),
  (4,'Financial partnership'),(5,'Parenting and family life'),
  (6,'Forgiveness and healing'),(7,'Understanding your spouse'),
  (8,'Keeping friendship and romance alive'),(9,'Growing together spiritually'),
  (10,'Building a Christ-centred home'),(11,'Developing a shared vision for your marriage')
) AS v(ord, title)
WHERE s.page_slug='couples-retreat' AND s.section_key='expect'
  AND NOT EXISTS (SELECT 1 FROM public.page_section_items i WHERE i.section_id = s.id);

INSERT INTO public.page_section_items (section_id, item_key, title, body, sort_order, is_visible)
SELECT s.id, 'retreat-' || v.ord, v.title, v.body, v.ord, true
FROM public.page_sections s
CROSS JOIN (VALUES
  (0,'May Couples Retreat','A refreshing opportunity to reconnect and strengthen your marriage during the first half of the year.'),
  (1,'October Couples Retreat','A time to reflect, reconnect and intentionally invest in your relationship as the year draws towards its close.')
) AS v(ord, title, body)
WHERE s.page_slug='couples-retreat' AND s.section_key='annual'
  AND NOT EXISTS (SELECT 1 FROM public.page_section_items i WHERE i.section_id = s.id);