import { createFileRoute } from "@tanstack/react-router";
import { AdminInbox } from "@/components/admin/inbox";

export const Route = createFileRoute("/admin/contact")({ ssr: false, component: () => (
  <AdminInbox
    config={{
      table: "contact_messages",
      title: "Contact Messages",
      description: "Messages sent through the website contact form.",
      titleField: (r) => `${r.first_name} ${r.last_name}`,
      subtitleField: (r) => r.subject || r.email,
      bodyField: "message",
      statusField: "status",
      statusOptions: ["new", "in_progress", "resolved", "archived"],
      searchFields: ["first_name", "last_name", "email", "subject", "message"],
      fields: [
        { key: "email", label: "Email" },
        { key: "subject", label: "Subject" },
        { key: "created_at", label: "Received", format: (v) => new Date(v).toLocaleString() },
      ],
    }}
  />
) });
