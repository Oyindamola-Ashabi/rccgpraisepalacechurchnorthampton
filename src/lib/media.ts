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
