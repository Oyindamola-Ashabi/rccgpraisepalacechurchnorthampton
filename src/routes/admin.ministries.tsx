import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, isStaff, useAdminSession } from "@/lib/admin-auth";
import { AdminHeading, Alert, DeleteButton, Field, ImageField, SaveButton, TextArea, Toggle } from "@/components/admin/cms-ui";
import type { Ministry } from "@/lib/cms";

export const Route = createFileRoute("/admin/ministries")({ ssr: false, component: AdminMinistriesPage });

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `ministry-${Date.now()}`;
}

function AdminMinistriesPage() {
  const { roles } = useAdminSession();
  const editable = isStaff(roles);
  const canDelete = canManage(roles);
  const [rows, setRows] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("ministries").select("*").order("sort_order").order("name");
    if (error) setError(error.message);
    else { setError(null); setRows((data as any[]) ?? []); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (creating || !name.trim()) return;
    setCreating(true);
    const { error } = await supabase.from("ministries").insert({ name: name.trim(), slug: slugify(name), sort_order: rows.length } as any);
    setCreating(false);
    if (error) { setError("Could not add ministry: " + error.message); return; }
    setError(null); setName(""); load();
  }

  return (
    <div>
      <AdminHeading title="Ministries" description="Manage the ministries shown on the website. Inactive ministries are hidden from visitors." />
      <Alert error={error} />

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No ministries yet — the website is showing its built-in list.</p>}
          {rows.map((m) => <MinistryCard key={m.id} ministry={m} editable={editable} canDelete={canDelete} onChanged={load} onError={setError} />)}
        </ul>
      )}

      {editable && (
        <form onSubmit={create} className="mt-8 rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Add a ministry</h2>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1"><Field label="Ministry name" value={name} onChange={setName} required /></div>
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant disabled:opacity-60">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add ministry
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function MinistryCard({
  ministry, editable, canDelete, onChanged, onError,
}: { ministry: Ministry; editable: boolean; canDelete: boolean; onChanged: () => void; onError: (m: string | null) => void }) {
  const [form, setForm] = useState(ministry);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Ministry>(k: K, v: Ministry[K]) { setForm((f) => ({ ...f, [k]: v })); setSaved(false); }

  async function save() {
    if (saving) return;
    setSaving(true);
    const { id, ...values } = form as any;
    const { error } = await supabase.from("ministries").update(values).eq("id", ministry.id);
    setSaving(false);
    if (error) onError("Could not save: " + error.message); else { onError(null); setSaved(true); }
  }

  return (
    <li className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{ministry.name}</h3>
        <div className="flex items-center gap-3">
          <Toggle label="Active" checked={form.is_active} onChange={(v) => set("is_active", v)} disabled={!editable} />
          {canDelete && (
            <DeleteButton
              confirmText={`Delete the ministry “${ministry.name}”?`}
              onConfirm={async () => {
                const { error } = await supabase.from("ministries").delete().eq("id", ministry.id);
                if (error) onError(error.message); else onChanged();
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Name" value={form.name} onChange={(v) => set("name", v)} disabled={!editable} />
        <Field label="Leader" value={form.leader ?? ""} onChange={(v) => set("leader", v)} disabled={!editable} />
        <Field label="Meeting information" value={form.meeting_info ?? ""} onChange={(v) => set("meeting_info", v)} disabled={!editable} />
        <Field label="Link (page or external site)" value={form.link_url ?? ""} onChange={(v) => set("link_url", v)} disabled={!editable} />
        <Field label="Display order" type="number" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v) || 0)} disabled={!editable} />
      </div>
      <div className="mt-4 space-y-4">
        <TextArea label="Short description" rows={2} value={form.short_description ?? ""} onChange={(v) => set("short_description", v)} disabled={!editable} />
        <TextArea label="Full description" rows={4} value={form.full_description ?? ""} onChange={(v) => set("full_description", v)} disabled={!editable} />
        <ImageField value={form.image_url ?? ""} onChange={(v) => set("image_url", v)} disabled={!editable} />
      </div>
      {editable && <div className="mt-4"><SaveButton saving={saving} saved={saved} onClick={save} /></div>}
    </li>
  );
}
