import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, isStaff, useAdminSession } from "@/lib/admin-auth";
import { AdminHeading, Alert, DeleteButton, Field, ImageField, SaveButton, TextArea, Toggle } from "@/components/admin/cms-ui";
import { CMS_PAGES, DEFAULT_SECTION_KEYS, type PageSection } from "@/lib/cms";

export const Route = createFileRoute("/admin/pages")({ ssr: false, component: AdminPagesPage });

const EMPTY = {
  page_title: "", headline: "", subheading: "", body: "", cta_label: "", cta_href: "",
  image_url: "", seo_title: "", seo_description: "", is_visible: true, sort_order: 0,
};

function AdminPagesPage() {
  const { roles } = useAdminSession();
  const editable = isStaff(roles);
  const canDelete = canManage(roles);
  const [page, setPage] = useState<string>(CMS_PAGES[0].slug);
  const [rows, setRows] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("hero");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("page_sections").select("*").eq("page_slug", page).order("sort_order");
    if (error) setError(error.message);
    else { setError(null); setRows((data as any[]) ?? []); }
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page]);

  async function addSection(e: React.FormEvent) {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    const { error } = await supabase.from("page_sections").insert({
      page_slug: page,
      section_key: newKey.trim().toLowerCase().replace(/\s+/g, "-"),
      ...EMPTY,
      sort_order: rows.length,
    } as any);
    setCreating(false);
    if (error) { setError("Could not add section: " + error.message); return; }
    setError(null);
    load();
  }

  return (
    <div>
      <AdminHeading
        title="Page Content"
        description="Edit the text, images and buttons used on the main website pages. Anything left blank keeps the wording already on the site."
      />
      <Alert error={error} />

      <div className="mt-5 flex flex-wrap gap-2">
        {CMS_PAGES.map((p) => (
          <button
            key={p.slug}
            onClick={() => setPage(p.slug)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              page === p.slug ? "gradient-brand border-transparent text-white shadow-elegant" : "hover:border-[#E13495] hover:text-[#E13495]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No sections yet for this page — add one below.</p>}
          {rows.map((row) => (
            <SectionCard key={row.id} row={row} editable={editable} canDelete={canDelete} onChanged={load} onError={setError} />
          ))}
        </ul>
      )}

      {editable && (
        <form onSubmit={addSection} className="mt-8 rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Add a section</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            The website reads these keys: {DEFAULT_SECTION_KEYS.join(", ")}. Use “hero” to control the page heading and main image.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <Field label="Section key" value={newKey} onChange={setNewKey} required />
            </div>
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant disabled:opacity-60">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add section
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function SectionCard({
  row, editable, canDelete, onChanged, onError,
}: { row: PageSection; editable: boolean; canDelete: boolean; onChanged: () => void; onError: (m: string | null) => void }) {
  const [form, setForm] = useState(row);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof PageSection>(k: K, v: PageSection[K]) { setForm((f) => ({ ...f, [k]: v })); setSaved(false); }

  async function save() {
    if (saving) return;
    setSaving(true);
    const { id, page_slug, section_key, ...values } = form as any;
    const { error } = await supabase.from("page_sections").update(values).eq("id", row.id);
    setSaving(false);
    if (error) { onError("Could not save section: " + error.message); return; }
    onError(null);
    setSaved(true);
  }

  return (
    <li className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wider">{row.section_key}</span>
        <div className="flex items-center gap-3">
          <Toggle label="Visible" checked={form.is_visible} onChange={(v) => set("is_visible", v)} disabled={!editable} />
          {canDelete && (
            <DeleteButton
              confirmText={`Delete the “${row.section_key}” section? The website will fall back to its built-in content.`}
              onConfirm={async () => {
                const { error } = await supabase.from("page_sections").delete().eq("id", row.id);
                if (error) onError(error.message); else onChanged();
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Page title" value={form.page_title ?? ""} onChange={(v) => set("page_title", v)} disabled={!editable} />
        <Field label="Headline" value={form.headline ?? ""} onChange={(v) => set("headline", v)} disabled={!editable} />
        <Field label="Subheading" value={form.subheading ?? ""} onChange={(v) => set("subheading", v)} disabled={!editable} />
        <Field label="Display order" type="number" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v) || 0)} disabled={!editable} />
        <Field label="Button label" value={form.cta_label ?? ""} onChange={(v) => set("cta_label", v)} disabled={!editable} />
        <Field label="Button destination" value={form.cta_href ?? ""} onChange={(v) => set("cta_href", v)} disabled={!editable} placeholder="/plan-a-visit" />
        <Field label="SEO title" value={form.seo_title ?? ""} onChange={(v) => set("seo_title", v)} disabled={!editable} />
        <Field label="SEO description" value={form.seo_description ?? ""} onChange={(v) => set("seo_description", v)} disabled={!editable} />
      </div>

      <div className="mt-4 space-y-4">
        <TextArea label="Body text" rows={4} value={form.body ?? ""} onChange={(v) => set("body", v)} disabled={!editable} />
        <ImageField label="Section image" value={form.image_url ?? ""} onChange={(v) => set("image_url", v)} disabled={!editable} />
      </div>

      {editable && <div className="mt-4"><SaveButton saving={saving} saved={saved} onClick={save} /></div>}
    </li>
  );
}
