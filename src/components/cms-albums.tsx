import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section, SectionHeader } from "@/components/section-ui";
import type { GalleryAlbum, GalleryImage } from "@/lib/cms";

type AlbumWithImages = GalleryAlbum & { images: GalleryImage[] };

/** Published gallery albums managed from the admin area. Renders nothing when empty. */
export function CmsAlbums() {
  const [albums, setAlbums] = useState<AlbumWithImages[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: albumRows } = await supabase
        .from("gallery_albums")
        .select("*")
        .eq("is_published", true)
        .order("sort_order");
      if (!albumRows?.length) return;
      const { data: imageRows } = await supabase
        .from("gallery_images")
        .select("*")
        .in("album_id", albumRows.map((a: any) => a.id))
        .order("sort_order");
      if (!active) return;
      setAlbums(
        (albumRows as any[]).map((a) => ({
          ...(a as GalleryAlbum),
          images: ((imageRows as any[]) ?? []).filter((i) => i.album_id === a.id),
        })),
      );
    })();
    return () => {
      active = false;
    };
  }, []);

  if (albums.length === 0) return null;

  return (
    <section className="bg-secondary/30 border-y">
      <Section>
        <SectionHeader eyebrow="Albums" title="Photo Albums" subtitle="Collections from our recent services, retreats and celebrations." />
        <div className="space-y-14">
          {albums.map((album) => (
            <div key={album.id}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl font-bold">{album.title}</h3>
                  {album.description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{album.description}</p>}
                </div>
                <span className="text-xs text-muted-foreground">{album.images.length} photo{album.images.length === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(album.images.length ? album.images : album.cover_image_url ? [{ id: album.id, image_url: album.cover_image_url, caption: null, alt_text: album.title } as any] : []).map((img) => (
                  <figure key={img.id} className="overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5">
                    <img
                      src={img.image_url}
                      alt={img.alt_text ?? img.caption ?? album.title}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                    {img.caption && <figcaption className="px-4 py-3 text-xs text-muted-foreground">{img.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </section>
  );
}
