ALTER TABLE public.gallery_albums
  ADD COLUMN IF NOT EXISTS album_source text NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS fliphtml5_url text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_albums_album_source_check') THEN
    ALTER TABLE public.gallery_albums
      ADD CONSTRAINT gallery_albums_album_source_check
      CHECK (album_source IN ('website','fliphtml5'));
  END IF;
END $$;