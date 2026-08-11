import { createFileRoute } from "@tanstack/react-router";
import { ensureMediaBucketAcceptsAudio } from "@/lib/media-bucket.functions";

/** One-off maintenance endpoint used to widen the media store's accepted file types. */
export const Route = createFileRoute("/api/public/ensure-media-bucket")({
  server: {
    handlers: {
      POST: async () => {
        await ensureMediaBucketAcceptsAudio();
        return new Response("ok");
      },
    },
  },
});
