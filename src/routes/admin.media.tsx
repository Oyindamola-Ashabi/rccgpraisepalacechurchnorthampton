import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { canManage, useAdminSession } from "@/lib/admin-auth";
import { AdminHeading, Alert, DeleteButton, MediaUploader, useMediaLibrary } from "@/components/admin/cms-ui";
import { formatBytes } from "@/lib/media";

export const Route = createFileRoute("/admin/media")({ ssr: false, component: AdminMediaPage });

function AdminMediaPage() {
  const { roles } = useAdminSession();
  const canDelete = canManage(roles);
  const { assets, loading, error, uploadError, uploading, upload, remove, reload } = useMediaLibrary();

  return (
    <div>
      <AdminHeading title="Media Library" description="Upload and manage the images used across the website. Files are stored permanently in Supabase Storage." />
      <MediaUploader upload={upload} uploading={uploading} />
      <Alert error={error ?? uploadError} />

      <button onClick={reload} className="mt-4 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/60">Refresh</button>

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
      ) : assets.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">No images uploaded yet.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {assets.map((a) => (
            <li key={a.id} className="rounded-2xl bg-card p-4 shadow-card ring-1 ring-black/5">
              <img src={a.public_url} alt={a.alt_text ?? a.title ?? ""} className="h-40 w-full rounded-xl object-cover" loading="lazy" />
              <div className="mt-3 space-y-1 text-sm">
                <div className="truncate font-semibold">{a.title}</div>
                <div className="text-xs text-muted-foreground">{a.mime_type} · {formatBytes(a.size_bytes)}</div>
                {a.alt_text && <div className="text-xs text-muted-foreground">Alt: {a.alt_text}</div>}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigator.clipboard?.writeText(a.public_url)}
                  className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/60"
                >
                  Copy URL
                </button>
                {canDelete && (
                  <DeleteButton
                    confirmText={`Delete “${a.title}”? Any page still using it will fall back to its built-in image.`}
                    onConfirm={() => remove(a)}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
