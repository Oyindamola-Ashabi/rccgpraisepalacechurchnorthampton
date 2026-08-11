import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/** One-off maintenance endpoint used to widen the media store's accepted file types. */
export const Route = createFileRoute("/api/public/ensure-media-bucket")({
  server: {
    handlers: {
      GET: async () => {
        try {
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
        return new Response(error ? `error: ${error.message}` : "ok", { status: 200 });
        } catch (e) {
          return new Response(`threw: ${(e as Error).message}`, { status: 200 });
        }
      },
    },
  },
});
