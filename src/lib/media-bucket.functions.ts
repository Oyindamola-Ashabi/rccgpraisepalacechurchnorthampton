import { createServerFn } from "@tanstack/react-start";

/**
 * Makes sure the existing public "media" store accepts podcast audio as well as
 * images, and allows files up to 100 MB. It only widens the accepted file types
 * on a store that already exists — nothing is created or deleted.
 */
export const ensureMediaBucketAcceptsAudio = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.storage.updateBucket("media", {
    public: true,
    fileSizeLimit: 104857600,
    allowedMimeTypes: [
      "image/jpeg", "image/png", "image/webp", "image/gif",
      "audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/m4a", "audio/aac", "audio/x-aac",
      "audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave", "audio/ogg", "application/ogg",
      "audio/webm", "audio/flac", "audio/x-flac", "video/mp4", "application/octet-stream",
    ],
  });
  if (error) throw new Error(error.message);
  return { ok: true };
});
