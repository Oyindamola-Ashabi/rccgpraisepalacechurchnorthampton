import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { Play } from "lucide-react";
import { eventPhotos } from "@/lib/gallery-images";
import { mediaUrl, usePublishedSermons, youTubeId, youTubePoster } from "@/lib/cms";

export const Route = createFileRoute("/sermons/")({
  head: () => ({
    meta: [
      { title: "Sermons — RCCG Praise Palace Northampton" },
      { name: "description", content: "Life-transforming messages from RCCG Praise Palace Northampton. Watch, listen and download sermon notes." },
      { property: "og:title", content: "Sermons — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Word-based messages that transform lives." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/sermons" },
      { property: "og:image", content: eventPhotos.modernWorship.url },
    ],
    links: [{ rel: "canonical", href: "/sermons" }],
  }),
  component: SermonsPage,
});

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function SermonsPage() {
  const { rows, loading } = usePublishedSermons();

  return (
    <>
      <PageHero eyebrow="Word of Life" title="Sermons" subtitle="Timeless truth delivered with clarity, power and love." image={eventPhotos.modernWorship.url} />
      <Section>
        <SectionHeader eyebrow="Recent" title="Latest Messages" />

        {loading ? (
          <p className="text-center text-sm text-muted-foreground">Loading sermons…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl bg-card p-10 text-center shadow-card ring-1 ring-black/5">
            <Play className="mx-auto h-10 w-10 text-[#E13495]" />
            <h3 className="mt-4 font-display text-xl font-bold">Messages are on the way</h3>
            <p className="mt-2 text-sm text-muted-foreground">Newly published sermons appear here automatically.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((s) => {
              const id = s.youtube_video_id || youTubeId(s.youtube_url);
              const image = mediaUrl(s.thumbnail_url) || youTubePoster(id) || eventPhotos.modernWorship.url;
              return (
                <article key={s.id} className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5">
                  <Link
                    to="/sermons/$slug"
                    params={{ slug: s.slug }}
                    className="relative block aspect-video w-full overflow-hidden"
                    aria-label={`Watch ${s.title}`}
                  >
                    <img src={image} alt={s.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                    <span className="absolute inset-0 grid place-items-center bg-black/30 transition group-hover:bg-black/50">
                      <span className="grid h-14 w-14 place-items-center rounded-full gradient-brand text-white shadow-elegant">
                        <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                      </span>
                    </span>
                    {s.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                        {s.category}
                      </span>
                    )}
                  </Link>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold leading-tight">{s.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.speaker ?? "RCCG Praise Palace Northampton"}
                      {s.sermon_date ? ` · ${formatDate(s.sermon_date)}` : ""}
                    </p>
                    <Link
                      to="/sermons/$slug"
                      params={{ slug: s.slug }}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#E13495] hover:underline"
                    >
                      <Play className="h-3.5 w-3.5" /> Watch message
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
