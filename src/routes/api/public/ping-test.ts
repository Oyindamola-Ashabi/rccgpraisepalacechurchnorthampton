import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/ping-test")({
  server: { handlers: { POST: async () => new Response("pong") } },
});
