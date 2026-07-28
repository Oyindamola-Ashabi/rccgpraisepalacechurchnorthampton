import { createFileRoute } from "@tanstack/react-router";
import { AdminInbox } from "@/components/admin/inbox";

export const Route = createFileRoute("/admin/prayer")({ ssr: false, component: () => (
  <AdminInbox
    config={{
      table: "prayer_requests",
      title: "Prayer Requests",
      description: "Prayer requests submitted by visitors and members.",
      titleField: (r) => (r.is_anonymous ? "Anonymous request" : r.full_name || "Unnamed"),
      subtitleField: (r) => (r.is_anonymous ? "Identity withheld" : r.email || r.phone || ""),
      bodyField: "request",
      statusField: "status",
      statusOptions: ["new", "in_progress", "resolved", "archived"],
      searchFields: ["full_name", "email", "phone", "request"],
      fields: [
        { key: "full_name", label: "Name", format: (v, r) => (r.is_anonymous ? "Anonymous" : v ?? "—") },
        { key: "email", label: "Email", format: (v, r) => (r.is_anonymous ? "Hidden" : v ?? "—") },
        { key: "phone", label: "Phone", format: (v, r) => (r.is_anonymous ? "Hidden" : v ?? "—") },
        { key: "is_urgent", label: "Urgent", format: (v) => (v ? "Yes" : "No") },
        { key: "created_at", label: "Received", format: (v) => new Date(v).toLocaleString() },
      ],
    }}
  />
) });
