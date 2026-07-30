import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Images } from "lucide-react";
import { useAlbumImages, mediaUrl, type GalleryAlbumRow, type GalleryImage } from "@/lib/cms";

/**
 * A flipbook-style album viewer: photos are shown as book pages that turn,
 * with arrows, keyboard support and a full-screen overlay.
 */
export function AlbumFlipbook({ album, onClose }: { album: GalleryAlbumRow; onClose: () => void }) {
  const { rows: images, loading } = useAlbumImages(album.id);
  const [page, setPage] = useState(0);
  const [turning, setTurning] = useState<"next" | "prev" | null>(null);

  const total = images.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go("next");
      if (e.key === "ArrowLeft") go("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function go(dir: "next" | "prev") {
    setPage((p) => {
      const next = dir === "next" ? p + 1 : p - 1;
      if (next < 0 || next >= total) return p;
      setTurning(dir);
      window.setTimeout(() => setTurning(null), 420);
      return next;
    });
  }

  const current: GalleryImage | undefined = images[page];

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label={`${album.title} album`}>
      <button
        onClick={onClose}
        aria-label="Close album"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="w-full max-w-4xl">
        <div className="mb-3 text-center text-white">
          <div className="font-display text-xl font-bold">{album.title}</div>
          <div className="text-xs text-white/70">
            {[album.location, album.album_year].filter(Boolean).join(" · ")}
            {total > 0 && ` · Page ${page + 1} of ${total}`}
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-elegant [perspective:1600px]">
          {loading ? (
            <div className="grid h-full place-items-center text-white/70 text-sm">Loading photos…</div>
          ) : total === 0 ? (
            <div className="grid h-full place-items-center gap-2 text-white/70 text-sm">
              <Images className="h-6 w-6" />
              No photos in this album yet.
            </div>
          ) : (
            <img
              key={current?.id}
              src={mediaUrl(current?.image_url) ?? ""}
              alt={current?.alt_text ?? current?.caption ?? album.title}
              className={`h-full w-full object-contain transition-transform duration-[420ms] ease-out ${
                turning === "next" ? "[transform:rotateY(-12deg)]" : turning === "prev" ? "[transform:rotateY(12deg)]" : ""
              }`}
              style={{ transformOrigin: turning === "next" ? "left center" : "right center" }}
            />
          )}

          {total > 1 && (
            <>
              <button
                onClick={() => go("prev")}
                disabled={page === 0}
                aria-label="Previous page"
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/30 disabled:opacity-30"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => go("next")}
                disabled={page >= total - 1}
                aria-label="Next page"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/30 disabled:opacity-30"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {current?.caption && <p className="mt-3 text-center text-sm text-white/80">{current.caption}</p>}
      </div>
    </div>
  );
}

/** Album covers that open the flipbook viewer, grouped by year when available. */
export function AlbumGrid({ albums }: { albums: GalleryAlbumRow[] }) {
  const [open, setOpen] = useState<GalleryAlbumRow | null>(null);

  if (albums.length === 0) return null;

  const groups = new Map<string, GalleryAlbumRow[]>();
  albums.forEach((a) => {
    const label = [a.location, a.album_year].filter(Boolean).join(" · ") || "Albums";
    groups.set(label, [...(groups.get(label) ?? []), a]);
  });

  return (
    <div className="space-y-10">
      {[...groups.entries()].map(([label, list]) => (
        <div key={label}>
          <h3 className="mb-4 font-display text-lg font-bold">{label}</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <button
                key={a.id}
                onClick={() => setOpen(a)}
                className="group overflow-hidden rounded-2xl bg-card text-left shadow-card ring-1 ring-black/5 transition hover:shadow-elegant"
              >
                <div className="aspect-[4/3] overflow-hidden bg-secondary">
                  {a.cover_image_url ? (
                    <img
                      src={mediaUrl(a.cover_image_url) ?? ""}
                      alt={a.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground"><Images className="h-6 w-6" /></div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-display font-bold">{a.title}</div>
                  {a.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>}
                  <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-widest text-[#E13495]">Open album</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {open && <AlbumFlipbook album={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
