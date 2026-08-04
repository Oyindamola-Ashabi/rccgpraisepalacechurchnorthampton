import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Pause, Clock, ExternalLink, Headphones, Youtube } from "lucide-react";
import { episodeSource, mediaUrl, platformName, youTubePoster, type Podcast } from "@/lib/cms";
import { YouTubePlayer } from "@/components/video-embed";

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * One episode row. Audio episodes get an in-page player and “Listen” wording;
 * only YouTube episodes use a video player and “Watch” wording.
 */
export function EpisodeRow({
  episode,
  index,
  coverFallback,
  playingId,
  setPlayingId,
  register,
}: {
  episode: Podcast;
  index: number;
  coverFallback: string;
  playingId: string | null;
  setPlayingId: (id: string | null) => void;
  register: (id: string, el: HTMLAudioElement | null) => void;
}) {
  const source = episodeSource(episode as any);
  const isVideo = source.kind === "youtube";
  const cover =
    mediaUrl(episode.cover_image_url) ||
    (isVideo ? youTubePoster(source.videoId) ?? coverFallback : coverFallback);
  const playing = playingId === episode.id;

  return (
    <article className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-black/5 transition hover:-translate-y-0.5">
      <div className="flex gap-4">
        <img src={cover} alt={episode.title} className="hidden h-20 w-20 shrink-0 rounded-xl object-cover sm:block" loading="lazy" />
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl gradient-brand font-display text-lg font-bold text-white shadow-elegant sm:hidden">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="min-w-0 flex-1">
          <Link to="/podcasts/$slug" params={{ slug: episode.slug }} className="font-display text-lg font-bold leading-tight hover:text-[#E13495]">
            {episode.title}
          </Link>
          {episode.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{episode.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {episode.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {episode.duration}
              </span>
            )}
            {episode.publication_date && <span>{formatDate(episode.publication_date)}</span>}
            {episode.speaker_or_host && <span>{episode.speaker_or_host}</span>}
          </div>
        </div>

        {source.kind === "audio" && (
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById(`audio-${episode.id}`) as HTMLAudioElement | null;
              if (!el) return;
              if (el.paused) {
                document.querySelectorAll("audio").forEach((a) => {
                  if (a !== el) (a as HTMLAudioElement).pause();
                });
                el.play().catch(() => {});
              } else {
                el.pause();
              }
            }}
            aria-label={playing ? `Pause ${episode.title}` : `Listen to ${episode.title}`}
            className="grid h-11 w-11 shrink-0 self-center place-items-center rounded-full border border-[#E13495]/30 text-[#E13495] transition hover:gradient-brand hover:text-white"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
          </button>
        )}
      </div>

      {source.kind === "audio" ? (
        <audio
          id={`audio-${episode.id}`}
          ref={(el) => register(episode.id, el)}
          src={source.src}
          controls
          preload="none"
          className="mt-4 w-full"
          aria-label={`Listen to ${episode.title}`}
          onPlay={() => setPlayingId(episode.id)}
          onPause={() => setPlayingId(playingId === episode.id ? null : playingId)}
          onEnded={() => setPlayingId(null)}
        >
          <track kind="captions" />
        </audio>
      ) : source.kind === "youtube" ? (
        <div className="mt-4">
          <YouTubePlayer videoId={source.videoId} youtubeUrl={source.url} poster={cover} title={episode.title} />
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch ${episode.title} on YouTube`}
            className="mt-3 inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-xs font-semibold text-white shadow-elegant"
          >
            <Youtube className="h-3.5 w-3.5" /> Watch on YouTube
          </a>
        </div>
      ) : source.kind === "external" ? (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Listen to ${episode.title}`}
          className="mt-4 inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-xs font-semibold text-white shadow-elegant"
        >
          Listen on {platformName(source.url)} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">Audio for this episode is coming soon.</p>
      )}
    </article>
  );
}

/** The shared episode list used everywhere podcasts appear on the website. */
export function EpisodeList({
  episodes,
  loading,
  coverFallback,
}: {
  episodes: Podcast[];
  loading: boolean;
  coverFallback: string;
}) {
  const refs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (loading) return <p className="text-sm text-muted-foreground">Loading episodes…</p>;

  if (episodes.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-10 text-center shadow-card ring-1 ring-black/5">
        <Headphones className="mx-auto h-10 w-10 text-[#E13495]" />
        <h3 className="mt-4 font-display text-xl font-bold">Episodes are on the way</h3>
        <p className="mt-2 text-sm text-muted-foreground">New episodes appear here as soon as they are published.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {episodes.map((ep, i) => (
        <EpisodeRow
          key={ep.id}
          episode={ep}
          index={i}
          coverFallback={coverFallback}
          playingId={playingId}
          setPlayingId={setPlayingId}
          register={(id, el) => {
            refs.current[id] = el;
          }}
        />
      ))}
    </div>
  );
}
