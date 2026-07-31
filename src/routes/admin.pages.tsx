import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, isStaff, useAdminSession } from "@/lib/admin-auth";
import {
  AdminHeading,
  Alert,
  DeleteButton,
  Field,
  ImageField,
  SaveRow,
  StatusBadge,
  TextArea,
  Toggle,
  useDraftForm,
} from "@/components/admin/cms-ui";
import {
  autoTemplate,
  BADGE_SUGGESTIONS,
  CMS_PAGES,
  invalidatePageSections,
  invalidateSectionItems,
  isRetiredSection,
  sectionHint,
  sectionLabel,
  sectionSpec,
  sectionSpecs,
  type PageSection,
  type SectionItem,
} from "@/lib/cms";

export const Route = createFileRoute("/admin/pages")({ ssr: false, component: AdminPagesPage });

function AdminPagesPage() {
  const { roles } = useAdminSession();
  const editable = isStaff(roles);
  const canDelete = canManage(roles);
  const [page, setPage] = useState<string>(CMS_PAGES[0].slug);
  const [rows, setRows] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const pageInfo = CMS_PAGES.find((p) => p.slug === page)!;

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("page_sections")
      .select("*")
      .eq("page_slug", page)
      .order("sort_order");
    if (error) setError(error.message);
    else {
      setError(null);
      setRows((data as any[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [page]);

  /** Older duplicate blocks are hidden from the administrator entirely. */
  const liveRows = useMemo(() => rows.filter((r) => !isRetiredSection(r as any)), [rows]);

  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return liveRows;
    return liveRows.filter(
      (r) =>
        sectionLabel(r.page_slug, r.section_key).toLowerCase().includes(q) ||
        r.section_key.toLowerCase().includes(q) ||
        (r.headline ?? "").toLowerCase().includes(q),
    );
  }, [liveRows, search]);

  const existing = new Set(liveRows.map((r) => r.section_key));
  const missing = sectionSpecs(page).filter((s) => !existing.has(s.key));

  async function addKeys(keys: string[]) {
    if (creating || keys.length === 0) return;
    setCreating(true);
    const { error } = await supabase.from("page_sections").insert(
      keys.map((k, i) => ({
        page_slug: page,
        section_key: k,
        section_template: autoTemplate(page, k),
        is_visible: true,
        sort_order: rows.length + i,
      })) as any,
    );
    setCreating(false);
    if (error) {
      setError("Could not add this section: " + error.message);
      return;
    }
    setError(null);
    invalidatePageSections(page);
    load();
  }

  return (
    <div>
      <AdminHeading
        breadcrumb={["Admin", "Page Content", pageInfo.label]}
        title="Page Content"
        description="Edit the text, images, buttons and repeated cards displayed on the website’s public pages."
      />
      <Alert error={error} />

      <div className="mt-5 flex flex-wrap gap-2">
        {CMS_PAGES.map((p) => (
          <button
            key={p.slug}
            onClick={() => setPage(p.slug)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              page === p.slug
                ? "gradient-brand border-transparent text-white shadow-elegant"
                : "hover:border-[#E13495] hover:text-[#E13495]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-secondary/40 p-4 text-sm text-muted-foreground ring-1 ring-black/5">
        <span className="font-semibold text-foreground">{pageInfo.label}: </span>
        {pageInfo.blurb}
      </div>

      <label className="mt-5 flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sections on this page"
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </label>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#E13495]" />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {visibleRows.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nothing to edit here yet — use “Sections you can still add” below.
            </p>
          )}
          {visibleRows.map((row) => (
            <SectionCard
              key={row.id}
              row={row}
              editable={editable}
              canDelete={canDelete}
              onChanged={load}
              onError={setError}
            />
          ))}
        </ul>
      )}

      {editable && missing.length > 0 && (
        <div className="mt-8 rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Sections you can still add</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Anything you do not create keeps the wording and picture already designed into the page.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
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
    </div>
  );
}

function SectionCard({
  row,
  editable,
  canDelete,
  onChanged,
  onError,
}: {
  row: PageSection;
  editable: boolean;
  canDelete: boolean;
  onChanged: () => void;
  onError: (m: string | null) => void;
}) {
  const draft = useDraftForm(`section:${row.id}`, row);
  const { form, set } = draft;
  const spec = sectionSpec(row.page_slug, row.section_key);
  const hint = sectionHint(row.page_slug, row.section_key);

  async function save() {
    const ok = await draft.save(async () => {
      const { id, page_slug, section_key, ...values } = form as any;
      // The layout is decided by the website, never by the administrator.
      values.section_template = autoTemplate(row.page_slug, row.section_key);
      const { error } = await supabase.from("page_sections").update(values).eq("id", row.id);
      return { error };
    });
    if (ok) {
      onError(null);
      invalidatePageSections(row.page_slug);
      invalidateSectionItems(row.page_slug, row.section_key);
    }
  }

  return (
    <li className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-black/5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-base font-bold">{sectionLabel(row.page_slug, row.section_key)}</div>
          {hint && <p className="mt-1 max-w-xl text-xs text-muted-foreground">{hint}</p>}
          <span className="mt-1 block text-[10px] uppercase tracking-wider text-muted-foreground/70">
            {row.page_slug} / {row.section_key}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge tone={form.is_visible ? "on" : "off"}>{form.is_visible ? "Visible" : "Hidden"}</StatusBadge>
          <Toggle label="Show on the website" checked={form.is_visible} onChange={(v) => set("is_visible", v)} disabled={!editable} />
          {canDelete && (
            <DeleteButton
              confirmText={`Delete “${sectionLabel(row.page_slug, row.section_key)}”? The website falls back to its built-in content.`}
              onConfirm={async () => {
                const { error } = await supabase.from("page_sections").delete().eq("id", row.id);
                if (error) onError(error.message);
                else {
                  invalidatePageSections(row.page_slug);
                  onChanged();
                }
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Heading" value={form.headline ?? ""} onChange={(v) => set("headline", v)} disabled={!editable} hint="The main heading shown for this section." />
        <Field label="Small heading above" value={form.subheading ?? ""} onChange={(v) => set("subheading", v)} disabled={!editable} hint="The short label printed above the heading." />
        <Field label="Button wording" value={form.cta_label ?? ""} onChange={(v) => set("cta_label", v)} disabled={!editable} />
        <Field
          label="Button link"
          value={form.cta_href ?? ""}
          onChange={(v) => set("cta_href", v)}
          disabled={!editable}
          placeholder="/plan-a-visit or https://…"
          hint={
            row.section_key === "live_video"
              ? "This link controls the Watch Live video shown on the Media page. Paste the full YouTube link."
              : "This destination opens when a visitor clicks the button."
          }
        />
        <Field label="Display order" type="number" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v) || 0)} disabled={!editable} hint="Use Display Order to change where this section appears." />
        <Field label="Page title" value={form.page_title ?? ""} onChange={(v) => set("page_title", v)} disabled={!editable} />
        <Field label="Search-engine title" value={form.seo_title ?? ""} onChange={(v) => set("seo_title", v)} disabled={!editable} />
        <Field label="Search-engine description" value={form.seo_description ?? ""} onChange={(v) => set("seo_description", v)} disabled={!editable} />
      </div>

      <div className="mt-4 space-y-4">
        <TextArea label="Text" rows={4} value={form.body ?? ""} onChange={(v) => set("body", v)} disabled={!editable} />
        <ImageField
          label="Image"
          value={form.image_url ?? ""}
          onChange={(v) => set("image_url", v)}
          disabled={!editable}
          hint={
            row.section_key === "live_video"
              ? "This image appears over the Watch Live video before it plays."
              : "This picture appears in this section on the website."
          }
        />
      </div>

      {editable && (
        <SaveRow
          status={draft.status}
          message={draft.message}
          lastSaved={draft.lastSaved}
          restored={draft.restored}
          onSave={save}
          onDiscard={draft.discardDraft}
        />
      )}

      {spec?.itemsLabel && (
        <SectionItems
          sectionId={row.id}
          pageSlug={row.page_slug}
          sectionKey={row.section_key}
          itemsLabel={spec.itemsLabel}
          itemNoun={spec.itemNoun ?? "card"}
          editable={editable}
          canDelete={canDelete}
          onError={onError}
        />
      )}
    </li>
  );
}

/** The individual cards/images inside one section — each fully editable on its own. */
function SectionItems({
  sectionId,
  pageSlug,
  sectionKey,
  itemsLabel,
  itemNoun,
  editable,
  canDelete,
  onError,
}: {
  sectionId: string;
  pageSlug: string;
  sectionKey: string;
  itemsLabel: string;
  itemNoun: string;
  editable: boolean;
  canDelete: boolean;
  onError: (m: string | null) => void;
}) {
  const [items, setItems] = useState<SectionItem[]>([]);
  const [count, setCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("page_section_items" as any)
      .select("*")
      .eq("section_id", sectionId)
      .order("sort_order");
    if (error) onError(error.message);
    else {
      const list = ((data as any[]) ?? []) as SectionItem[];
      setItems(list);
      setCount(list.length);
    }
  }

  // The count is loaded straight away so the button can say how many there are.
  useEffect(() => {
    load();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [sectionId]);

  async function addItem() {
    setBusy(true);
    const { error } = await supabase.from("page_section_items" as any).insert({
      section_id: sectionId,
      item_key: `item_${Date.now().toString(36)}`,
      sort_order: items.length,
    } as any);
    setBusy(false);
    if (error) onError(`Could not add this ${itemNoun}: ` + error.message);
    else {
      onError(null);
      invalidateSectionItems(pageSlug, sectionKey);
      load();
    }
  }

  const label = count === null ? itemsLabel : `${itemsLabel.replace("Manage", `Manage ${count}`)}`;

  return (
    <div className="mt-5 border-t pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[#E13495] hover:text-[#E13495]"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        {label}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {items.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Nothing here yet. Add one to give this section its own picture, title, text, icon and link.
            </p>
          )}
          {items.map((it) => (
            <ItemCard
              key={it.id}
              item={it}
              itemNoun={itemNoun}
              pageSlug={pageSlug}
              sectionKey={sectionKey}
              editable={editable}
              canDelete={canDelete}
              onChanged={load}
              onError={onError}
            />
          ))}
          {editable && (
            <button
              type="button"
              onClick={addItem}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold hover:border-[#E13495] hover:text-[#E13495] disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add {itemNoun}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const ICON_CHOICES = ["", "radio", "graduation-cap", "tent", "users", "heart", "sparkles", "music", "book-open", "hand-heart"];

function ItemCard({
  item,
  itemNoun,
  pageSlug,
  sectionKey,
  editable,
  canDelete,
  onChanged,
  onError,
}: {
  item: SectionItem;
  itemNoun: string;
  pageSlug: string;
  sectionKey: string;
  editable: boolean;
  canDelete: boolean;
  onChanged: () => void;
  onError: (m: string | null) => void;
}) {
  const draft = useDraftForm(`item:${item.id}`, item);
  const { form, set } = draft;
  const [open, setOpen] = useState(false);

  async function save() {
    const ok = await draft.save(async () => {
      const { id, section_id, ...values } = form as any;
      const { error } = await supabase.from("page_section_items" as any).update(values).eq("id", item.id);
      return { error };
    });
    if (ok) {
      onError(null);
      invalidateSectionItems(pageSlug, sectionKey);
      onChanged();
    }
  }

  return (
    <div className="rounded-xl bg-secondary/40 p-4 ring-1 ring-black/5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-background ring-1 ring-black/10">
          {form.image_url ? (
            <img src={form.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-[10px] text-muted-foreground">No image</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{form.title || `Untitled ${itemNoun}`}</div>
          {form.body && <p className="line-clamp-1 text-xs text-muted-foreground">{form.body}</p>}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge tone={form.is_visible ? "on" : "off"}>{form.is_visible ? "Visible" : "Hidden"}</StatusBadge>
            <StatusBadge tone="off">Order {form.sort_order}</StatusBadge>
            {draft.status === "dirty" && <StatusBadge tone="warn">Unsaved</StatusBadge>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:border-[#E13495] hover:text-[#E13495]"
        >
          {open ? "Close" : "Edit"}
        </button>
        {canDelete && (
          <DeleteButton
            label="Delete"
            confirmText={`Remove this ${itemNoun}?`}
            onConfirm={async () => {
              const { error } = await supabase.from("page_section_items" as any).delete().eq("id", item.id);
              if (error) onError(error.message);
              else {
                invalidateSectionItems(pageSlug, sectionKey);
                onChanged();
              }
            }}
          />
        )}
      </div>

      {open && (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Title" value={form.title ?? ""} onChange={(v) => set("title", v)} disabled={!editable} />
            <Field label="Day or subtitle" value={form.subtitle ?? ""} onChange={(v) => set("subtitle", v)} disabled={!editable} hint="For service times and programmes this is the day, e.g. Sundays." />
            <Field
              label="Card badge"
              value={form.badge_label ?? ""}
              onChange={(v) => set("badge_label", v)}
              disabled={!editable}
              placeholder="e.g. Couples, Worship, Event"
              suggestions={BADGE_SUGGESTIONS}
              hint="This short label appears at the top-left of the card image. Leave it empty to hide the label."
            />
            <Field label="Button wording" value={form.cta_label ?? ""} onChange={(v) => set("cta_label", v)} disabled={!editable} />
            <Field
              label="Link"
              value={form.cta_href ?? ""}
              onChange={(v) => set("cta_href", v)}
              disabled={!editable}
              placeholder="/ministries or https://…"
              hint="This destination opens when a visitor clicks the card."
            />
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Icon</span>
              <select
                value={form.icon_key ?? ""}
                disabled={!editable}
                onChange={(e) => set("icon_key", e.target.value)}
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm"
              >
                {ICON_CHOICES.map((c) => (
                  <option key={c} value={c}>
                    {c || "No icon"}
                  </option>
                ))}
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
              <span className="mt-1 block text-[11px] text-muted-foreground">External websites should open in a new tab.</span>
            </label>
            <Field label="Display order" type="number" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v) || 0)} disabled={!editable} hint="Use Display Order to change where this item appears." />
            <div className="flex items-end">
              <Toggle label="Show on the website" checked={form.is_visible} onChange={(v) => set("is_visible", v)} disabled={!editable} />
            </div>
          </div>

          <div className="mt-3 space-y-3">
            <TextArea label="Description" rows={2} value={form.body ?? ""} onChange={(v) => set("body", v)} disabled={!editable} />
            <ImageField
              label="Image"
              value={form.image_url ?? ""}
              onChange={(v) => set("image_url", v)}
              disabled={!editable}
              hint="This image appears on this card on the website."
            />
          </div>

          {editable && (
            <SaveRow
              status={draft.status}
              message={draft.message}
              lastSaved={draft.lastSaved}
              restored={draft.restored}
              onSave={save}
              onDiscard={draft.discardDraft}
              label="Save changes"
            />
          )}
        </>
      )}
    </div>
  );
}
