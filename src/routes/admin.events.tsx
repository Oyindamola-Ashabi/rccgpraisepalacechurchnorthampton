import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, isStaff, useAdminSession } from "@/lib/admin-auth";
import { AdminHeading, Alert, DeleteButton, Field, ImageField, SaveButton, TextArea, Toggle } from "@/components/admin/cms-ui";
import { EVENT_TYPES, COUPLES_RETREAT_TYPE, type ChurchEvent } from "@/lib/cms";

export const Route = createFileRoute("/admin/events")({ ssr: false, component: AdminEventsPage });

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AdminEventsPage() {
  const { roles } = useAdminSession();
  const editable = isStaff(roles);
  const canDelete = canManage(roles);
  const [rows, setRows] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", start_at: "", event_type: "general", registration_open: false });
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("events").select("*").order("start_at", { ascending: true });
    if (error) setError(error.message);
    else { setError(null); setRows((data as any[]) ?? []); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (creating || !draft.title.trim() || !draft.start_at) return;
    setCreating(true);
    const { error } = await supabase.from("events").insert({
      title: draft.title.trim(),
      start_at: new Date(draft.start_at).toISOString(),
      event_type: draft.event_type,
      registration_open: draft.event_type === COUPLES_RETREAT_TYPE ? draft.registration_open : false,
      sort_order: rows.length,
    } as any);
    setCreating(false);
    if (error) { setError("Could not add event: " + error.message); return; }
    setError(null); setDraft({ title: "", start_at: "", event_type: "general", registration_open: false }); load();
  }

  return (
    <div>
      <AdminHeading title="Events" description="Only published events appear on the website. Events whose date has passed automatically move to “Past events”. Switch on “Show on Homepage” for the events you want featured on the homepage, and add a short label (e.g. Picnic) only if you want a small badge on the card — leave it blank for no badge." />
      <Alert error={error} />

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No events yet — the website is showing its built-in event list.</p>}
          {rows.map((ev) => <EventCard key={ev.id} event={ev} editable={editable} canDelete={canDelete} onChanged={load} onError={setError} />)}
        </ul>
      )}

      {editable && (
        <form onSubmit={create} className="mt-8 rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Add an event</h2>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1"><Field label="Event title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} required /></div>
            <div className="min-w-[200px]"><Field label="Starts" type="datetime-local" value={draft.start_at} onChange={(v) => setDraft({ ...draft, start_at: v })} required /></div>
            <label className="block min-w-[200px]">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Type of event</span>
              <select
                value={draft.event_type}
                onChange={(e) => setDraft({ ...draft, event_type: e.target.value })}
                className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            {draft.event_type === COUPLES_RETREAT_TYPE && (
              <Toggle
                label="Registration of interest open"
                checked={draft.registration_open}
                onChange={(v) => setDraft({ ...draft, registration_open: v })}
              />
            )}
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant disabled:opacity-60">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add event
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function EventCard({
  event, editable, canDelete, onChanged, onError,
}: { event: ChurchEvent; editable: boolean; canDelete: boolean; onChanged: () => void; onError: (m: string | null) => void }) {
  const [form, setForm] = useState({ ...event, start_at: toLocalInput(event.start_at), end_at: toLocalInput(event.end_at) });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); setSaved(false); }

  async function save() {
    if (saving) return;
    if (form.end_at && new Date(form.end_at) < new Date(form.start_at)) {
      onError("The end date and time cannot be before the start.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("events").update({
      title: form.title,
      description: form.description,
      start_at: new Date(form.start_at).toISOString(),
      end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
      venue: form.venue,
      image_url: form.image_url,
      registration_url: form.registration_url,
      badge_label: (form.badge_label ?? "").trim() || null,
      event_type: (form as any).event_type || "general",
      registration_open: !!(form as any).registration_open,
      show_on_homepage: form.show_on_homepage,
      is_featured: form.is_featured,
      is_published: form.is_published,
      sort_order: Number(form.sort_order) || 0,
    }).eq("id", event.id);
    setSaving(false);
    if (error) onError("Could not save: " + error.message); else { onError(null); setSaved(true); }
  }

  const past = new Date(event.end_at ?? event.start_at) < new Date();

  return (
    <li className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold">{event.title}</h3>
          {past && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">Past</span>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Toggle label="Published" checked={form.is_published} onChange={(v) => set("is_published", v)} disabled={!editable} />
          <Toggle label="Show on Homepage" checked={!!form.show_on_homepage} onChange={(v) => set("show_on_homepage", v)} disabled={!editable} />
          {(form as any).event_type === COUPLES_RETREAT_TYPE && (
            <Toggle
              label="Registration of interest open"
              checked={!!(form as any).registration_open}
              onChange={(v) => set("registration_open" as any, v as any)}
              disabled={!editable}
            />
          )}
          {canDelete && (
            <DeleteButton
              confirmText={`Delete the event “${event.title}”?`}
              onConfirm={async () => {
                const { error } = await supabase.from("events").delete().eq("id", event.id);
                if (error) onError(error.message); else onChanged();
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Type of event</span>
          <select
            value={(form as any).event_type ?? "general"}
            onChange={(e) => set("event_type" as any, e.target.value as any)}
            disabled={!editable}
            className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            Couples Retreats appear on the Couples Retreat page and take registrations there.
          </span>
        </label>
        <Field label="Title" value={form.title} onChange={(v) => set("title", v)} disabled={!editable} />
        <Field label="Venue" value={form.venue ?? ""} onChange={(v) => set("venue", v)} disabled={!editable} />
        <Field label="Starts" type="datetime-local" value={form.start_at} onChange={(v) => set("start_at", v)} disabled={!editable} />
        <Field label="Ends (optional)" type="datetime-local" value={form.end_at} onChange={(v) => set("end_at", v)} disabled={!editable} />
        <Field label="Short label / badge (optional)" value={form.badge_label ?? ""} onChange={(v) => set("badge_label", v)} disabled={!editable} />
        <Field label="Registration link" value={form.registration_url ?? ""} onChange={(v) => set("registration_url", v)} disabled={!editable} />
        <Field label="Display order" type="number" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v) || 0)} disabled={!editable} />
      </div>
      <div className="mt-4 space-y-4">
        <TextArea label="Description" rows={3} value={form.description ?? ""} onChange={(v) => set("description", v)} disabled={!editable} />
        <ImageField label="Featured image" value={form.image_url ?? ""} onChange={(v) => set("image_url", v)} disabled={!editable} />
      </div>
      {editable && <div className="mt-4"><SaveButton saving={saving} saved={saved} onClick={save} /></div>}
    </li>
  );
}
