import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * One-off maintenance endpoint that lets the existing public media store accept
 * podcast audio files (up to 100 MB) as well as images.
 */
export const Route = createFileRoute("/api/public/ensure-media-bucket")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
        if (!url || !key) return new Response("missing server configuration", { status: 200 });

        const res = await fetch(`${url}/storage/v1/bucket/media`, {
          method: "PUT",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: "media",
            name: "media",
            public: true,
            file_size_limit: 104857600,
            allowed_mime_types: [
              "image/jpeg", "image/png", "image/webp", "image/gif",
              "audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/m4a", "audio/aac", "audio/x-aac",
              "audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave", "audio/ogg", "application/ogg",
              "audio/webm", "audio/flac", "audio/x-flac", "video/mp4", "application/octet-stream",
            ],
          }),
        });
        return new Response(`${res.status}: ${await res.text()}`, { status: 200 });
      },
    },
  },
});
