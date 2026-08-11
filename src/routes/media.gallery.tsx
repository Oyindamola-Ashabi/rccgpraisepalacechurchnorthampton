import { createFileRoute, redirect } from "@tanstack/react-router";

/** The old gallery address now lives at /events/albums. */
export const Route = createFileRoute("/media/gallery")({
  beforeLoad: () => {
    throw redirect({ to: "/events/albums", replace: true });
  },
});
