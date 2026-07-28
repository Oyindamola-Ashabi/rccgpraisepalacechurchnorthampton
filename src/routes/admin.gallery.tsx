import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, isStaff, useAdminSession } from "@/lib/admin-auth";
import { AdminHeading, Alert, DeleteButton, Field, ImageField, MediaUploader, SaveButton, TextArea, Toggle, useMediaLibrary } from "@/components/admin/cms-ui";
import type { GalleryAlbum, GalleryImage } from "@/lib/cms";

export const Route = createFileRoute("/admin/gallery")({ ssr: false, component: AdminGalleryPage });

function slugify(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `album-${Date.now()}`;
}

function AdminGalleryPage() {
  const { roles } = useAdminSession();
  const editable = isStaff(roles);
  const canDelete = canManage(roles);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("gallery_albums").select("*").order("sort_order").order("title");
    if (error) setError(error.message);
    else { setError(null); setAlbums((data as any[]) ?? []); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createAlbum(e: React.FormEvent) {
    e.preventDefault();
    if (creating || !title.trim()) return;
    setCreating(true);
    const { error } = await supabase.from("gallery_albums").insert({
      title: title.trim(), slug: slugify(title), sort_order: albums.length,
    } as any);
    setCreating(false);
    if (error) { setError("Could not create album: " + error.message); return; }
    setError(null);
    setTitle("");
    load();
  }

  return (
    <div>
      <AdminHeading title="Gallery" description="Group photos into albums. Only published albums and their images appear on the public gallery page." />
      <Alert error={error} />

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
      ) : (
        <ul className="mt-6 space-y-4">
          {albums.length === 0 && <p className="text-sm text-muted-foreground">No albums yet.</p>}
          {albums.map((a) => (
            <AlbumCard key={a.id} album={a} editable={editable} canDelete={canDelete} onChanged={load} onError={setError} />
          ))}
        </ul>
      )}

      {editable && (
        <form onSubmit={createAlbum} className="mt-8 rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">New album</h2>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1"><Field label="Album title" value={title} onChange={setTitle} required /></div>
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant disabled:opacity-60">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create album
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function AlbumCard({
  album, editable, canDelete, onChanged, onError,
}: { album: GalleryAlbum; editable: boolean; canDelete: boolean; onChanged: () => void; onError: (m: string | null) => void }) {
  const [form, setForm] = useState(album);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [open, setOpen] = useState(false);
  const { upload, uploading, assets, reload } = useMediaLibrary();

  function set<K extends keyof GalleryAlbum>(k: K, v: GalleryAlbum[K]) { setForm((f) => ({ ...f, [k]: v })); setSaved(false); }

  async function loadImages() {
    const { data, error } = await supabase.from("gallery_images").select("*").eq("album_id", album.id).order("sort_order");
    if (error) onError(error.message); else setImages((data as any[]) ?? []);
  }

  useEffect(() => { if (open) loadImages(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  async function save() {
    if (saving) return;
    setSaving(true);
    const { id, ...values } = form as any;
    const { error } = await supabase.from("gallery_albums").update(values).eq("id", album.id);
    setSaving(false);
    if (error) { onError("Could not save album: " + error.message); return; }
    onError(null); setSaved(true);
  }

  async function addUploaded(files: FileList) {
    await upload(files);
    await reload();
  }

  async function attach(url: string) {
    const { error } = await supabase.from("gallery_images").insert({ album_id: album.id, image_url: url, sort_order: images.length } as any);
    if (error) onError(error.message); else { onError(null); loadImages(); }
  }

  return (
    <li className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold">{album.title}</h3>
          <p className="text-xs text-muted-foreground">/{album.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Toggle label="Published" checked={form.is_published} onChange={(v) => set("is_published", v)} disabled={!editable} />
          <button onClick={() => setOpen((o) => !o)} className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/60">
            {open ? "Hide images" : "Manage images"}
          </button>
          {canDelete && (
            <DeleteButton
              confirmText={`Delete the album “${album.title}” and all of its images?`}
              onConfirm={async () => {
                const { error } = await supabase.from("gallery_albums").delete().eq("id", album.id);
                if (error) onError(error.message); else onChanged();
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Title" value={form.title} onChange={(v) => set("title", v)} disabled={!editable} />
        <Field label="Display order" type="number" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v) || 0)} disabled={!editable} />
        <div className="sm:col-span-2"><TextArea label="Description" rows={2} value={form.description ?? ""} onChange={(v) => set("description", v)} disabled={!editable} /></div>
        <div className="sm:col-span-2"><ImageField label="Album cover" value={form.cover_image_url ?? ""} onChange={(v) => set("cover_image_url", v)} disabled={!editable} /></div>
      </div>
      {editable && <div className="mt-4"><SaveButton saving={saving} saved={saved} onClick={save} /></div>}

      {open && (
        <div className="mt-6 border-t pt-5">
          {editable && (
            <>
              <MediaUploader upload={addUploaded} uploading={uploading} />
              <p className="mt-2 text-xs text-muted-foreground">After uploading, click an image below to add it to this album.</p>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {assets.slice(0, 12).map((a) => (
                  <button key={a.id} onClick={() => attach(a.public_url)} className="overflow-hidden rounded-lg ring-1 ring-black/10 hover:ring-[#E13495]">
                    <img src={a.public_url} alt="" className="h-16 w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </>
          )}

          <ul className="mt-5 space-y-3">
            {images.length === 0 && <p className="text-sm text-muted-foreground">No images in this album yet.</p>}
            {images.map((img) => (
              <AlbumImageRow key={img.id} image={img} editable={editable} canDelete={canDelete} onChanged={loadImages} onError={onError} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function AlbumImageRow({
  image, editable, canDelete, onChanged, onError,
}: { image: GalleryImage; editable: boolean; canDelete: boolean; onChanged: () => void; onError: (m: string | null) => void }) {
  const [form, setForm] = useState(image);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (saving) return;
    setSaving(true);
    const { error } = await supabase.from("gallery_images").update({
      caption: form.caption, alt_text: form.alt_text, sort_order: Number(form.sort_order) || 0, image_url: form.image_url,
    }).eq("id", image.id);
    setSaving(false);
    if (error) onError(error.message); else { onError(null); setSaved(true); }
  }

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-xl bg-secondary/30 p-3">
      <img src={form.image_url} alt={form.alt_text ?? ""} className="h-16 w-24 rounded-lg object-cover" loading="lazy" />
      <div className="grid min-w-[220px] flex-1 gap-2 sm:grid-cols-3">
        <Field label="Caption" value={form.caption ?? ""} onChange={(v) => { setForm({ ...form, caption: v }); setSaved(false); }} disabled={!editable} />
        <Field label="Alt text" value={form.alt_text ?? ""} onChange={(v) => { setForm({ ...form, alt_text: v }); setSaved(false); }} disabled={!editable} />
        <Field label="Order" type="number" value={String(form.sort_order)} onChange={(v) => { setForm({ ...form, sort_order: Number(v) || 0 }); setSaved(false); }} disabled={!editable} />
      </div>
      <div className="flex items-center gap-2">
        {editable && <SaveButton saving={saving} saved={saved} onClick={save} label="Save" />}
        {canDelete && (
          <DeleteButton
            confirmText="Remove this image from the album?"
            onConfirm={async () => {
              const { error } = await supabase.from("gallery_images").delete().eq("id", image.id);
              if (error) onError(error.message); else onChanged();
            }}
          />
        )}
      </div>
    </li>
  );
}
