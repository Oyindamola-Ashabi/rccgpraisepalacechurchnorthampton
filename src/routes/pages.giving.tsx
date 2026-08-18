import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/** Legacy URL: /pages/giving/ → /give (permanent). */
export const Route = createFileRoute("/pages/giving")({
  server: {
    handlers: {
      GET: async () =>
        new Response(null, {
          status: 301,
          headers: { location: "https://praisepalace.org.uk/give" },
        }),
    },
  },
});
