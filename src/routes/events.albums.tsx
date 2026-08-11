import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { AlbumGrid } from "@/components/album-flipbook";
import { useAllAlbums } from "@/lib/cms";
import { galleryPhotos } from "@/lib/gallery-images";

export const Route = createFileRoute("/events/albums")({
  head: () => ({
    meta: [
      { title: "Church Albums — RCCG Praise Palace Northampton" },
      {
        name: "description",
        content:
          "Photograph and video albums from retreats, worship, outreach and family life at RCCG Praise Palace Northampton.",
      },
      { property: "og:title", content: "Church Albums — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Browse photographs and videos from life together at Praise Palace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: galleryPhotos[0].url },
      { name: "twitter:image", content: galleryPhotos[0].url },
    ],
  }),
  component: AlbumsPage,
});

function AlbumsPage() {
  const { rows: albums, loading } = useAllAlbums();
  const [year, setYear] = useState<string>("All");

  const years = useMemo(() => {
    const set = new Set<string>();
    albums.forEach((a) => a.album_year && set.add(String(a.album_year)));
    return ["All", ...[...set].sort((a, b) => Number(b) - Number(a))];
  }, [albums]);

  const shown = year === "All" ? albums : albums.filter((a) => String(a.album_year) === year);

  return (
    <>
      <PageHero
        eyebrow="Our Story in Pictures"
        title={
          <>
            Church <span className="text-[#F0DE51]">Albums</span>
          </>
        }
        subtitle="Photographs and videos from retreats, worship, outreach and family life at RCCG Praise Palace Northampton."
        image={galleryPhotos[0].url}
      />

      <Section>
        <SectionHeader
          eyebrow="Browse"
          title="Choose an album"
          subtitle="Open an album to page through the photographs and watch the videos inside."
        />

        {years.length > 2 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  year === y
                    ? "gradient-brand text-white border-transparent shadow-elegant"
                    : "border-border text-muted-foreground hover:border-[#E13495] hover:text-[#E13495]"
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-center text-sm text-muted-foreground">Loading albums…</p>
        ) : shown.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Albums will appear here soon.</p>
        ) : (
          <AlbumGrid albums={shown} />
        )}
      </Section>
    </>
  );
}
