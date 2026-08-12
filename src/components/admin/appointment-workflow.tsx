import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { updateAppointmentStatus } from "@/lib/appointments.functions";
import { labelize } from "@/components/admin/inbox";

const STATUSES = [
  "pending",
  "approved",
  "reschedule_requested",
  "declined",
  "completed",
  "cancelled",
  "archived",
];

const EMAILS_VISITOR = new Set(["approved", "reschedule_requested", "declined", "completed", "cancelled"]);

export function AppointmentWorkflow({ row, refresh }: { row: any; refresh: () => void }) {
  const update = useServerFn(updateAppointmentStatus);
  const [status, setStatus] = useState<string>(row.status ?? "pending");
  const [proposedDate, setProposedDate] = useState<string>(row.proposed_date ?? "");
  const [proposedTime, setProposedTime] = useState<string>(String(row.proposed_time ?? "").slice(0, 5));
  const [message, setMessage] = useState<string>(row.reschedule_message ?? "");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const willEmail = notify && EMAILS_VISITOR.has(status);

  async function save() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await update({
        data: {
          appointmentId: row.id,
          status,
          proposedDate: proposedDate || null,
          proposedTime: proposedTime || null,
          messageToVisitor: message.trim() || null,
          notifyVisitor: notify,
        },
      });
      if (res.emailed) setResult(`Status saved and an email was sent to ${row.email}.`);
      else if (res.emailError) setError(`Status saved, but the email failed: ${res.emailError}`);
      else setResult("Status saved. No visitor email was sent.");
      refresh();
    } catch (e: any) {
      setError(e?.message ?? "Could not update this appointment.");
    }
    setBusy(false);
  }

  return (
    <div className="rounded-2xl bg-secondary/40 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Appointment decision</h3>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border bg-background px-3 py-1.5 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{labelize(s)}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs font-medium">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
          Email the visitor ({row.email})
        </label>
      </div>

      {status === "reschedule_requested" && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Proposed new date *</span>
            <input type="date" value={proposedDate} onChange={(e) => setProposedDate(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Proposed new time *</span>
            <input type="time" value={proposedTime} onChange={(e) => setProposedTime(e.target.value)}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm" />
          </label>
        </div>
      )}

      <label className="mt-3 block">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Message to the visitor (optional)</span>
        <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="This text is included in the email sent to the visitor."
          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]" />
      </label>

      <button onClick={save} disabled={busy}
        className="mt-3 inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2 text-xs font-semibold text-white shadow-elegant hover:opacity-95 disabled:opacity-60">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        {willEmail ? "Save & email visitor" : "Save status"}
      </button>

      {result && <p className="mt-3 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-700">{result}</p>}
      {error && <p className="mt-3 rounded-xl bg-destructive/10 p-3 text-xs text-destructive">{error}</p>}

      <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
        <p>Pastor notified: {row.pastor_notified_at ? new Date(row.pastor_notified_at).toLocaleString() : "not yet"}</p>
        <p>
          Visitor last emailed:{" "}
          {row.visitor_notified_at
            ? `${new Date(row.visitor_notified_at).toLocaleString()} (${labelize(row.visitor_notified_status)})`
            : "not yet"}
        </p>
      </div>
    </div>
  );
}
