import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

export const Route = createFileRoute("/api/public/ping-test")({
  server: { handlers: { GET: async () => new Response("pong") } },
});
