import { useState } from "react";
import { Play } from "lucide-react";

/**
 * A reliable YouTube video player.
 * Shows a poster with a Play button; on click, loads the real YouTube iframe
 * (with autoplay). If `youtubeId` is empty, clicking opens a YouTube search
 * for the given query in a new tab.
 */
export function VideoEmbed({
  youtubeId,
  searchQuery = "PraisePalace Church",
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
