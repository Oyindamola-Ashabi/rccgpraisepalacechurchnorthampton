import { createFileRoute } from "@tanstack/react-router";
import { AdminInbox } from "@/components/admin/inbox";

export const Route = createFileRoute("/admin/registrations")({ ssr: false, component: () => (
  <AdminInbox
    config={{
      table: "event_registrations",
      title: "Event Registrations",
      description: "People who have registered for church events, including the Couples Retreat.",
      titleField: (r) => `${r.full_name}${r.spouse_name ? ` & ${r.spouse_name}` : ""}`,
      subtitleField: (r) => `${r.event_slug ?? "Event"} · ${r.number_of_attendees ?? 1} attending`,
      bodyField: "message",
      statusField: "status",
      statusOptions: ["new", "in_progress", "resolved", "archived"],
      searchFields: ["full_name", "spouse_name", "email", "phone", "event_slug", "message", "accommodation_preference"],
      fields: [
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "spouse_name", label: "Spouse's name" },
        { key: "number_of_attendees", label: "Attendees" },
        { key: "accommodation_preference", label: "Accommodation" },
        { key: "dietary_requirements", label: "Dietary" },
        { key: "accessibility_requirements", label: "Accessibility" },
        { key: "created_at", label: "Received", format: (v) => new Date(v).toLocaleString() },
      ],
    }}
  />
) });
