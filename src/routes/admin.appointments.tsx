import { createFileRoute } from "@tanstack/react-router";
import { AdminInbox } from "@/components/admin/inbox";
import { AppointmentWorkflow } from "@/components/admin/appointment-workflow";

export const Route = createFileRoute("/admin/appointments")({ ssr: false, component: () => (
  <AdminInbox
    config={{
      table: "appointment_requests",
      title: "Appointment Requests",
      description: "Pastoral appointment bookings made on the website. Changing the decision below emails the visitor automatically.",
      titleField: (r) => `${r.name} → ${r.pastor_name ?? "Pastor"}`,
      subtitleField: (r) => `${new Date(r.appointment_date).toLocaleDateString()} at ${String(r.appointment_time).slice(0, 5)}`,
      bodyField: "notes",
      statusField: "status",
      statusOptions: ["pending", "approved", "reschedule_requested", "confirmed", "declined", "completed", "cancelled", "archived"],
      hideStatusSelect: true,
      panel: (row, refresh) => <AppointmentWorkflow row={row} refresh={refresh} />,
      searchFields: ["name", "email", "phone", "pastor_name", "reason", "notes"],
      fields: [
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "pastor_name", label: "Pastor" },
        { key: "reason", label: "Reason" },
        { key: "appointment_date", label: "Date", format: (v) => new Date(v).toLocaleDateString() },
        { key: "appointment_time", label: "Time", format: (v) => String(v).slice(0, 5) },
        { key: "proposed_date", label: "Proposed date", format: (v) => (v ? new Date(v).toLocaleDateString() : "—") },
        { key: "proposed_time", label: "Proposed time", format: (v) => (v ? String(v).slice(0, 5) : "—") },
        { key: "created_at", label: "Requested", format: (v) => new Date(v).toLocaleString() },
      ],
    }}
  />
) });
