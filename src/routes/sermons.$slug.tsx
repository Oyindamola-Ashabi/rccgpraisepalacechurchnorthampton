import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/section-ui";
import { mediaUrl, youTubeId, type Sermon } from "@/lib/cms";
import { Paragraphs } from "@/components/rich-text";

export const Route = createFileRoute("/sermons/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: "Sermon — RCCG Praise Palace Northampton" },
      { name: "description", content: "Watch this message from RCCG Praise Palace Northampton." },
      { property: "og:title", content: "Sermon — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Watch this message from RCCG Praise Palace Northampton." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: `/sermons/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/sermons/${params.slug}` }],
  }),
  component: SermonDetail,
});

function downloadNotes(title: string) {
  const content = `RCCG Praise Palace Northampton\nSermon Notes\n\nTitle: ${title}\n\n(Notes will be updated after the service.)\n`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-notes.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function SermonDetail() {
  const { slug } = Route.useParams();
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("sermons" as any)
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setSermon((data as any) ?? null);
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

  if (!sermon) {
    return (
      <Section>
        <div className="mx-auto max-w-lg text-center">
          <h1 className="font-display text-3xl font-bold">Sermon not available</h1>
          <p className="mt-3 text-sm text-muted-foreground">This message may have been moved or is not published yet.</p>
          <Link to="/sermons" className="mt-6 inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-2.5 text-sm font-semibold text-white shadow-elegant">
            <ArrowLeft className="h-4 w-4" /> Back to sermons
          </Link>
        </div>
      </Section>
    );
  }

  const videoId = sermon.youtube_video_id || youTubeId(sermon.youtube_url);
  const date = sermon.sermon_date
    ? new Date(sermon.sermon_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "";

  return (
    <Section>
      <Link to="/sermons" className="inline-flex items-center gap-2 text-sm font-semibold text-[#E13495] hover:underline">
        <ArrowLeft className="h-4 w-4" /> All sermons
      </Link>

      <div className="mt-6">
        <YouTubePlayer
          videoId={videoId}
          youtubeUrl={sermon.youtube_url}
          poster={sermonPoster(sermon, eventPhotos.modernWorship.url)}
          title={sermon.title}
        />
      </div>

      <div className="mt-8 max-w-3xl">
        {sermon.category && (
          <span className="rounded-full gradient-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">{sermon.category}</span>
        )}
        <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">{sermon.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {sermon.speaker ?? "RCCG Praise Palace Northampton"}
          {date ? ` · ${date}` : ""}
        </p>
        {sermon.short_description && <p className="mt-4 text-lg text-muted-foreground">{sermon.short_description}</p>}
        {sermon.full_description && (
          <div className="mt-5 leading-relaxed text-muted-foreground">
            <Paragraphs text={sermon.full_description} />
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadNotes(sermon.title)}
            className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold hover:bg-secondary/60"
          >
            <Download className="h-4 w-4" /> Download notes
          </button>
        </div>
      </div>
    </Section>
  );
}
