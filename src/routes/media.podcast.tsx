import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { Headphones, ArrowRight } from "lucide-react";
import podcastImg from "@/assets/podcast.jpg";
import { usePublishedPodcasts, useSiteSettings } from "@/lib/cms";
import { EpisodeList } from "@/components/episode-list";

export const Route = createFileRoute("/media/podcast")({
  head: () => ({
    meta: [
      { title: "Praise Talks Podcast — RCCG Praise Palace Northampton" },
      { name: "description", content: "Praise Talks — the official RCCG Praise Palace Northampton podcast. Conversations that stir faith and fuel purpose." },
      { property: "og:title", content: "Praise Talks Podcast — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Conversations that stir faith and fuel purpose." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/media/podcast" },
    ],
    links: [{ rel: "canonical", href: "/media/podcast" }],
  }),
  component: PodcastPage,
});

function PodcastPage() {
  const { rows, loading } = usePublishedPodcasts();
  const settings = useSiteSettings();

  return (
    <>
      <PageHero eyebrow="Praise Talks" title="The Podcast" subtitle="Honest conversations at the intersection of faith, life and purpose." image={podcastImg} />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div className="relative overflow-hidden rounded-3xl shadow-elegant lg:sticky lg:top-24">
            <img src={podcastImg} alt="Praise Talks" className="aspect-square w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a0d2a]/90 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <Headphones className="h-8 w-8 text-[#F0DE51]" />
              <h2 className="mt-2 font-display text-2xl font-bold">Praise Talks</h2>
              <p className="text-sm text-white/80">Weekly · RCCG Praise Palace Northampton</p>
            </div>
          </div>

          <div>
            <SectionHeader
              center={false}
              eyebrow="Episodes"
              title={<>Latest <span className="text-gradient-brand">Episodes</span></>}
              subtitle="Press play to listen here, or open the episode on your favourite platform."
            />
            <div className="mb-6 flex flex-wrap gap-2">
              {settings?.youtube_url && (
                <BrandButton href={settings.youtube_url} external variant="outline">YouTube</BrandButton>
              )}
              <Link to="/podcasts" className="inline-flex items-center gap-1 self-center text-sm font-semibold text-[#E13495] hover:underline">
                All episodes <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <EpisodeList episodes={rows} loading={loading} coverFallback={podcastImg} />
          </div>
        </div>
      </Section>
    </>
  );
}
