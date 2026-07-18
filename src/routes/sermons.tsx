import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { Play, Download } from "lucide-react";
import { eventPhotos } from "@/lib/gallery-images";

export const Route = createFileRoute("/sermons")({
  head: () => ({
    meta: [
      { title: "Sermons — RCCG Praise Palace Northampton" },
      { name: "description", content: "Life-transforming messages from RCCG Praise Palace Northampton. Watch, listen, download." },
      { property: "og:title", content: "Sermons — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Word-based messages that transform lives." },
      { property: "og:url", content: "/sermons" },
      { property: "og:image", content: eventPhotos.modernWorship.url },
    ],
    links: [{ rel: "canonical", href: "/sermons" }],
  }),
  component: SermonsPage,
});

const sermons = [
  { image: eventPhotos.celebration.url, title: "The Power of Praise", speaker: "Pastor Abiodun Bamgbala", series: "It Shall End In Praise", date: "07 Jul 2026" },
  { image: eventPhotos.dinner.url, title: "Worship as Warfare", speaker: "Pastor (Mrs.)", series: "Kingdom Living", date: "30 Jun 2026" },
  { image: eventPhotos.fathers.url, title: "Faith Over Fear", speaker: "Pastor Abiodun Bamgbala", series: "Anchored", date: "22 Jun 2026" },
  { image: eventPhotos.family.url, title: "Kingdom Purpose", speaker: "Pastor Abiodun Bamgbala", series: "Kingdom Living", date: "14 Jun 2026" },
  { image: eventPhotos.tableFellowship.url, title: "Encounter Sunday", speaker: "Guest Minister", series: "Special Services", date: "07 Jun 2026" },
  { image: eventPhotos.familyLife.url, title: "The Long Yes", speaker: "Pastor (Mrs.)", series: "Anchored", date: "31 May 2026" },
];

function watchOnYouTube(title: string) {
  window.open(
    `https://www.youtube.com/results?search_query=${encodeURIComponent("RCCG Praise Palace Northampton " + title)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

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

function SermonsPage() {
  return (
    <>
      <PageHero eyebrow="Word of Life" title="Sermons" subtitle="Timeless truth delivered with clarity, power and love." image={eventPhotos.modernWorship.url} />
      <Section>
        <SectionHeader eyebrow="Recent" title="Latest Messages" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sermons.map((s) => (
            <article key={s.title} className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5">
              <button
                type="button"
                onClick={() => watchOnYouTube(s.title)}
                className="relative aspect-video block w-full overflow-hidden"
                aria-label={`Watch ${s.title}`}
              >
                <img src={s.image} alt={s.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition grid place-items-center">
                  <div className="grid h-14 w-14 place-items-center rounded-full gradient-brand text-white shadow-elegant">
                    <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
                  </div>
                </div>
                <span className="absolute top-3 left-3 rounded-full bg-black/50 text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 backdrop-blur">{s.series}</span>
              </button>
              <div className="p-5">
                <h3 className="font-display font-bold text-lg leading-tight">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.speaker} · {s.date}</p>
                <div className="mt-3 flex gap-3">
                  <button type="button" onClick={() => watchOnYouTube(s.title)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#E13495] hover:underline"><Play className="h-3.5 w-3.5" /> Watch</button>
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
