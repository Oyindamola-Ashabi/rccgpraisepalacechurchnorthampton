import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { Headphones, Play, Pause, Clock } from "lucide-react";
import { useRef, useState } from "react";
import podcastImg from "@/assets/podcast.jpg";

export const Route = createFileRoute("/media/podcast")({
  head: () => ({
    meta: [
      { title: "Praise Talks Podcast — PraisePalace Church" },
      { name: "description", content: "Praise Talks — the official PraisePalace Church podcast. Conversations that stir faith and fuel purpose." },
      { property: "og:title", content: "Praise Talks Podcast — PraisePalace Church" },
      { property: "og:description", content: "Conversations that stir faith and fuel purpose." },
      { property: "og:url", content: "/media/podcast" },
    ],
    links: [{ rel: "canonical", href: "/media/podcast" }],
  }),
  component: PodcastPage,
});

type Episode = {
  num: string;
  title: string;
  desc: string;
  duration: string;
  date: string;
  audio: string;
};

const episodes: Episode[] = [
  { num: "12", title: "It Shall End In Praise", desc: "How to hold on when the road feels long.", duration: "42 min", date: "05 Jul 2026", audio: "https://cdn.pixabay.com/audio/2023/08/03/audio_c1a1e4cba7.mp3" },
  { num: "11", title: "Purpose in Every Season", desc: "Finding meaning in transitions and waiting rooms.", duration: "38 min", date: "28 Jun 2026", audio: "https://cdn.pixabay.com/audio/2022/10/16/audio_5da3c3b39d.mp3" },
  { num: "10", title: "Marriage: The Long Yes", desc: "A conversation with our couples ministry leads.", duration: "51 min", date: "21 Jun 2026", audio: "https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3" },
  { num: "09", title: "Kingdom Entrepreneurship", desc: "Faith at work — insights from our business school.", duration: "47 min", date: "14 Jun 2026", audio: "https://cdn.pixabay.com/audio/2022/08/23/audio_d16737dc28.mp3" },
  { num: "08", title: "The Praying Life", desc: "Practical rhythms for a life fuelled by prayer.", duration: "35 min", date: "07 Jun 2026", audio: "https://cdn.pixabay.com/audio/2023/06/13/audio_e34f2a1f83.mp3" },
  { num: "07", title: "Raising the Next Generation", desc: "Discipling youth in a distracted world.", duration: "44 min", date: "31 May 2026", audio: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" },
];

function EpisodeCard({ ep, playing, onToggle, registerRef }: {
  ep: Episode;
  playing: boolean;
  onToggle: () => void;
  registerRef: (el: HTMLAudioElement | null) => void;
}) {
  return (
    <article className="group rounded-2xl bg-card p-5 shadow-card ring-1 ring-black/5 hover:-translate-y-0.5 transition">
      <div className="flex gap-4">
        <div className="shrink-0 grid h-14 w-14 place-items-center rounded-xl gradient-brand text-white font-display font-bold text-lg shadow-elegant">
          {ep.num}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-lg leading-tight">{ep.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{ep.desc}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {ep.duration}</span>
            <span>{ep.date}</span>
          </div>
        </div>
        <button
          onClick={onToggle}
          aria-label={playing ? `Pause ${ep.title}` : `Play ${ep.title}`}
          className="shrink-0 self-center grid h-11 w-11 place-items-center rounded-full border border-[#E13495]/30 text-[#E13495] hover:gradient-brand hover:text-white transition"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
      </div>
      <audio
        ref={registerRef}
        src={ep.audio}
        controls
        preload="none"
        className="mt-4 w-full"
      >
        <track kind="captions" />
      </audio>
    </article>
  );
}

function PodcastPage() {
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const toggle = (num: string) => {
    const el = audioRefs.current[num];
    if (!el) return;
    if (el.paused) {
      // pause any other playing audio
      Object.entries(audioRefs.current).forEach(([k, a]) => {
        if (k !== num && a && !a.paused) a.pause();
      });
      el.play().then(() => setCurrentlyPlaying(num)).catch(() => {});
    } else {
      el.pause();
      setCurrentlyPlaying(null);
    }
  };

  return (
    <>
      <PageHero eyebrow="Praise Talks" title="The Podcast" subtitle="Honest conversations at the intersection of faith, life and purpose." image={podcastImg} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] items-start">
          <div className="relative overflow-hidden rounded-3xl shadow-elegant lg:sticky lg:top-24">
            <img src={podcastImg} alt="Praise Talks" className="w-full aspect-square object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a0d2a]/90 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <Headphones className="h-8 w-8 text-[#F0DE51]" />
              <h2 className="mt-2 font-display font-bold text-2xl">Praise Talks</h2>
              <p className="text-sm text-white/80">Weekly · Hosted by PraisePalace</p>
            </div>
          </div>

          <div>
            <SectionHeader
              center={false}
              eyebrow="Episodes"
              title={<>Latest <span className="text-gradient-brand">Episodes</span></>}
              subtitle="Press play to listen inline, or subscribe on your favourite platform."
            />
            <div className="flex flex-wrap gap-2 mb-6">
              <BrandButton href="https://open.spotify.com" external variant="primary">Spotify</BrandButton>
              <BrandButton href="https://podcasts.apple.com" external variant="gold">Apple Podcasts</BrandButton>
              <BrandButton href="https://youtube.com" external variant="outline">YouTube</BrandButton>
            </div>
            <div className="space-y-4">
              {episodes.map((ep) => (
                <EpisodeCard
                  key={ep.num}
                  ep={ep}
                  playing={currentlyPlaying === ep.num}
                  onToggle={() => toggle(ep.num)}
                  registerRef={(el) => {
                    audioRefs.current[ep.num] = el;
                    if (el) {
                      el.onended = () => setCurrentlyPlaying((c) => (c === ep.num ? null : c));
                      el.onpause = () => setCurrentlyPlaying((c) => (c === ep.num ? null : c));
                      el.onplay = () => setCurrentlyPlaying(ep.num);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
