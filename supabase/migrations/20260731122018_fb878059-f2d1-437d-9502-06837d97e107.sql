ALTER TABLE public.page_section_items ADD COLUMN IF NOT EXISTS badge_label text;
ALTER TABLE public.gallery_albums ADD COLUMN IF NOT EXISTS badge_label text;
ALTER TABLE public.gallery_albums ADD COLUMN IF NOT EXISTS show_in_main_gallery boolean NOT NULL DEFAULT false;
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;