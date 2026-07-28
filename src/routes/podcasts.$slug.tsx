import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/section-ui";
import { mediaUrl, podcastAudioUrl, type Podcast } from "@/lib/cms";
import { Paragraphs } from "@/components/rich-text";
import { eventPhotos } from "@/lib/gallery-images";

export const Route = createFileRoute("/podcasts/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: "Podcast episode — RCCG Praise Palace Northampton" },
      { name: "description", content: "Listen to this podcast episode from RCCG Praise Palace Northampton." },
      { property: "og:title", content: "Podcast episode — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Listen to this podcast episode from RCCG Praise Palace Northampton." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: `/podcasts/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/podcasts/${params.slug}` }],
  }),
  component: PodcastDetail,
});

function PodcastDetail() {
  const { slug } = Route.useParams();
  const [episode, setEpisode] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("podcasts" as any)
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setEpisode((data as any) ?? null);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#E13495]" />
      </div>
    );
  }

  if (!episode) {
    return (
      <Section>
        <div className="mx-auto max-w-lg text-center">
          <h1 className="font-display text-3xl font-bold">Episode not available</h1>
          <p className="mt-3 text-sm text-muted-foreground">This episode may have been moved or is not published yet.</p>
          <Link to="/podcasts" className="mt-6 inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-2.5 text-sm font-semibold text-white shadow-elegant">
            <ArrowLeft className="h-4 w-4" /> Back to podcasts
          </Link>
        </div>
      </Section>
    );
  }

  const audio = podcastAudioUrl(episode.audio_file_url) ?? episode.external_audio_url ?? "";
  const cover = mediaUrl(episode.cover_image_url) || eventPhotos.modernWorship.url;

  return (
    <Section>
      <Link to="/podcasts" className="inline-flex items-center gap-2 text-sm font-semibold text-[#E13495] hover:underline">
        <ArrowLeft className="h-4 w-4" /> All episodes
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[280px_1fr]">
        <img src={cover} alt={episode.title} className="w-full rounded-2xl object-cover shadow-elegant" />
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">{episode.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {episode.speaker_or_host ?? "RCCG Praise Palace Northampton"}
            {episode.publication_date ? ` · ${new Date(episode.publication_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}` : ""}
            {episode.duration ? ` · ${episode.duration}` : ""}
          </p>
          {audio && <audio controls preload="metadata" src={audio} className="mt-5 w-full" />}
          {episode.description && (
            <div className="mt-6 leading-relaxed text-muted-foreground">
              <Paragraphs text={episode.description} />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
