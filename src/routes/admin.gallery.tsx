import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, isStaff, useAdminSession } from "@/lib/admin-auth";
import { AdminHeading, Alert, DeleteButton, Field, ImageField, MediaUploader, SaveButton, TextArea, Toggle, useMediaLibrary } from "@/components/admin/cms-ui";
import { BADGE_SUGGESTIONS, safeFlipHtml5Url, type GalleryAlbum, type GalleryAlbumRow, type GalleryImage } from "@/lib/cms";
import { uploadAlbumImage, uploadAlbumVideo } from "@/lib/media";
import { FlipHtml5Viewer } from "@/components/album-flipbook";

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
      <AdminHeading title="Albums" description="Group photographs and videos into albums. Published albums appear on the public Events → Albums page." />
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
  const [preview, setPreview] = useState(false);
  const { upload, uploading, assets, reload } = useMediaLibrary();
  const source = ((form as any).album_source ?? "website") as "website" | "fliphtml5";
  const flipUrl = safeFlipHtml5Url((form as any).fliphtml5_url);
  const flipInvalid = source === "fliphtml5" && Boolean(((form as any).fliphtml5_url ?? "").trim()) && !flipUrl;

  function set<K extends keyof GalleryAlbum>(k: K, v: GalleryAlbum[K]) { setForm((f) => ({ ...f, [k]: v })); setSaved(false); }

  async function loadImages() {
    const { data, error } = await supabase.from("gallery_images").select("*").eq("album_id", album.id).order("sort_order");
    if (error) onError(error.message); else setImages((data as any[]) ?? []);
  }

  useEffect(() => { if (open) loadImages(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);

  async function save() {
    if (saving) return;
    if (source === "fliphtml5" && !flipUrl) {
      onError("Enter a valid FlipHTML5 album address, e.g. https://online.fliphtml5.com/your-account/abcd/");
      return;
    }
    setSaving(true);
    const { id, ...values } = form as any;
    const { error } = await supabase.from("gallery_albums").update(values).eq("id", album.id);
    setSaving(false);
    if (error) { onError("Could not save album: " + error.message); return; }
    onError(null); setSaved(true);
  }

  const [busy, setBusy] = useState<string | null>(null);

  /** Uploads photographs straight into this album. */
  async function addPhotos(files: FileList) {
    setBusy("Uploading photographs…");
    let order = images.length;
    for (const file of Array.from(files)) {
      const { url, error } = await uploadAlbumImage(file, album.slug);
      if (error || !url) { onError(error); continue; }
      const ins = await supabase.from("gallery_images").insert({
        album_id: album.id, image_url: url, media_type: "image", sort_order: order++, is_visible: true,
      } as any);
      if (ins.error) onError(ins.error.message);
    }
    setBusy(null);
    await reload();
    await loadImages();
  }

  /** Uploads a video straight into this album. */
  async function addVideos(files: FileList) {
    setBusy("Uploading video…");
    let order = images.length;
    for (const file of Array.from(files)) {
      const { url, error } = await uploadAlbumVideo(file, album.slug);
      if (error || !url) { onError(error); continue; }
      const ins = await supabase.from("gallery_images").insert({
        album_id: album.id, media_type: "video", video_url: url, caption: file.name, sort_order: order++, is_visible: true,
      } as any);
      if (ins.error) onError(ins.error.message);
    }
    setBusy(null);
    await loadImages();
  }

  async function attach(url: string) {
    const { error } = await supabase.from("gallery_images").insert({
      album_id: album.id,
      image_url: url,
      sort_order: images.length,
      is_visible: true,
    } as any);
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
          {source === "website" && (
            <button onClick={() => setOpen((o) => !o)} className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/60">
              {open ? "Hide contents" : "Manage photos & videos"}
            </button>
          )}
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
        <Field label="Category (e.g. Couples Retreat, Main Gallery)" value={(form as any).category ?? ""} onChange={(v) => set("category" as any, v as any)} disabled={!editable} />
        <Field
          label="Album badge"
          value={(form as any).badge_label ?? ""}
          onChange={(v) => set("badge_label" as any, v as any)}
          disabled={!editable}
          suggestions={BADGE_SUGGESTIONS}
          hint="A short label shown on the album cover, e.g. Couples Retreat 2024."
        />
        <Field label="Linked event slug (optional)" value={(form as any).event_slug ?? ""} onChange={(v) => set("event_slug" as any, v as any)} disabled={!editable} placeholder="couples-retreat" />
        <Field label="Location" value={(form as any).location ?? ""} onChange={(v) => set("location" as any, v as any)} disabled={!editable} />
        <Field label="Year" type="number" value={String((form as any).album_year ?? "")} onChange={(v) => set("album_year" as any, (v ? Number(v) : null) as any)} disabled={!editable} />
        <Field label="Album date" type="date" value={(form as any).album_date ?? ""} onChange={(v) => set("album_date" as any, (v || null) as any)} disabled={!editable} />
        <div className="sm:col-span-2">
          <Toggle
            label="Also show this album in the main Gallery page"
            checked={Boolean((form as any).show_in_main_gallery)}
            onChange={(v) => set("show_in_main_gallery" as any, v as any)}
            disabled={!editable}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Couples Retreat albums stay on the Couples Retreat page unless you switch this on.
          </p>
        </div>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Album source</span>
          <select
            value={source}
            disabled={!editable}
            onChange={(e) => set("album_source" as any, e.target.value as any)}
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm"
          >
            <option value="website">Website album (photographs uploaded here)</option>
            <option value="fliphtml5">FlipHTML5 album (flip-book hosted in FlipHTML5)</option>
          </select>
        </label>
        {source === "fliphtml5" && (
          <Field
            label="FlipHTML5 album address"
            value={(form as any).fliphtml5_url ?? ""}
            onChange={(v) => set("fliphtml5_url" as any, (v || null) as any)}
            disabled={!editable}
            placeholder="https://online.fliphtml5.com/your-account/abcd/"
            hint="Paste the album link only — not embed code."
          />
        )}
        {source === "fliphtml5" && (
          <div className="sm:col-span-2 rounded-xl bg-secondary/40 p-4 text-xs text-muted-foreground">
            The photographs inside a FlipHTML5 album are managed in your FlipHTML5 account. This page controls how the album appears on the Praise Palace website.
            {flipInvalid && (
              <span className="mt-2 block font-semibold text-red-600">
                That address is not a valid HTTPS FlipHTML5 album link.
              </span>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {flipUrl && (
                <>
                  <a href={flipUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border px-3 py-1.5 font-semibold hover:bg-background">
                    Open in FlipHTML5
                  </a>
                  <button type="button" onClick={() => setPreview(true)} className="rounded-full border px-3 py-1.5 font-semibold hover:bg-background">
                    Preview Album
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        <div className="sm:col-span-2"><TextArea label="Description" rows={2} value={form.description ?? ""} onChange={(v) => set("description", v)} disabled={!editable} /></div>
        <div className="sm:col-span-2"><ImageField label="Album cover" value={form.cover_image_url ?? ""} onChange={(v) => set("cover_image_url", v)} disabled={!editable} /></div>
      </div>
      {editable && <div className="mt-4"><SaveButton saving={saving} saved={saved} onClick={save} /></div>}

      {preview && flipUrl && (
        <FlipHtml5Viewer album={{ ...(form as any), fliphtml5_url: flipUrl } as GalleryAlbumRow} onClose={() => setPreview(false)} />
      )}

      {open && source === "website" && (
        <div className="mt-6 border-t pt-5">
          {editable && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block rounded-xl border border-dashed p-4 text-center text-sm hover:bg-secondary/40 cursor-pointer">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && addPhotos(e.target.files)} />
                  <span className="font-semibold">Upload photographs</span>
                  <span className="mt-1 block text-xs text-muted-foreground">JPG, PNG, WebP or GIF — you can choose several at once.</span>
                </label>
                <label className="block rounded-xl border border-dashed p-4 text-center text-sm hover:bg-secondary/40 cursor-pointer">
                  <input type="file" accept="video/*" multiple className="hidden" onChange={(e) => e.target.files && addVideos(e.target.files)} />
                  <span className="font-semibold">Upload videos</span>
                  <span className="mt-1 block text-xs text-muted-foreground">MP4, WebM, OGG or MOV — up to 50 MB each.</span>
                </label>
              </div>
              {busy && <p className="mt-3 text-xs font-semibold text-[#E13495]">{busy}</p>}
              <p className="mt-3 text-xs text-muted-foreground">Or add a picture you have already uploaded to the media library:</p>
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
            {images.length === 0 && <p className="text-sm text-muted-foreground">Nothing in this album yet.</p>}
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
  const isVideo = ((image as any).media_type ?? "image") === "video";

  async function save() {
    if (saving) return;
    setSaving(true);
    const { error } = await supabase.from("gallery_images").update({
      caption: form.caption,
      alt_text: form.alt_text,
      sort_order: Number(form.sort_order) || 0,
      image_url: form.image_url,
      video_thumbnail_url: (form as any).video_thumbnail_url ?? null,
      is_visible: Boolean((form as any).is_visible ?? true),
    } as any).eq("id", image.id);
    setSaving(false);
    if (error) onError(error.message); else { onError(null); setSaved(true); }
  }

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-xl bg-secondary/30 p-3">
      {isVideo ? (
        <video
          src={(form as any).video_url ?? ""}
          poster={(form as any).video_thumbnail_url ?? undefined}
          className="h-16 w-24 rounded-lg bg-black object-cover"
          controls
          preload="metadata"
        />
      ) : (
        <img src={form.image_url ?? ""} alt={form.alt_text ?? ""} className="h-16 w-24 rounded-lg object-cover" loading="lazy" />
      )}
      <div className="grid min-w-[220px] flex-1 gap-2 sm:grid-cols-4">
        <Field label={isVideo ? "Video title" : "Caption"} value={form.caption ?? ""} onChange={(v) => { setForm({ ...form, caption: v }); setSaved(false); }} disabled={!editable} />
        <Field label="Alt text" value={form.alt_text ?? ""} onChange={(v) => { setForm({ ...form, alt_text: v }); setSaved(false); }} disabled={!editable} />
        <Field label="Order" type="number" value={String(form.sort_order)} onChange={(v) => { setForm({ ...form, sort_order: Number(v) || 0 }); setSaved(false); }} disabled={!editable} />
        <div className="flex items-end pb-1">
          <Toggle
            label="Visible in album"
            checked={Boolean((form as any).is_visible ?? true)}
            onChange={(v) => { setForm({ ...form, is_visible: v } as any); setSaved(false); }}
            disabled={!editable}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {editable && <SaveButton saving={saving} saved={saved} onClick={save} label="Save" />}
        {canDelete && (
          <DeleteButton
            confirmText="Remove this item from the album?"
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
