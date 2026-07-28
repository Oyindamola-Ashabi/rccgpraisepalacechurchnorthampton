import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { Play, Download } from "lucide-react";
import { eventPhotos } from "@/lib/gallery-images";
import { mediaUrl, usePublishedSermons, youTubeId } from "@/lib/cms";

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

const fallbackSermons = [
  { slug: "the-power-of-praise", image: eventPhotos.celebration.url, title: "The Power of Praise", speaker: "Pastor Abiodun Bamgbala", series: "It Shall End In Praise", date: "07 Jul 2026" },
  { slug: "worship-as-warfare", image: eventPhotos.dinner.url, title: "Worship as Warfare", speaker: "Pastor (Mrs.)", series: "Kingdom Living", date: "30 Jun 2026" },
  { slug: "faith-over-fear", image: eventPhotos.fathers.url, title: "Faith Over Fear", speaker: "Pastor Abiodun Bamgbala", series: "Anchored", date: "22 Jun 2026" },
  { slug: "kingdom-purpose", image: eventPhotos.family.url, title: "Kingdom Purpose", speaker: "Pastor Abiodun Bamgbala", series: "Kingdom Living", date: "14 Jun 2026" },
  { slug: "encounter-sunday", image: eventPhotos.tableFellowship.url, title: "Encounter Sunday", speaker: "Guest Minister", series: "Special Services", date: "07 Jun 2026" },
  { slug: "the-long-yes", image: eventPhotos.familyLife.url, title: "The Long Yes", speaker: "Pastor (Mrs.)", series: "Anchored", date: "31 May 2026" },
];

function watchOnYouTube(title: string) {
  window.open(
    `https://www.youtube.com/results?search_query=${encodeURIComponent("RCCG Praise Palace Northampton " + title)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

export function downloadNotes(title: string) {
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

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function SermonsPage() {
  const { rows } = usePublishedSermons();

  const cmsCards = rows.map((s) => {
    const id = s.youtube_video_id || youTubeId(s.youtube_url);
    return {
      slug: s.slug,
      title: s.title,
      speaker: s.speaker ?? "RCCG Praise Palace Northampton",
      series: s.category ?? "Sermon",
      date: formatDate(s.sermon_date),
      image:
        mediaUrl(s.thumbnail_url) ||
        (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : eventPhotos.modernWorship.url),
      internal: true,
    };
  });

  const cards =
    cmsCards.length > 0
      ? cmsCards
      : fallbackSermons.map((s) => ({ ...s, internal: false }));

  return (
    <>
      <PageHero eyebrow="Word of Life" title="Sermons" subtitle="Timeless truth delivered with clarity, power and love." image={eventPhotos.modernWorship.url} />
      <Section>
        <SectionHeader eyebrow="Recent" title="Latest Messages" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((s) => (
            <article key={s.slug} className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5">
              {s.internal ? (
                <Link to="/sermons/$slug" params={{ slug: s.slug }} className="relative aspect-video block w-full overflow-hidden" aria-label={`Watch ${s.title}`}>
                  <Thumb image={s.image} title={s.title} series={s.series} />
                </Link>
              ) : (
                <button type="button" onClick={() => watchOnYouTube(s.title)} className="relative aspect-video block w-full overflow-hidden" aria-label={`Watch ${s.title}`}>
                  <Thumb image={s.image} title={s.title} series={s.series} />
                </button>
              )}
              <div className="p-5">
                <h3 className="font-display font-bold text-lg leading-tight">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.speaker}{s.date ? ` · ${s.date}` : ""}</p>
                <div className="mt-3 flex gap-3">
                  {s.internal ? (
                    <Link to="/sermons/$slug" params={{ slug: s.slug }} className="inline-flex items-center gap-1 text-xs font-semibold text-[#E13495] hover:underline"><Play className="h-3.5 w-3.5" /> Watch</Link>
                  ) : (
                    <button type="button" onClick={() => watchOnYouTube(s.title)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#E13495] hover:underline"><Play className="h-3.5 w-3.5" /> Watch</button>
                  )}
                  <button type="button" onClick={() => downloadNotes(s.title)} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-[#E13495]"><Download className="h-3.5 w-3.5" /> Download Notes</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

function Thumb({ image, title, series }: { image: string; title: string; series: string }) {
  return (
    <>
      <img src={image} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition grid place-items-center">
        <div className="grid h-14 w-14 place-items-center rounded-full gradient-brand text-white shadow-elegant">
          <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
        </div>
      </div>
      <span className="absolute top-3 left-3 rounded-full bg-black/50 text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 backdrop-blur">{series}</span>
    </>
  );
}
