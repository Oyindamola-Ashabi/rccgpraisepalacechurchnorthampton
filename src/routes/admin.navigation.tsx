import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, isStaff, useAdminSession } from "@/lib/admin-auth";
import { AdminHeading, Alert, DeleteButton, Field, SaveButton, Toggle } from "@/components/admin/cms-ui";
import type { NavRecord } from "@/lib/cms";

export const Route = createFileRoute("/admin/navigation")({ ssr: false, component: AdminNavigationPage });

function AdminNavigationPage() {
  const { roles } = useAdminSession();
  const editable = isStaff(roles);
  const canDelete = canManage(roles);
  const [location, setLocation] = useState<"header" | "footer">("header");
  const [rows, setRows] = useState<NavRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("/");
  const [newParent, setNewParent] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("nav_items" as any)
      .select("*")
      .eq("location", location)
      .order("sort_order");
    if (error) setError(error.message);
    else { setError(null); setRows(((data as any[]) ?? []) as NavRecord[]); }
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [location]);

  const byParent = (parent: string | null) => rows.filter((r) => (r.parent_id ?? null) === parent);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setBusy(true);
    const external = /^https?:\/\//i.test(newHref.trim());
    const { error } = await supabase.from("nav_items" as any).insert({
      label: newLabel.trim(),
      href: newHref.trim() || "/",
      link_type: external ? "external" : "internal",
      is_external: external,
      parent_id: newParent || null,
      location,
      sort_order: rows.length,
    } as any);
    setBusy(false);
    if (error) { setError("Could not add menu item: " + error.message); return; }
    setError(null);
    setNewLabel("");
    setNewHref("/");
    load();
  }

  return (
    <div>
      <AdminHeading
        title="Navigation"
        description="Control the menus on the website — labels, order, destinations, dropdowns and nested groups. Leave this empty to keep the built-in menu."
      />
      <Alert error={error} />

      <div className="mt-5 flex gap-2">
        {(["header", "footer"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLocation(l)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider ${
              location === l ? "gradient-brand border-transparent text-white shadow-elegant" : "hover:border-[#E13495] hover:text-[#E13495]"
            }`}
          >
            {l === "header" ? "Header & mobile menu" : "Footer"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">No menu records yet — the website is using its built-in menu.</p>
          )}
          {byParent(null).map((item) => (
            <li key={item.id} className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-black/5">
              <NavRow row={item} editable={editable} canDelete={canDelete} onChanged={load} onError={setError} />
              {byParent(item.id).length > 0 && (
                <ul className="mt-3 space-y-3 border-l pl-4">
                  {byParent(item.id).map((child) => (
                    <li key={child.id}>
                      <NavRow row={child} editable={editable} canDelete={canDelete} onChanged={load} onError={setError} nested />
                      {byParent(child.id).length > 0 && (
                        <ul className="mt-3 space-y-3 border-l pl-4">
                          {byParent(child.id).map((grand) => (
                            <li key={grand.id}>
                              <NavRow row={grand} editable={editable} canDelete={canDelete} onChanged={load} onError={setError} nested />
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {editable && (
        <form onSubmit={addItem} className="mt-8 rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Add a menu item</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Label" value={newLabel} onChange={setNewLabel} required />
            <Field label="Destination" value={newHref} onChange={setNewHref} placeholder="/about or https://…" />
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Inside menu</span>
              <select
                value={newParent}
                onChange={(e) => setNewParent(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm"
              >
                <option value="">Top level</option>
                {rows.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="mt-5 inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add item
          </button>
        </form>
      )}
    </div>
  );
}

function NavRow({
  row, editable, canDelete, onChanged, onError, nested,
}: {
  row: NavRecord;
  editable: boolean;
  canDelete: boolean;
  onChanged: () => void;
  onError: (m: string | null) => void;
  nested?: boolean;
}) {
  const [form, setForm] = useState(row);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof NavRecord>(k: K, v: NavRecord[K]) { setForm((f) => ({ ...f, [k]: v })); setSaved(false); }

  async function save() {
    setSaving(true);
    const external = form.link_type === "none" ? false : /^https?:\/\//i.test(form.href);
    const { id, ...values } = { ...form, is_external: external } as any;
    const { error } = await supabase.from("nav_items" as any).update(values).eq("id", row.id);
    setSaving(false);
    if (error) { onError("Could not save menu item: " + error.message); return; }
    onError(null);
    setSaved(true);
  }

  return (
    <div className={nested ? "rounded-xl bg-secondary/40 p-4" : ""}>
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="Label" value={form.label} onChange={(v) => set("label", v)} disabled={!editable} />
        <Field label="Destination" value={form.href} onChange={(v) => set("href", v)} disabled={!editable} />
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Behaviour</span>
          <select
            value={form.link_type}
            disabled={!editable}
            onChange={(e) => set("link_type", e.target.value as any)}
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm"
          >
            <option value="internal">Page on this website</option>
            <option value="external">External website (new tab)</option>
            <option value="none">Menu group only (not clickable)</option>
          </select>
        </label>
        <Field label="Order" type="number" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v) || 0)} disabled={!editable} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <Toggle label="Visible" checked={form.is_visible} onChange={(v) => set("is_visible", v)} disabled={!editable} />
        {editable && <SaveButton saving={saving} saved={saved} onClick={save} label="Save" />}
        {canDelete && (
          <DeleteButton
            label="Remove"
            confirmText={`Remove “${row.label}” from the menu? Items inside it are removed too.`}
            onConfirm={async () => {
              const { error } = await supabase.from("nav_items" as any).delete().eq("id", row.id);
              if (error) onError(error.message); else onChanged();
            }}
          />
        )}
        {form.link_type === "none" && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronRight className="h-3 w-3" /> group
          </span>
        )}
      </div>
    </div>
  );
}
