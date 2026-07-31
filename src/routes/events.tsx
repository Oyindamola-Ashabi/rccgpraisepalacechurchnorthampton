import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout for /events and its sub-pages (e.g. /events/couples-retreat). */
export const Route = createFileRoute("/events")({
  component: () => <Outlet />,
});
