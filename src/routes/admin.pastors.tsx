import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, useAdminSession } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/pastors")({ ssr: false, component: AdminPastorsPage });

type Pastor = {
  id: string;
  full_name: string;
  title: string;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  is_active: boolean;
  sort_order: number;
};

const EMPTY = { full_name: "", title: "Pastor", bio: "", photo_url: "", email: "", is_active: true, sort_order: 0 };

function AdminPastorsPage() {
  const { roles } = useAdminSession();
  const editable = canManage(roles);
  const [pastors, setPastors] = useState<Pastor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ ...EMPTY });
  const [creating, setCreating] = useState(false);

  async function load() {
    const { data, error } = await supabase.from("pastors").select("*").order("sort_order").order("full_name");
    if (error) setError(error.message);
    else setPastors((data as Pastor[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const { error } = await supabase.from("pastors").insert({
      full_name: draft.full_name.trim(),
      title: draft.title.trim() || "Pastor",
      bio: draft.bio.trim() || null,
      photo_url: draft.photo_url.trim() || null,
      email: draft.email.trim() || null,
      is_active: draft.is_active,
      sort_order: Number(draft.sort_order) || 0,
    });
    setCreating(false);
    if (error) { setError(error.message); return; }
    setDraft({ ...EMPTY });
    setError(null);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Pastors</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Pastors listed here appear in the “Book an Appointment” page. Deactivate a pastor to hide them from the public booking form.
      </p>

      {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
      ) : (
        <ul className="mt-6 space-y-3">
          {pastors.map((p) => (
            <PastorRow key={p.id} pastor={p} editable={editable} onSaved={load} onError={setError} />
          ))}
        </ul>
      )}

      {editable && (
        <form onSubmit={create} className="mt-8 rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Add a pastor</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Full name *" value={draft.full_name} onChange={(v) => setDraft({ ...draft, full_name: v })} required />
            <Input label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
            <Input label="Email" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} />
            <Input label="Photo URL" value={draft.photo_url} onChange={(v) => setDraft({ ...draft, photo_url: v })} />
            <Input label="Sort order" value={String(draft.sort_order)} onChange={(v) => setDraft({ ...draft, sort_order: Number(v) || 0 })} />
            <label className="flex items-end gap-2 text-sm">
              <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />
              Active (visible on booking page)
            </label>
          </div>
          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Focus / bio</label>
            <textarea rows={3} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
              className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]" />
          </div>
          <button type="submit" disabled={creating} className="mt-4 inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant hover:opacity-95 disabled:opacity-60">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add pastor
          </button>
        </form>
      )}
    </div>
  );
}

function PastorRow({ pastor, editable, onSaved, onError }: { pastor: Pastor; editable: boolean; onSaved: () => void; onError: (m: string) => void }) {
  const [form, setForm] = useState(pastor);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("pastors").update({
      full_name: form.full_name,
      title: form.title,
      bio: form.bio,
      photo_url: form.photo_url,
      email: form.email,
      is_active: form.is_active,
      sort_order: Number(form.sort_order) || 0,
    }).eq("id", pastor.id);
    setSaving(false);
    if (error) onError(error.message);
    else onSaved();
  }

  return (
    <li className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-black/5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} disabled={!editable} />
        <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} disabled={!editable} />
        <Input label="Email" value={form.email ?? ""} onChange={(v) => setForm({ ...form, email: v })} disabled={!editable} />
        <Input label="Photo URL" value={form.photo_url ?? ""} onChange={(v) => setForm({ ...form, photo_url: v })} disabled={!editable} />
        <Input label="Sort order" value={String(form.sort_order)} onChange={(v) => setForm({ ...form, sort_order: Number(v) || 0 })} disabled={!editable} />
        <label className="flex items-end gap-2 text-sm">
          <input type="checkbox" disabled={!editable} checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          Active
        </label>
      </div>
      <div className="mt-4">
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Focus / bio</label>
        <textarea rows={2} disabled={!editable} value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495] disabled:opacity-70" />
      </div>
      {editable && (
        <button onClick={save} disabled={saving} className="mt-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold hover:bg-secondary/50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save changes
        </button>
      )}
    </li>
  );
}

function Input({ label, value, onChange, required, disabled }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        value={value}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495] disabled:opacity-70"
      />
    </label>
  );
}
