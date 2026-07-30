import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, isStaff, useAdminSession } from "@/lib/admin-auth";
import { AdminHeading, Alert, DeleteButton, Field, ImageField, SaveButton, TextArea, Toggle } from "@/components/admin/cms-ui";
import { CMS_PAGES, DEFAULT_SECTION_KEYS, SECTION_KEY_SUGGESTIONS, SECTION_TEMPLATES, type PageSection, type SectionItem } from "@/lib/cms";

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

  const suggestions = SECTION_KEY_SUGGESTIONS[page] ?? DEFAULT_SECTION_KEYS.map((k) => ({ key: k, label: k }));
  const existing = new Set(rows.map((r) => r.section_key));
  const missing = suggestions.filter((s) => !existing.has(s.key));

  async function addKeys(keys: string[]) {
    if (creating || keys.length === 0) return;
    setCreating(true);
    const { error } = await supabase.from("page_sections").insert(
      keys.map((k, i) => ({
        page_slug: page,
        section_key: k.trim().toLowerCase().replace(/\s+/g, "-"),
        ...EMPTY,
        sort_order: rows.length + i,
      })) as any,
    );
    setCreating(false);
    if (error) { setError("Could not add section: " + error.message); return; }
    setError(null);
    load();
  }

  async function addSection(e: React.FormEvent) {
    e.preventDefault();
    await addKeys([newKey]);
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
        <div className="mt-8 rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Add a section</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Each section below is a separate editable block on the website — its own heading, text, button and image.
            Anything you do not create keeps the wording and picture already designed into the page.
          </p>

          {missing.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Editable blocks not created yet
                </span>
                <button
                  type="button"
                  onClick={() => addKeys(missing.map((m) => m.key))}
                  disabled={creating}
                  className="rounded-full border border-[#E13495] px-4 py-1.5 text-xs font-semibold text-[#E13495] disabled:opacity-60"
                >
                  Add all {missing.length}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {missing.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => addKeys([s.key])}
                    disabled={creating}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition hover:border-[#E13495] hover:text-[#E13495] disabled:opacity-60"
                  >
                    <Plus className="h-3.5 w-3.5" /> {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={addSection} className="mt-6 flex flex-wrap items-end gap-3 border-t pt-5">
            <div className="min-w-[200px] flex-1">
              <Field label="Or add your own section key" value={newKey} onChange={setNewKey} required />
            </div>
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant disabled:opacity-60">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add section
            </button>
          </form>
        </div>
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

      {editable && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Section layout</span>
            <select
              value={(form as any).section_template ?? "custom"}
              onChange={(e) => set("section_template" as any, e.target.value as any)}
              className="mt-1 rounded-xl border bg-background px-3 py-2 text-sm"
            >
              {SECTION_TEMPLATES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <SaveButton saving={saving} saved={saved} onClick={save} />
        </div>
      )}

      <SectionItems sectionId={row.id} editable={editable} canDelete={canDelete} onError={onError} />
    </li>
  );
}

/** The individual cards/images inside one section — each fully editable on its own. */
function SectionItems({
  sectionId, editable, canDelete, onError,
}: { sectionId: string; editable: boolean; canDelete: boolean; onError: (m: string | null) => void }) {
  const [items, setItems] = useState<SectionItem[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("page_section_items" as any)
      .select("*")
      .eq("section_id", sectionId)
      .order("sort_order");
    if (error) onError(error.message);
    else setItems(((data as any[]) ?? []) as SectionItem[]);
  }

  useEffect(() => { if (open) load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open, sectionId]);

  async function addItem() {
    setBusy(true);
    const { error } = await supabase.from("page_section_items" as any).insert({
      section_id: sectionId,
      item_key: `item_${Date.now().toString(36)}`,
      sort_order: items.length,
    } as any);
    setBusy(false);
    if (error) onError("Could not add item: " + error.message);
    else { onError(null); load(); }
  }

  return (
    <div className="mt-5 border-t pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-semibold uppercase tracking-wider text-[#E13495] hover:underline"
      >
        {open ? "Hide" : "Show"} cards &amp; images in this section
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {items.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No individual cards yet. Add one to give this section its own editable image, title, text, icon and button.
            </p>
          )}
          {items.map((it) => (
            <ItemCard key={it.id} item={it} editable={editable} canDelete={canDelete} onChanged={load} onError={onError} />
          ))}
          {editable && (
            <button
              type="button"
              onClick={addItem}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold hover:border-[#E13495] hover:text-[#E13495] disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add card
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const ICON_CHOICES = ["", "radio", "graduation-cap", "tent", "users", "heart", "sparkles", "music", "book-open", "hand-heart"];

function ItemCard({
  item, editable, canDelete, onChanged, onError,
}: { item: SectionItem; editable: boolean; canDelete: boolean; onChanged: () => void; onError: (m: string | null) => void }) {
  const [form, setForm] = useState(item);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof SectionItem>(k: K, v: SectionItem[K]) { setForm((f) => ({ ...f, [k]: v })); setSaved(false); }

  async function save() {
    setSaving(true);
    const { id, section_id, ...values } = form as any;
    const { error } = await supabase.from("page_section_items" as any).update(values).eq("id", item.id);
    setSaving(false);
    if (error) { onError("Could not save card: " + error.message); return; }
    onError(null);
    setSaved(true);
  }

  return (
    <div className="rounded-xl bg-secondary/40 p-4 ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-background px-3 py-1 text-[10px] font-semibold uppercase tracking-wider">{form.item_key}</span>
        <div className="flex items-center gap-3">
          <Toggle label="Visible" checked={form.is_visible} onChange={(v) => set("is_visible", v)} disabled={!editable} />
          {canDelete && (
            <DeleteButton
              label="Remove card"
              confirmText="Remove this card from the section?"
              onConfirm={async () => {
                const { error } = await supabase.from("page_section_items" as any).delete().eq("id", item.id);
                if (error) onError(error.message); else onChanged();
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Title" value={form.title ?? ""} onChange={(v) => set("title", v)} disabled={!editable} />
        <Field label="Subtitle" value={form.subtitle ?? ""} onChange={(v) => set("subtitle", v)} disabled={!editable} />
        <Field label="Button label" value={form.cta_label ?? ""} onChange={(v) => set("cta_label", v)} disabled={!editable} />
        <Field label="Destination" value={form.cta_href ?? ""} onChange={(v) => set("cta_href", v)} disabled={!editable} placeholder="/ministries or https://…" />
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Icon</span>
          <select
            value={form.icon_key ?? ""}
            disabled={!editable}
            onChange={(e) => set("icon_key", e.target.value)}
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm"
          >
            {ICON_CHOICES.map((c) => <option key={c} value={c}>{c || "No icon"}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Opens in</span>
          <select
            value={form.link_target}
            disabled={!editable}
            onChange={(e) => set("link_target", e.target.value as any)}
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm"
          >
            <option value="self">Same tab</option>
            <option value="blank">New tab</option>
          </select>
        </label>
        <Field label="Display order" type="number" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v) || 0)} disabled={!editable} />
      </div>

      <div className="mt-3 space-y-3">
        <TextArea label="Description" rows={2} value={form.body ?? ""} onChange={(v) => set("body", v)} disabled={!editable} />
        <ImageField label="Card image" value={form.image_url ?? ""} onChange={(v) => set("image_url", v)} disabled={!editable} />
      </div>

      {editable && <div className="mt-3"><SaveButton saving={saving} saved={saved} onClick={save} label="Save card" /></div>}
    </div>
  );
}
