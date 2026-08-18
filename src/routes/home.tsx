import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/** Legacy URL from the former Praise Palace site: /home/ → / (permanent). */
export const Route = createFileRoute("/home")({
  server: {
    handlers: {
      GET: async () =>
        new Response(null, {
          status: 301,
          headers: { location: "https://praisepalace.org.uk/" },
        }),
    },
  },
});
