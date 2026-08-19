import { createFileRoute, Navigate } from "@tanstack/react-router";

/** The Couples Retreat now lives at /events/couples-retreat — old links keep working. */
export const Route = createFileRoute("/events/couples")({
  head: () => ({
    meta: [
      { title: "Couples Retreat — RCCG Praise Palace Northampton" },
      { name: "description", content: "The Couples Retreat has moved to /events/couples-retreat." },
      { property: "og:title", content: "Couples Retreat — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "The Couples Retreat has moved to /events/couples-retreat." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/events/couples-retreat" }],
  }),
  component: () => <Navigate to="/events/couples-retreat" search={{}} replace />,
});
