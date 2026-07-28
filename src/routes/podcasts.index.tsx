import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { Headphones, Play } from "lucide-react";
import { eventPhotos } from "@/lib/gallery-images";
import { mediaUrl, podcastAudioUrl, usePublishedPodcasts } from "@/lib/cms";

export const Route = createFileRoute("/podcasts/")({
  head: () => ({
    meta: [
      { title: "Podcasts — RCCG Praise Palace Northampton" },
      { name: "description", content: "Listen to podcast episodes from RCCG Praise Palace Northampton — teaching, testimonies and encouragement." },
      { property: "og:title", content: "Podcasts — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Faith-building audio episodes you can play anywhere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/podcasts" },
      { property: "og:image", content: eventPhotos.modernWorship.url },
    ],
    links: [{ rel: "canonical", href: "/podcasts" }],
  }),
  component: PodcastsPage,
});

function PodcastsPage() {
  const { rows, loading } = usePublishedPodcasts();

  return (
    <>
      <PageHero eyebrow="Listen Anywhere" title="Podcasts" subtitle="Teaching, testimonies and encouragement — episode by episode." image={eventPhotos.modernWorship.url} />
      <Section>
        <SectionHeader eyebrow="Episodes" title="Latest Episodes" />

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading episodes…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl bg-card p-10 text-center shadow-card ring-1 ring-black/5">
            <Headphones className="mx-auto h-10 w-10 text-[#E13495]" />
            <h3 className="mt-4 font-display text-xl font-bold">Episodes are on the way</h3>
            <p className="mt-2 text-sm text-muted-foreground">New episodes will appear here as soon as they are published.</p>
          </div>
        ) : (
          <ul className="space-y-5">
            {rows.map((ep) => {
              const audio = podcastAudioUrl(ep.audio_file_url) ?? ep.external_audio_url ?? "";
              const cover = mediaUrl(ep.cover_image_url) || eventPhotos.modernWorship.url;
              return (
                <li key={ep.id} className="overflow-hidden rounded-2xl bg-card p-5 shadow-card ring-1 ring-black/5 sm:flex sm:gap-5">
                  <img src={cover} alt={ep.title} className="h-40 w-full rounded-xl object-cover sm:h-28 sm:w-28 sm:shrink-0" loading="lazy" />
                  <div className="mt-4 min-w-0 flex-1 sm:mt-0">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <Link to="/podcasts/$slug" params={{ slug: ep.slug }} className="font-display text-lg font-bold hover:text-[#E13495]">
                        {ep.title}
                      </Link>
                      {ep.duration && <span className="text-xs text-muted-foreground">{ep.duration}</span>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ep.speaker_or_host ?? "RCCG Praise Palace Northampton"}
                      {ep.publication_date ? ` · ${new Date(ep.publication_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}` : ""}
                    </p>
                    {ep.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{ep.description}</p>}
                    {audio && <audio controls preload="none" src={audio} className="mt-3 w-full" />}
                    <Link to="/podcasts/$slug" params={{ slug: ep.slug }} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#E13495] hover:underline">
                      <Play className="h-3.5 w-3.5" /> Open episode
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}
