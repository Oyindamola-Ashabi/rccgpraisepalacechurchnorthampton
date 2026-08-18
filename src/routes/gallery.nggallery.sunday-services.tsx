import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/** Legacy URL: /gallery/nggallery/sunday-services → /events/albums (permanent). */
export const Route = createFileRoute("/gallery/nggallery/sunday-services")({
  server: {
    handlers: {
      GET: async () =>
        new Response(null, {
          status: 301,
          headers: { location: "https://praisepalace.org.uk/events/albums" },
        }),
    },
  },
});
