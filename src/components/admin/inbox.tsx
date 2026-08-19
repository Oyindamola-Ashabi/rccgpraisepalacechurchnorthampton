import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Search, Mail, MailOpen, Loader2, RefreshCw, Save } from "lucide-react";
import { canManage, useAdminSession } from "@/lib/admin-auth";

export type InboxField = {
  key: string;
  label: string;
  format?: (value: any, row: any) => string;
};

export type InboxConfig = {
  table: string;
  title: string;
  description: string;
  titleField: (row: any) => string;
  subtitleField?: (row: any) => string;
  bodyField: string;
  fields: InboxField[];
  statusField: "status" | "review_status";
  statusOptions: string[];
  hideStatusSelect?: boolean;
  extraControls?: (row: any, refresh: () => void) => React.ReactNode;
  panel?: (row: any, refresh: () => void) => React.ReactNode;
  searchFields: string[];
  /** Optional PostgREST select (e.g. to join a related table). Defaults to "*". */
  select?: string;
  /** Extra searchable strings derived from a row (e.g. joined values). */
  searchValues?: (row: any) => (string | null | undefined)[];
  /** Optional secondary dropdown filter (e.g. filter by event). */
  secondaryFilter?: {
    label: string;
    valueOf: (row: any) => string | null | undefined;
  };
};

export function AdminInbox({ config }: { config: InboxConfig }) {
  const { roles } = useAdminSession();
  const editable = canManage(roles);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [secondary, setSecondary] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from(config.table as any)
      .select(config.select ?? "*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else {
      setError(null);
      setRows((data as any[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.table]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r[config.statusField] !== statusFilter) return false;
      if (!q) return true;
      return config.searchFields.some((f) => String(r[f] ?? "").toLowerCase().includes(q));
    });
  }, [rows, query, statusFilter, config]);

  const unread = rows.filter((r) => !r.is_read).length;

  async function patch(id: string, values: Record<string, any>) {
    const { error } = await supabase.from(config.table as any).update(values).eq("id", id);
    if (error) {
      setError(error.message);
      return false;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...values } : r)));
    return true;
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{config.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#E13495]/10 px-3 py-1 text-xs font-semibold text-[#E13495]">
            {unread} unread · {rows.length} total
          </span>
          <button onClick={load} className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/50 inline-flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]"
        >
          <option value="all">All statuses</option>
          {config.statusOptions.map((s) => (
            <option key={s} value={s}>{labelize(s)}</option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
      ) : filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((row) => (
            <InboxRow
              key={row.id}
              row={row}
              config={config}
              editable={editable}
              open={openId === row.id}
              onToggle={async () => {
                const next = openId === row.id ? null : row.id;
                setOpenId(next);
                if (next && !row.is_read && editable) await patch(row.id, { is_read: true });
              }}
              patch={patch}
              refresh={load}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function InboxRow({
  row, config, editable, open, onToggle, patch, refresh,
}: {
  row: any;
  config: InboxConfig;
  editable: boolean;
  open: boolean;
  onToggle: () => void;
  patch: (id: string, values: Record<string, any>) => Promise<boolean>;
  refresh: () => void;
}) {
  const [notes, setNotes] = useState(row.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <li className={cn("rounded-2xl bg-card shadow-card ring-1 ring-black/5", !row.is_read && "ring-2 ring-[#E13495]/40")}>
      <button onClick={onToggle} className="flex w-full items-start gap-3 p-4 text-left">
        <span className="mt-0.5 shrink-0 text-[#E13495]">
          {row.is_read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{config.titleField(row)}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              {labelize(row[config.statusField])}
            </span>
            {row.is_urgent && <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-destructive">Urgent</span>}
          </span>
          {config.subtitleField && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{config.subtitleField(row)}</span>}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</span>
      </button>

      {open && (
        <div className="border-t px-4 py-4 space-y-4">
          <dl className="grid gap-3 sm:grid-cols-2">
            {config.fields.map((f) => (
              <div key={f.key}>
                <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{f.label}</dt>
                <dd className="mt-0.5 text-sm break-words">{f.format ? f.format(row[f.key], row) : String(row[f.key] ?? "—")}</dd>
              </div>
            ))}
          </dl>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Message</div>
            <p className="mt-1 whitespace-pre-wrap rounded-xl bg-secondary/40 p-3 text-sm">{row[config.bodyField] || "—"}</p>
          </div>

          {editable ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {!config.hideStatusSelect && (
                  <>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status</label>
                    <select
                      value={row[config.statusField]}
                      onChange={(e) => patch(row.id, { [config.statusField]: e.target.value })}
                      className="rounded-lg border bg-background px-3 py-1.5 text-sm"
                    >
                      {config.statusOptions.map((s) => (
                        <option key={s} value={s}>{labelize(s)}</option>
                      ))}
                    </select>
                  </>
                )}
                <button
                  onClick={() => patch(row.id, { is_read: !row.is_read })}
                  className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/50"
                >
                  Mark as {row.is_read ? "unread" : "read"}
                </button>
                {config.extraControls?.(row, refresh)}
              </div>

              {config.panel?.(row, refresh)}

              <div>

                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Internal notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
                  className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]"
                />
                <button
                  onClick={async () => { setSaving(true); const ok = await patch(row.id, { admin_notes: notes }); setSaving(false); setSaved(ok); }}
                  className="mt-2 inline-flex items-center gap-2 rounded-full gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-elegant hover:opacity-95"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saved ? "Saved" : "Save notes"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">You have read-only access to this inbox.</p>
          )}
        </div>
      )}
    </li>
  );
}

export function labelize(value: string | null | undefined) {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
