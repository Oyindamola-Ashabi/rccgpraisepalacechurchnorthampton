import { createFileRoute } from "@tanstack/react-router";
import { AdminInbox } from "@/components/admin/inbox";

export const Route = createFileRoute("/admin/visits")({ ssr: false, component: () => (
  <AdminInbox
    config={{
      table: "visit_plans",
      title: "Plan a Visit",
      description: "People planning their first visit to RCCG Praise Palace Northampton.",
      titleField: (r) => r.full_name,
      subtitleField: (r) => `${r.service ?? "Any service"}${r.visit_date ? ` · ${new Date(r.visit_date).toLocaleDateString()}` : ""}`,
      bodyField: "notes",
      statusField: "status",
      statusOptions: ["new", "in_progress", "resolved", "archived"],
      searchFields: ["full_name", "email", "phone", "service", "notes"],
      fields: [
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "service", label: "Service" },
        { key: "visit_date", label: "Visit date", format: (v) => (v ? new Date(v).toLocaleDateString() : "—") },
        { key: "number_of_adults", label: "Adults" },
        { key: "number_of_children", label: "Children" },
        { key: "created_at", label: "Received", format: (v) => new Date(v).toLocaleString() },
      ],
    }}
  />
) });
