import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { eventPhotos } from "@/lib/gallery-images";
import { usePublishedPodcasts } from "@/lib/cms";
import { EpisodeList } from "@/components/episode-list";

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
        <EpisodeList episodes={rows} loading={loading} coverFallback={eventPhotos.modernWorship.url} />
      </Section>
    </>
  );
}
