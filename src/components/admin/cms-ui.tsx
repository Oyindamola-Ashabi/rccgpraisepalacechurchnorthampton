import { useEffect, useState } from "react";
import { Loader2, Save, Trash2, ImagePlus, Upload, X, Check } from "lucide-react";
import { deleteMedia, formatBytes, listMedia, uploadMedia, type MediaAsset } from "@/lib/media";

export function Field({
  label, value, onChange, type = "text", disabled, required, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
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
    </label>
  );
}

export function TextArea({
  label, value, onChange, rows = 3, disabled, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  disabled?: boolean;
  placeholder?: string;
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

export function AdminHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

/** Image field with preview, manual URL entry and a media-library picker. */
export function ImageField({
  label = "Image", value, onChange, disabled,
}: { label?: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const [picking, setPicking] = useState(false);
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
          placeholder="Image URL or pick from library"
          onChange={(e) => onChange(e.target.value)}
          className="min-w-[180px] flex-1 rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495] disabled:opacity-70"
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => setPicking(true)}
          className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/60 disabled:opacity-60"
        >
          Library
        </button>
        {value && !disabled && (
          <button type="button" onClick={() => onChange("")} className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/60">
            Clear
          </button>
        )}
      </div>
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
