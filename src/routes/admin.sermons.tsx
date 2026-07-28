import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, isStaff, useAdminSession } from "@/lib/admin-auth";
import { AdminHeading, Alert, DeleteButton, Field, ImageField, SaveButton, TextArea, Toggle } from "@/components/admin/cms-ui";
import { slugify, youTubeId, type Sermon } from "@/lib/cms";

export const Route = createFileRoute("/admin/sermons")({ ssr: false, component: AdminSermonsPage });

function AdminSermonsPage() {
  const { roles } = useAdminSession();
  const editable = isStaff(roles);
  const canDelete = canManage(roles);
  const [rows, setRows] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", youtube_url: "" });
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("sermons" as any)
      .select("*")
      .order("sort_order")
      .order("sermon_date", { ascending: false });
    if (error) setError(error.message);
    else { setError(null); setRows((data as any[]) ?? []); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (creating || !draft.title.trim()) return;
    setCreating(true);
    const base = slugify(draft.title);
    const slug = rows.some((r) => r.slug === base) ? `${base}-${Date.now().toString(36)}` : base;
    const { error } = await supabase.from("sermons" as any).insert({
      title: draft.title.trim(),
      slug,
      youtube_url: draft.youtube_url.trim() || null,
      youtube_video_id: youTubeId(draft.youtube_url),
      sort_order: rows.length,
    } as any);
    setCreating(false);
    if (error) { setError("Could not add sermon: " + error.message); return; }
    setError(null); setDraft({ title: "", youtube_url: "" }); load();
  }

  return (
    <div>
      <AdminHeading title="Sermons" description="Only published sermons appear on the website. A sermon needs a valid YouTube link before it can be published." />
      <Alert error={error} />

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No sermons yet — the website is showing its built-in sermon list.</p>}
          {rows.map((s) => <SermonCard key={s.id} sermon={s} editable={editable} canDelete={canDelete} onChanged={load} onError={setError} />)}
        </ul>
      )}

      {editable && (
        <form onSubmit={create} className="mt-8 rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Add a sermon</h2>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1"><Field label="Sermon title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} required /></div>
            <div className="min-w-[240px] flex-1"><Field label="YouTube link" value={draft.youtube_url} onChange={(v) => setDraft({ ...draft, youtube_url: v })} placeholder="https://www.youtube.com/watch?v=..." /></div>
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant disabled:opacity-60">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add sermon
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function SermonCard({
  sermon, editable, canDelete, onChanged, onError,
}: { sermon: Sermon; editable: boolean; canDelete: boolean; onChanged: () => void; onError: (m: string | null) => void }) {
  const [form, setForm] = useState({ ...sermon });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); setSaved(false); }

  async function save() {
    if (saving) return;
    const videoId = youTubeId(form.youtube_video_id || form.youtube_url);
    if (form.is_published && (!form.youtube_url || !videoId)) {
      onError("Add a valid YouTube link before publishing this sermon.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("sermons" as any).update({
      title: form.title,
      slug: slugify(form.slug || form.title),
      speaker: form.speaker,
      sermon_date: form.sermon_date || null,
      category: form.category,
      short_description: form.short_description,
      full_description: form.full_description,
      youtube_url: form.youtube_url,
      youtube_video_id: videoId,
      thumbnail_url: form.thumbnail_url,
      is_featured: form.is_featured,
      is_published: form.is_published,
      sort_order: Number(form.sort_order) || 0,
    }).eq("id", sermon.id);
    setSaving(false);
    if (error) onError("Could not save: " + error.message); else { onError(null); setSaved(true); onChanged(); }
  }

  return (
    <li className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{sermon.title}</h3>
        <div className="flex items-center gap-3">
          <Toggle label="Published" checked={form.is_published} onChange={(v) => set("is_published", v)} disabled={!editable} />
          <Toggle label="Featured" checked={form.is_featured} onChange={(v) => set("is_featured", v)} disabled={!editable} />
          {canDelete && (
            <DeleteButton
              confirmText={`Delete the sermon “${sermon.title}”?`}
              onConfirm={async () => {
                const { error } = await supabase.from("sermons" as any).delete().eq("id", sermon.id);
                if (error) onError(error.message); else onChanged();
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Title" value={form.title} onChange={(v) => set("title", v)} disabled={!editable} />
        <Field label="Web address (slug)" value={form.slug} onChange={(v) => set("slug", v)} disabled={!editable} />
        <Field label="Speaker" value={form.speaker ?? ""} onChange={(v) => set("speaker", v)} disabled={!editable} />
        <Field label="Date" type="date" value={form.sermon_date ?? ""} onChange={(v) => set("sermon_date", v)} disabled={!editable} />
        <Field label="Series / category" value={form.category ?? ""} onChange={(v) => set("category", v)} disabled={!editable} />
        <Field label="YouTube link" value={form.youtube_url ?? ""} onChange={(v) => set("youtube_url", v)} disabled={!editable} />
        <Field label="Display order" type="number" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v) || 0)} disabled={!editable} />
      </div>
      <div className="mt-4 space-y-4">
        <TextArea label="Short description" rows={2} value={form.short_description ?? ""} onChange={(v) => set("short_description", v)} disabled={!editable} />
        <TextArea label="Full description" rows={4} value={form.full_description ?? ""} onChange={(v) => set("full_description", v)} disabled={!editable} />
        <ImageField label="Thumbnail (optional — YouTube image used when empty)" value={form.thumbnail_url ?? ""} onChange={(v) => set("thumbnail_url", v)} disabled={!editable} />
      </div>
      {editable && <div className="mt-4"><SaveButton saving={saving} saved={saved} onClick={save} /></div>}
    </li>
  );
}
