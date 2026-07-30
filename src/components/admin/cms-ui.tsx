import { useEffect, useState } from "react";
import { Loader2, Save, Trash2, ImagePlus, Upload, X, Check } from "lucide-react";
import { deleteMedia, formatBytes, listMedia, uploadMedia, type MediaAsset } from "@/lib/media";

export function Field({
  label, value, onChange, type = "text", disabled, required, placeholder, hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495] disabled:opacity-70"
      />
      {hint && <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label, value, onChange, rows = 3, disabled, placeholder, hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  disabled?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <textarea
        rows={rows}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495] disabled:opacity-70"
      />
      {hint && <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Toggle({
  label, checked, onChange, disabled,
}: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function SaveButton({
  saving, saved, onClick, label = "Save changes", disabled, type = "button",
}: {
  saving: boolean;
  saved?: boolean;
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={saving || disabled}
      className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant hover:opacity-95 disabled:opacity-60"
    >
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
      {saving ? "Saving…" : saved ? "Saved" : label}
    </button>
  );
}

export function DeleteButton({
  onConfirm, label = "Delete", confirmText = "This cannot be undone. Delete?", disabled,
}: { onConfirm: () => void | Promise<void>; label?: string; confirmText?: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={async () => {
        if (!window.confirm(confirmText)) return;
        setBusy(true);
        await onConfirm();
        setBusy(false);
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} {label}
    </button>
  );
}

export function Alert({ error, success }: { error?: string | null; success?: string | null }) {
  if (!error && !success) return null;
  return (
    <p
      role="status"
      className={`mt-4 rounded-xl p-3 text-sm ${error ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700"}`}
    >
      {error ?? success}
    </p>
  );
}

export function AdminHeading({
  title, description, breadcrumb,
}: { title: string; description: string; breadcrumb?: string[] }) {
  return (
    <div>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {breadcrumb.map((crumb, i) => (
            <span key={`${crumb}-${i}`}>
              {i > 0 && <span className="mx-1.5 opacity-50">/</span>}
              <span className={i === breadcrumb.length - 1 ? "text-[#E13495]" : ""}>{crumb}</span>
            </span>
          ))}
        </nav>
      )}
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

/** Small coloured status pill, e.g. Visible / Hidden / Published. */
export function StatusBadge({ tone = "neutral", children }: { tone?: "on" | "off" | "neutral" | "warn"; children: React.ReactNode }) {
  const tones = {
    on: "bg-emerald-500/10 text-emerald-700",
    off: "bg-muted text-muted-foreground",
    warn: "bg-amber-500/10 text-amber-700",
    neutral: "bg-[#E13495]/10 text-[#E13495]",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
}

/** Image field with preview, direct upload, manual URL entry and a library picker. */
export function ImageField({
  label = "Image", value, onChange, disabled, hint,
}: { label?: string; value: string; onChange: (v: string) => void; disabled?: boolean; hint?: string }) {
  const [picking, setPicking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    const { asset, error } = await uploadMedia(file);
    setUploading(false);
    if (error || !asset) { setUploadError(error ?? "Upload failed."); return; }
    onChange(asset.public_url);
  }

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        {value ? (
          <img src={value} alt="" className="h-16 w-24 rounded-lg object-cover ring-1 ring-black/10" />
        ) : (
          <div className="grid h-16 w-24 place-items-center rounded-lg bg-secondary text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
          </div>
        )}
        <input
          value={value}
          disabled={disabled}
          placeholder="Image URL, upload a new picture or pick from the library"
          onChange={(e) => onChange(e.target.value)}
          className="min-w-[180px] flex-1 rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495] disabled:opacity-70"
        />
        <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/60 ${disabled || uploading ? "pointer-events-none opacity-60" : ""}`}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Uploading…" : "Upload new"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={disabled || uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
        </label>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setPicking(true)}
          className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/60 disabled:opacity-60"
        >
          Select from library
        </button>
        {value && !disabled && (
          <button type="button" onClick={() => onChange("")} className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/60">
            Clear
          </button>
        )}
      </div>
      {uploadError && <p className="mt-2 text-xs text-destructive">{uploadError}</p>}
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
        {hint ?? "Upload a new picture or pick one from the Media Library, then press Save."}
      </p>
      {picking && <MediaPicker onClose={() => setPicking(false)} onSelect={(a) => { onChange(a.public_url); setPicking(false); }} />}
    </div>
  );
}


export function MediaPicker({ onClose, onSelect }: { onClose: () => void; onSelect: (a: MediaAsset) => void }) {
  const { assets, loading, error, reload, upload, uploading, uploadError } = useMediaLibrary();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-auto rounded-2xl bg-card p-6 shadow-elegant">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Media library</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>

        <MediaUploader upload={upload} uploading={uploading} />
        <Alert error={error ?? uploadError} />

        {loading ? (
          <div className="mt-8 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-[#E13495]" /></div>
        ) : assets.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">No images uploaded yet.</p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {assets.map((a) => (
              <button key={a.id} onClick={() => onSelect(a)} className="group overflow-hidden rounded-xl ring-1 ring-black/10 hover:ring-[#E13495]">
                <img src={a.public_url} alt={a.alt_text ?? ""} className="h-24 w-full object-cover" loading="lazy" />
                <span className="block truncate px-2 py-1 text-[10px] text-muted-foreground">{a.title}</span>
              </button>
            ))}
          </div>
        )}
        <button onClick={reload} className="mt-4 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/60">Refresh</button>
      </div>
    </div>
  );
}

export function MediaUploader({ upload, uploading }: { upload: (files: FileList) => void; uploading: boolean }) {
  return (
    <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm hover:bg-secondary/40">
      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
      <span>{uploading ? "Uploading…" : "Upload images (JPEG, PNG, WebP, GIF — max 10 MB)"}</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        disabled={uploading}
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) upload(e.target.files); e.target.value = ""; }}
      />
    </label>
  );
}

export function useMediaLibrary() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    const { data, error } = await listMedia();
    if (error) setError(error.message);
    else { setError(null); setAssets((data as MediaAsset[]) ?? []); }
    setLoading(false);
  }

  useEffect(() => { reload(); }, []);

  async function upload(files: FileList) {
    setUploading(true);
    setUploadError(null);
    const errors: string[] = [];
    for (const file of Array.from(files)) {
      const { error } = await uploadMedia(file);
      if (error) errors.push(error);
    }
    setUploading(false);
    if (errors.length) setUploadError(errors.join(" "));
    await reload();
  }

  async function remove(asset: MediaAsset) {
    const err = await deleteMedia(asset);
    if (err) setError(err);
    else { setError(null); await reload(); }
  }

  return { assets, loading, error, uploadError, uploading, reload, upload, remove, formatBytes };
}

/* =====================================================================
 * Unsaved-work protection and clear save feedback
 * ===================================================================== */

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

/**
 * Keeps an admin form's values in the browser until they are saved, so moving
 * between pages never loses unfinished work. Every record gets its own key.
 */
export function useDraftForm<T extends Record<string, any>>(draftKey: string, record: T) {
  const [form, setForm] = useState<T>(record);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const storageKey = `ppc-admin-draft:${draftKey}`;

  // Restore any unfinished work for this exact record.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        setForm((f) => ({ ...f, ...saved }));
        setStatus("dirty");
        setRestored(true);
      }
    } catch {
      /* a corrupt draft is simply ignored */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (status !== "dirty") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [status]);

  function set<K extends keyof T>(key: K, value: T[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* storage full or unavailable — editing still works */
      }
      return next;
    });
    setStatus("dirty");
    setMessage(null);
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setRestored(false);
  }

  function discardDraft() {
    clearDraft();
    setForm(record);
    setStatus("idle");
    setMessage(null);
  }

  /** Runs the save, only reporting success once the database confirms it. */
  async function save(run: () => Promise<{ error: { message: string } | null }>) {
    setStatus("saving");
    setMessage(null);
    const { error } = await run();
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return false;
    }
    clearDraft();
    setStatus("saved");
    setLastSaved(new Date().toLocaleTimeString());
    setMessage(null);
    return true;
  }

  return { form, setForm, set, status, message, restored, lastSaved, save, discardDraft, clearDraft };
}

/** The Save button plus its live status wording. */
export function SaveRow({
  status, message, lastSaved, restored, onSave, onDiscard, label = "Save changes", disabled,
}: {
  status: SaveStatus;
  message?: string | null;
  lastSaved?: string | null;
  restored?: boolean;
  onSave: () => void;
  onDiscard?: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <SaveButton
        saving={status === "saving"}
        saved={status === "saved"}
        onClick={onSave}
        label={label}
        disabled={disabled}
      />
      {restored && status === "dirty" && (
        <span className="inline-flex items-center gap-2 text-xs text-amber-700">
          Draft restored
          {onDiscard && (
            <button type="button" onClick={onDiscard} className="underline hover:no-underline">
              Discard draft
            </button>
          )}
        </span>
      )}
      {status === "dirty" && !restored && <StatusBadge tone="warn">Unsaved changes</StatusBadge>}
      {status === "saving" && <span className="text-xs text-muted-foreground">Saving…</span>}
      {status === "saved" && (
        <span className="text-xs text-emerald-700">
          Changes saved successfully{lastSaved ? ` · Last saved ${lastSaved}` : ""}
        </span>
      )}
      {status === "error" && <span className="text-xs text-destructive">Save failed — {message}</span>}
    </div>
  );
}
