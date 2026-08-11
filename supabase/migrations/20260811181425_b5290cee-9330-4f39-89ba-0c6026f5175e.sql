ALTER TABLE public.events ADD COLUMN IF NOT EXISTS badge_label text;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS show_on_homepage boolean NOT NULL DEFAULT false;