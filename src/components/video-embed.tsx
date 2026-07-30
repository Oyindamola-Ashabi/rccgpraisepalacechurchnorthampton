import { useState } from "react";
import { Play, ExternalLink, AlertTriangle } from "lucide-react";

/**
 * A reliable YouTube video player.
 * Shows a poster with a Play button; on click, loads the real YouTube iframe
 * (with autoplay). If `youtubeId` is empty, clicking opens a YouTube search
 * for the given query in a new tab.
 */
export function VideoEmbed({
  youtubeId,
  searchQuery = "RCCG Praise Palace Northampton",
  poster,
  title = "Video",
}: {
  youtubeId?: string;
  searchQuery?: string;
  poster: string;
  title?: string;
}) {
  const [active, setActive] = useState(false);

  if (active && youtubeId) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-elegant">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const handleClick = () => {
    if (youtubeId) {
      setActive(true);
    } else {
      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl shadow-elegant ring-1 ring-black/5"
      aria-label={`Play ${title}`}
    >
      <img src={poster} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition grid place-items-center">
        <div className="grid h-16 w-16 md:h-20 md:w-20 place-items-center rounded-full gradient-brand text-white shadow-elegant group-hover:scale-110 transition">
          <Play className="h-7 w-7 md:h-9 md:w-9 ml-1" fill="currentColor" />
        </div>
      </div>
      <span className="absolute bottom-4 left-4 text-white/90 text-sm font-semibold drop-shadow">{title}</span>
    </button>
  );
}

/**
 * Sermon player driven entirely by a sermon record.
 *
 * - Plays inside the website (responsive 16:9, fullscreen enabled) when the
 *   owner allows embedding.
 * - Some owners disable playback on other websites — YouTube then shows that
 *   message inside its own player, so we always keep a working
 *   “Watch on YouTube” button and an explanation directly beneath the video.
 *   Nothing is hidden, deleted or redirected automatically.
 */
export function YouTubePlayer({
  videoId,
  youtubeUrl,
  poster,
  title,
}: {
  videoId: string | null;
  youtubeUrl?: string | null;
  poster: string;
  title: string;
}) {
  const [active, setActive] = useState(false);
  const watchUrl = youtubeUrl || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : null);

  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-2xl bg-black shadow-elegant" style={{ aspectRatio: "16 / 9" }}>
        {active && videoId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => (videoId ? setActive(true) : watchUrl && window.open(watchUrl, "_blank", "noopener,noreferrer"))}
            className="group absolute inset-0 h-full w-full"
            aria-label={`Play ${title}`}
          >
            <img src={poster} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 grid place-items-center bg-black/40 transition group-hover:bg-black/50">
              <span className="grid h-16 w-16 place-items-center rounded-full gradient-brand text-white shadow-elegant transition group-hover:scale-110 md:h-20 md:w-20">
                <Play className="ml-1 h-7 w-7 md:h-9 md:w-9" fill="currentColor" />
              </span>
            </span>
          </button>
        )}
      </div>

      {watchUrl && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-secondary/60 px-4 py-3 text-xs text-muted-foreground">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#E13495]" />
          <span className="min-w-[200px] flex-1">
            Some videos show “Playback on other websites has been disabled by the video owner”. That is a YouTube
            restriction we cannot change — use the button to watch the full message on YouTube.
          </span>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full gradient-brand px-4 py-2 text-xs font-semibold text-white shadow-elegant"
          >
            Watch on YouTube <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
