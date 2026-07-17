import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { X, Camera, ArrowRight } from "lucide-react";
import { galleryPhotos, type GalleryPhoto } from "@/lib/gallery-images";

export const Route = createFileRoute("/media/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — RCCG Praise Palace Northampton" },
      { name: "description", content: "Photo gallery of worship, fellowship, family life and celebrations at RCCG Praise Palace Northampton." },
      { property: "og:title", content: "Gallery — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Moments of praise, family and fellowship captured in pictures." },
      { property: "og:url", content: "/media/gallery" },
      { property: "og:image", content: galleryPhotos[0].url },
    ],
    links: [{ rel: "canonical", href: "/media/gallery" }],
  }),
  component: GalleryPage,
});

const CATEGORIES = ["All", "Celebration", "Fellowship", "Worship", "Couples", "Community"] as const;

function GalleryPage() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const [active, setActive] = useState<GalleryPhoto | null>(null);

  const shown = filter === "All" ? galleryPhotos : galleryPhotos.filter((p) => p.category === filter);

  return (
    <>
      <PageHero
        eyebrow="Our Story in Pictures"
        title={<>Praise Palace <span className="text-[#F0DE51]">Gallery</span></>}
        subtitle="Every photo tells a story of grace — moments of worship, teaching, celebration and family that make RCCG Praise Palace Northampton home."
        image={galleryPhotos[0].url}
      />

      <Section>
        <SectionHeader
          eyebrow="Moments of Grace"
          title="Life Together"
          subtitle="Browse a growing collection of memories from our services, retreats and celebrations. New photos and videos are added often."
        />

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                filter === c
                  ? "gradient-brand text-white border-transparent shadow-elegant"
                  : "border-border text-muted-foreground hover:border-[#E13495] hover:text-[#E13495]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {shown.map((p) => (
            <button
              key={p.url}
              onClick={() => setActive(p)}
              className="group relative w-full overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5 block break-inside-avoid"
            >
              <img
                src={p.url}
                alt={p.title}
                loading="lazy"
                className="w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left text-white translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition">
                <div className="text-[10px] uppercase tracking-widest text-[#F0DE51]">{p.category}</div>
                <div className="font-display font-bold text-base leading-tight">{p.title}</div>
              </div>
              <span className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#E13495] opacity-0 group-hover:opacity-100 transition">
                <Camera className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-secondary/40 border-y">
        <Section>
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <SectionHeader
                center={false}
                eyebrow="Watch & Worship"
                title={<>More than pictures — <span className="text-gradient-brand">be part of the story.</span></>}
                subtitle="Watch full services and worship sessions on our media library, or come and experience the atmosphere in person this Sunday."
              />
              <div className="flex flex-wrap gap-3">
                <BrandButton to="/media">Watch Videos</BrandButton>
                <BrandButton to="/contact" variant="gold">Plan a Visit</BrandButton>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {galleryPhotos.slice(0, 4).map((p) => (
                <img key={p.url} src={p.url} alt={p.title} className="rounded-xl aspect-square object-cover shadow-card" loading="lazy" />
              ))}
            </div>
          </div>
        </Section>
      </section>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm p-4 md:p-8 flex items-center justify-center animate-fade-in"
          onClick={() => setActive(null)}
        >
          <button
            aria-label="Close"
            onClick={() => setActive(null)}
            className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={active.url} alt={active.title} className="w-full max-h-[80vh] object-contain rounded-2xl" />
            <div className="mt-4 text-center text-white">
              <div className="text-[10px] uppercase tracking-widest text-[#F0DE51]">{active.category}</div>
              <div className="mt-1 font-display font-bold text-xl">{active.title}</div>
              <div className="mt-1 text-sm text-white/80">{active.caption}</div>
            </div>
          </div>
        </div>
      )}

      <Section className="!pt-0">
        <Link to="/media" className="inline-flex items-center gap-1 text-sm font-semibold text-[#E13495] hover:underline">
          Back to Media <ArrowRight className="h-4 w-4" />
        </Link>
      </Section>
    </>
  );
}
