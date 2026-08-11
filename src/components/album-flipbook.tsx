import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Images, ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize } from "lucide-react";
import { albumBadge, isFlipAlbum, mediaUrl, safeFlipHtml5Url, useAlbumImages, type GalleryAlbumRow, type GalleryImage } from "@/lib/cms";

/**
 * A polished interactive photo-book viewer with arrows, keyboard support,
 * mobile swipe, zoom in/out/reset, full-screen mode, page counter, captions
 * and optional thumbnail strip — zero third-party branding.
 */
export function AlbumFlipbook({ album, onClose }: { album: GalleryAlbumRow; onClose: () => void }) {
  const { rows: images, loading } = useAlbumImages(album.id);
  const [page, setPage] = useState(0);
  const [turning, setTurning] = useState<"next" | "prev" | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const total = images.length;
  const current: GalleryImage | undefined = images[page];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (fullscreen) setFullscreen(false);
        else onClose();
      }
      if (e.key === "ArrowRight") go("next");
      if (e.key === "ArrowLeft") go("prev");
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(3, z + 0.5));
      if (e.key === "-" || e.key === "_") setZoom((z) => Math.max(1, z - 0.5));
      if (e.key === "0") setZoom(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function go(dir: "next" | "prev", toPage?: number) {
    setZoom(1);
    setPage((p) => {
      const next = typeof toPage === "number" ? toPage : dir === "next" ? p + 1 : p - 1;
      if (next < 0 || next >= total || next === p) return p;
      setTurning(next > p ? "next" : "prev");
      window.setTimeout(() => setTurning(null), 360);
      return next;
    });
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (zoom === 1) setTouchStart(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (diff > 50) go("prev");
    if (diff < -50) go("next");
    setTouchStart(null);
  }

  const badge = albumBadge(album);

  return (
    <div
      className={`fixed inset-0 z-[100] grid place-items-center bg-black/90 p-3 sm:p-6 ${fullscreen ? "!p-0" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${album.title} album`}
    >
      <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
          disabled={zoom <= 1}
          aria-label="Zoom out"
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          disabled={zoom === 1}
          aria-label="Reset zoom"
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-30"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
          disabled={zoom >= 3}
          aria-label="Zoom in"
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-30"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setFullscreen((f) => !f)}
          aria-label="Toggle fullscreen"
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close album"
          className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className={`w-full max-w-5xl flex flex-col items-center ${fullscreen ? "h-full justify-center" : ""}`}>
        <div className="mb-3 text-center text-white px-10">
          {badge && (
            <span className="mb-1 inline-block rounded-full bg-white/15 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#F0DE51]">
              {badge}
            </span>
          )}
          <h3 className="font-display text-lg sm:text-2xl font-bold">{album.title}</h3>
          <div className="text-xs text-white/70">
            {[album.location, album.album_year].filter(Boolean).join(" · ")}
            {total > 0 && ` · Page ${page + 1} of ${total}`}
          </div>
        </div>

        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`relative mx-auto w-full overflow-hidden rounded-2xl bg-neutral-900 shadow-elegant ${
            fullscreen ? "flex-1 max-h-[80vh] aspect-auto" : "aspect-[16/10]"
          }`}
        >
          {loading ? (
            <div className="grid h-full place-items-center text-white/70 text-sm">Loading album…</div>
          ) : total === 0 ? (
            <div className="grid h-full place-items-center gap-2 text-white/70 text-sm">
              <Images className="h-6 w-6" />
              Nothing has been added to this album yet.
            </div>
          ) : (current?.media_type ?? "image") === "video" ? (
            <div className="grid h-full w-full place-items-center">
              <video
                key={current?.id}
                src={albumItemSrc(current!) ?? ""}
                poster={albumItemPoster(current!) ?? undefined}
                controls
                playsInline
                preload="metadata"
                className="max-h-full max-w-full"
              />
            </div>
          ) : (
            <div className="h-full w-full overflow-auto grid place-items-center">
              <img
                key={current?.id}
                src={albumItemSrc(current!) ?? ""}
                alt={current?.alt_text ?? current?.caption ?? album.title}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                }}
                className={`max-h-full max-w-full object-contain transition-transform duration-300 ease-out ${
                  turning === "next"
                    ? "animate-fade-in"
                    : turning === "prev"
                    ? "animate-fade-in"
                    : ""
                }`}
              />
            </div>
          )}


          {total > 1 && (
            <>
              <button
                type="button"
                onClick={() => go("prev")}
                disabled={page === 0}
                aria-label="Previous photograph"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/30 disabled:opacity-25"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => go("next")}
                disabled={page >= total - 1}
                aria-label="Next photograph"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/30 disabled:opacity-25"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {current?.caption && <p className="mt-3 text-center text-sm text-white/90 max-w-2xl px-4">{current.caption}</p>}

        {/* Thumbnail strip */}
        {total > 1 && !fullscreen && (
          <div className="mt-4 flex max-w-full items-center gap-2 overflow-x-auto px-2 py-1">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => go(idx > page ? "next" : "prev", idx)}
                className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg transition ${
                  idx === page ? "ring-2 ring-[#E13495] opacity-100 scale-105" : "opacity-50 hover:opacity-80"
                }`}
              >
                <img src={mediaUrl(img.image_url) ?? ""} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * A FlipHTML5 publication shown inside the website. Only a validated HTTPS
 * FlipHTML5 address is embedded — no HTML is ever stored or injected.
 */
export function FlipHtml5Viewer({ album, onClose }: { album: GalleryAlbumRow; onClose: () => void }) {
  const src = safeFlipHtml5Url(album.fliphtml5_url);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${album.title} album`}
    >
      <div className="flex items-center justify-between gap-3 rounded-xl bg-black/70 px-3 py-2 mb-2 text-white">
        <div className="min-w-0">
          <h3 className="truncate font-display text-base sm:text-xl font-bold">{album.title}</h3>
          <div className="text-xs text-white/70">
            {[album.location, album.album_year].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {src && (
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
            >
              Open in FlipHTML5
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close album"
            className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
          >
            <X className="h-4 w-4" /> Close
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-2xl bg-neutral-900">
        {src ? (
          <iframe
            src={src}
            title={album.title}
            loading="lazy"
            allowFullScreen
            allow="fullscreen"
            className="h-full w-full border-0"
          />
        ) : (
          <div className="grid h-full place-items-center px-6 text-center text-sm text-white/70">
            This album is not available yet.
          </div>
        )}
      </div>
    </div>
  );
}

/** Album covers that open the right viewer, grouped by year when available. */
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
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
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
                  {albumBadge(a) && (
                    <span className="absolute left-3 top-3 rounded-full gradient-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                      {albumBadge(a)}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-display font-bold">{a.title}</div>
                  {(a.album_year || a.location) && (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {[a.album_year, a.location].filter(Boolean).join(" · ")}
                    </div>
                  )}
                  {a.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.description}</p>}
                  <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-widest text-[#E13495]">Open album</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {open &&
        (isFlipAlbum(open) ? (
          <FlipHtml5Viewer album={open} onClose={() => setOpen(null)} />
        ) : (
          <AlbumFlipbook album={open} onClose={() => setOpen(null)} />
        ))}
    </div>
  );
}

