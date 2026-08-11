ALTER TABLE public.gallery_images
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_thumbnail_url text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'gallery_images_media_type_check'
  ) THEN
    ALTER TABLE public.gallery_images
      ADD CONSTRAINT gallery_images_media_type_check CHECK (media_type IN ('image','video'));
  END IF;
END $$;

UPDATE public.gallery_images SET media_type = 'image' WHERE media_type IS NULL OR media_type NOT IN ('image','video');

ALTER TABLE public.gallery_images ALTER COLUMN image_url DROP NOT NULL;