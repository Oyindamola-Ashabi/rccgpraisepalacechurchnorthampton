import { supabase } from "@/integrations/supabase/client";
import { MEDIA_BUCKET } from "@/lib/cms";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB

export type MediaAsset = {
  id: string;
  storage_path: string;
  public_url: string;
  title: string | null;
  alt_text: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export function validateImage(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `${file.name}: only JPEG, PNG, WebP and GIF images are allowed.`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `${file.name}: file is larger than 10 MB.`;
  }
  return null;
}

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(-80);
}

/** Uploads one image to Supabase Storage and records it in the media library. */
export async function uploadMedia(file: File, meta?: { title?: string; alt_text?: string }) {
  const invalid = validateImage(file);
  if (invalid) return { asset: null as MediaAsset | null, error: invalid };

  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const up = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (up.error) return { asset: null, error: up.error.message };

  const publicUrl = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      storage_path: path,
      public_url: publicUrl,
      title: meta?.title?.trim() || file.name,
      alt_text: meta?.alt_text?.trim() || null,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(MEDIA_BUCKET).remove([path]);
    return { asset: null, error: error.message };
  }
  return { asset: data as MediaAsset, error: null as string | null };
}

export async function deleteMedia(asset: MediaAsset) {
  const { error } = await supabase.from("media_assets").delete().eq("id", asset.id);
  if (error) return error.message;
  await supabase.storage.from(MEDIA_BUCKET).remove([asset.storage_path]);
  return null;
}

export async function listMedia() {
  return supabase.from("media_assets").select("*").order("created_at", { ascending: false });
}

export function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/* ---------------------------------------------------------------------------
 * Album videos
 * ------------------------------------------------------------------------- */

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB (Supabase Free plan)

const VIDEO_EXT_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  ogv: "video/ogg",
  mov: "video/quicktime",
};

/** Content type to upload with — falls back to the file extension when the browser reports nothing useful. */
export function videoContentType(file: File): string | null {
  if (ALLOWED_VIDEO_TYPES.includes(file.type)) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return VIDEO_EXT_TYPES[ext] ?? null;
}

/** Uploads one album video into the existing media bucket under albums/{slug}/videos/. */
export async function uploadAlbumVideo(file: File, albumSlug: string) {
  const contentType = videoContentType(file);
  if (!contentType) {
    return { url: null as string | null, error: `${file.name}: only MP4, WebM, OGG or MOV videos are supported.` };
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return { url: null, error: `${file.name}: file is larger than 50 MB.` };
  }
  const path = `albums/${albumSlug || "album"}/videos/${crypto.randomUUID()}-${safeName(file.name)}`;
  const up = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType,
    upsert: false,
  });
  if (up.error) {
    return {
      url: null,
      error:
        `Could not upload the video: ${up.error.message}. ` +
        `If this mentions the file type, the media storage area still needs video types (video/mp4, video/webm, video/ogg, video/quicktime) added to its allowed list.`,
    };
  }
  return { url: supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl, error: null as string | null };
}

/** Uploads one album photograph under albums/{slug}/images/ and records it in the media library. */
export async function uploadAlbumImage(file: File, albumSlug: string) {
  const invalid = validateImage(file);
  if (invalid) return { url: null as string | null, error: invalid };
  const path = `albums/${albumSlug || "album"}/images/${crypto.randomUUID()}-${safeName(file.name)}`;
  const up = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (up.error) return { url: null, error: up.error.message };
  const publicUrl = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  await supabase.from("media_assets").insert({
    storage_path: path,
    public_url: publicUrl,
    title: file.name,
    mime_type: file.type,
    size_bytes: file.size,
  });
  return { url: publicUrl, error: null as string | null };
}
