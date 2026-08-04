import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Plus, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, isStaff, useAdminSession } from "@/lib/admin-auth";
import { AdminHeading, Alert, DeleteButton, Field, ImageField, SaveButton, TextArea, Toggle } from "@/components/admin/cms-ui";
import { PODCAST_BUCKET, PODCAST_FOLDER, podcastAudioUrl, slugify, type Podcast } from "@/lib/cms";

/** File extensions and MIME types accepted for podcast audio uploads. */
const AUDIO_EXTENSIONS = ["mp3", "mpeg", "m4a", "aac", "wav", "ogg", "oga", "opus", "webm", "flac", "mp4"];
const AUDIO_MIME_TYPES = [
  "audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/m4a", "audio/aac", "audio/x-aac",
  "audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave", "audio/ogg", "application/ogg",
  "audio/webm", "audio/flac", "audio/x-flac", "video/mp4", "application/octet-stream",
];
export const AUDIO_ACCEPT = AUDIO_EXTENSIONS.map((e) => `.${e}`).join(",") + ",audio/*";
const MAX_AUDIO_BYTES = 100 * 1024 * 1024;

/** Returns a friendly message when the file cannot be accepted, otherwise null. */
function validateAudioFile(file: File): string | null {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  const okExt = AUDIO_EXTENSIONS.includes(ext);
  const okType = !type || type.startsWith("audio/") || AUDIO_MIME_TYPES.includes(type);
  if (!okExt && !okType) {
    return "That file does not look like an audio file. Please choose an MP3, M4A, AAC, WAV, OGG, WebM or FLAC file.";
  }
  if (file.size > MAX_AUDIO_BYTES) return "This audio file is larger than the 100 MB upload limit.";
  return null;
}

/** A content type the storage area always accepts, based on the file extension. */
function uploadContentType(file: File): string {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  const byExt: Record<string, string> = {
    mp3: "audio/mpeg", mpeg: "audio/mpeg", m4a: "audio/mp4", mp4: "audio/mp4", aac: "audio/aac",
    wav: "audio/wav", ogg: "audio/ogg", oga: "audio/ogg", opus: "audio/ogg", webm: "audio/webm", flac: "audio/flac",
  };
  return byExt[ext] || (file.type && file.type.startsWith("audio/") ? file.type : "audio/mpeg");
}

function prettySize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Pulls the video id out of any common YouTube URL shape. */
function youtubeId(url?: string | null) {
  if (!url) return "";
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return m?.[1] ?? "";
}


export const Route = createFileRoute("/admin/podcasts")({ ssr: false, component: AdminPodcastsPage });

function AdminPodcastsPage() {
  const { roles } = useAdminSession();
  const editable = isStaff(roles);
  const canDelete = canManage(roles);
  const [rows, setRows] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "" });
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("podcasts" as any)
      .select("*")
      .order("sort_order")
      .order("publication_date", { ascending: false });
    if (error) setError(error.message);
    else { setError(null); setRows((data as any[]) ?? []); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (creating || !draft.title.trim()) return;
    setCreating(true);
    const base = slugify(draft.title);
    const slug = rows.some((r) => r.slug === base) ? `${base}-${Date.now().toString(36)}` : base;
    const { error } = await supabase.from("podcasts" as any).insert({
      title: draft.title.trim(),
      slug,
      sort_order: rows.length,
    } as any);
    setCreating(false);
    if (error) { setError("Could not add episode: " + error.message); return; }
    setError(null); setDraft({ title: "" }); load();
  }

  return (
    <div>
      <AdminHeading title="Podcasts" description="Only published episodes appear on the website. An episode needs an uploaded audio file or an external audio link before it can be published." />
      <Alert error={error} />

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No episodes yet.</p>}
          {rows.map((p) => <PodcastCard key={p.id} episode={p} editable={editable} canDelete={canDelete} onChanged={load} onError={setError} />)}
        </ul>
      )}

      {editable && (
        <form onSubmit={create} className="mt-8 rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
          <h2 className="font-display text-lg font-bold">Add an episode</h2>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1"><Field label="Episode title" value={draft.title} onChange={(v) => setDraft({ title: v })} required /></div>
            <button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant disabled:opacity-60">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add episode
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function PodcastCard({
  episode, editable, canDelete, onChanged, onError,
}: { episode: Podcast; editable: boolean; canDelete: boolean; onChanged: () => void; onError: (m: string | null) => void }) {
  const [form, setForm] = useState({ ...episode });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [techDetail, setTechDetail] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); setSaved(false); }

  async function uploadAudio(file: File) {
    if (uploading) return;
    const check = validateAudioFile(file);
    setTechDetail(null);
    if (check) { setUploadNote(null); onError(check); return; }

    setUploading(true);
    onError(null);
    setUploadNote(null);
    setFileInfo(`${file.name} · ${prettySize(file.size)} · ${file.type || "audio file"}`);

    const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    const path = `${PODCAST_FOLDER}/${episode.slug || episode.id}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage
      .from(PODCAST_BUCKET)
      .upload(path, file, { upsert: true, contentType: uploadContentType(file) });
    if (error) {
      setUploading(false);
      onError("The audio could not be uploaded. Please confirm that the file is a valid audio file and is below 100 MB.");
      setTechDetail(error.message);
      return;
    }

    // Save the audio straight away so the episode is never left pointing at nothing.
    const { error: saveError } = await supabase
      .from("podcasts")
      .update({ audio_file_url: path, playback_type: "upload" } as any)
      .eq("id", episode.id);
    setUploading(false);
    setForm((f) => ({ ...f, audio_file_url: path, playback_type: "upload" } as any));
    if (saveError) {
      onError("The audio uploaded successfully, but the podcast episode could not be saved. Your uploaded file has not been removed.");
      setTechDetail(saveError.message);
      return;
    }
    onError(null);
    setUploadNote("Audio uploaded and saved successfully.");
  }





  async function save() {
    if (saving) return;
    const type = sourceType;
    if (form.is_published) {
      const ok =
        (type === "upload" && form.audio_file_url) ||
        (type === "external" && form.external_audio_url) ||
        (type === "youtube" && (form as any).youtube_url);
      if (!ok) {
        onError("Add the matching audio source for this episode type before publishing it.");
        return;
      }
    }
    setSaving(true);
    const { error } = await supabase.from("podcasts" as any).update({
      title: form.title,
      slug: slugify(form.slug || form.title),
      speaker_or_host: form.speaker_or_host,
      description: form.description,
      publication_date: form.publication_date || null,
      playback_type: type,
      audio_file_url: form.audio_file_url,
      external_audio_url: form.external_audio_url,
      youtube_url: (form as any).youtube_url || null,
      youtube_video_id: youtubeId((form as any).youtube_url) || null,
      cover_image_url: form.cover_image_url,
      duration: form.duration,
      is_featured: form.is_featured,
      is_published: form.is_published,
      sort_order: Number(form.sort_order) || 0,
    }).eq("id", episode.id);
    setSaving(false);
    if (error) onError("Could not save: " + error.message); else { onError(null); setSaved(true); onChanged(); }
  }

  const preview = podcastAudioUrl(form.audio_file_url) ?? form.external_audio_url ?? "";
  const sourceType: "upload" | "external" | "youtube" =
    ((form as any).playback_type as any) ||
    ((form as any).youtube_url ? "youtube" : form.external_audio_url && !form.audio_file_url ? "external" : "upload");

  return (
    <li className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{episode.title}</h3>
        <div className="flex items-center gap-3">
          <Toggle label="Published" checked={form.is_published} onChange={(v) => set("is_published", v)} disabled={!editable} />
          <Toggle label="Featured" checked={form.is_featured} onChange={(v) => set("is_featured", v)} disabled={!editable} />
          {canDelete && (
            <DeleteButton
              confirmText={`Delete the episode “${episode.title}”?`}
              onConfirm={async () => {
                const { error } = await supabase.from("podcasts" as any).delete().eq("id", episode.id);
                if (error) onError(error.message); else onChanged();
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-secondary/40 p-4">
        <label className="block max-w-md">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Episode source</span>
          <select
            value={sourceType}
            disabled={!editable}
            onChange={(e) => set("playback_type" as any, e.target.value as any)}
            className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-sm"
          >
            <option value="upload">Upload audio file</option>
            <option value="external">External audio or podcast link</option>
            <option value="youtube">YouTube video</option>
          </select>
          <span className="mt-1 block text-[11px] text-muted-foreground">
            Choose how this episode plays on the website. Only the matching fields are shown below.
          </span>
        </label>

        {sourceType === "upload" && (
          <div className="mt-4">
            {editable && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept={AUDIO_ACCEPT}
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAudio(f); e.target.value = ""; }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-full border bg-background px-5 py-2 text-sm font-semibold hover:bg-secondary/60 disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading…" : form.audio_file_url ? "Replace audio file" : "Upload audio file"}
                </button>
                {form.audio_file_url && !uploading && (
                  <button
                    type="button"
                    onClick={() => { set("audio_file_url", ""); setUploadNote(null); setFileInfo(null); }}
                    className="ml-2 rounded-full border px-4 py-2 text-sm font-semibold hover:bg-secondary/60"
                  >
                    Remove audio
                  </button>
                )}
              </>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              MP3, M4A, AAC, WAV, OGG, WebM or FLAC — up to 100 MB. Files are stored in the media library under “podcasts”.
            </p>
            {fileInfo && <p className="mt-1 text-[11px] text-muted-foreground">{fileInfo}</p>}
            {uploadNote && <p className="mt-1 text-xs font-semibold text-emerald-600">{uploadNote}</p>}
            {techDetail && (
              <details className="mt-1 text-[11px] text-muted-foreground">
                <summary className="cursor-pointer">Technical details</summary>
                <span>{techDetail}</span>
              </details>
            )}
            <div className="mt-3">
              <Field label="Uploaded audio file" value={form.audio_file_url ?? ""} onChange={(v) => set("audio_file_url", v)} disabled={!editable} hint="Filled in automatically when you upload a file." />
            </div>
          </div>
        )}

        {sourceType === "external" && (
          <div className="mt-4">
            <Field
              label="External audio or podcast link"
              value={form.external_audio_url ?? ""}
              onChange={(v) => set("external_audio_url", v)}
              disabled={!editable}
              placeholder="https://open.spotify.com/episode/…"
              hint="Paste the Spotify, Apple Podcasts, RSS or direct audio link for this episode."
            />
          </div>
        )}

        {sourceType === "youtube" && (
          <div className="mt-4">
            <Field
              label="YouTube link"
              value={(form as any).youtube_url ?? ""}
              onChange={(v) => set("youtube_url" as any, v as any)}
              disabled={!editable}
              placeholder="https://youtu.be/…"
              hint="The episode will play in a YouTube video player on the website."
            />
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Title" value={form.title} onChange={(v) => set("title", v)} disabled={!editable} />
        <Field label="Web address (slug)" value={form.slug} onChange={(v) => set("slug", v)} disabled={!editable} />
        <Field label="Host / speaker" value={form.speaker_or_host ?? ""} onChange={(v) => set("speaker_or_host", v)} disabled={!editable} />
        <Field label="Publication date" type="date" value={form.publication_date ?? ""} onChange={(v) => set("publication_date", v)} disabled={!editable} />
        <Field label="Duration (e.g. 32 min)" value={form.duration ?? ""} onChange={(v) => set("duration", v)} disabled={!editable} />
        <Field label="Display order" type="number" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v) || 0)} disabled={!editable} />
      </div>

      {sourceType !== "youtube" && preview && <audio controls preload="none" src={preview} className="mt-4 w-full" />}


      <div className="mt-4 space-y-4">
        <TextArea label="Description" rows={4} value={form.description ?? ""} onChange={(v) => set("description", v)} disabled={!editable} />
        <ImageField label="Cover image" value={form.cover_image_url ?? ""} onChange={(v) => set("cover_image_url", v)} disabled={!editable} />
      </div>
      {editable && <div className="mt-4"><SaveButton saving={saving} saved={saved} onClick={save} /></div>}
    </li>
  );
}
