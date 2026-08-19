import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { AlbumGrid } from "@/components/album-flipbook";
import { useAllAlbums, useAlbumCategories, albumCategoryKey, categoryKey, type GalleryAlbumRow } from "@/lib/cms";
import { galleryPhotos } from "@/lib/gallery-images";

export const Route = createFileRoute("/events/albums")({
  validateSearch: (search: Record<string, unknown>): { category?: string } =>
    typeof search.category === "string" ? { category: search.category } : {},
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

const OTHER = "other";

function AlbumsPage() {
  const { category: categoryParam } = Route.useSearch();
  const navigate = useNavigate();
  const { rows: albums, loading } = useAllAlbums();
  const { rows: categoryRows } = useAlbumCategories();
  const [year, setYear] = useState<string>("All");

  // The category buttons: the categories set up in Admin, plus any wording
  // already used by an album that has not been set up as a category yet.
  const categories = useMemo(() => {
    const list: { key: string; name: string }[] = [];
    const seen = new Set<string>();
    categoryRows.forEach((c) => {
      const key = c.slug || categoryKey(c.name);
      if (!key || seen.has(key)) return;
      seen.add(key);
      list.push({ key, name: c.name });
    });
    albums.forEach((a) => {
      const key = albumCategoryKey(a);
      if (!key || seen.has(key)) return;
      seen.add(key);
      list.push({ key, name: (a.category ?? "").trim() || "Other" });
    });
    if (albums.some((a) => !albumCategoryKey(a))) list.push({ key: OTHER, name: "Other" });
    return list.filter((c) => albums.some((a) => matches(a, c.key)));
  }, [categoryRows, albums]);

  function matches(album: GalleryAlbumRow, key: string) {
    const albumKey = albumCategoryKey(album);
    return key === OTHER ? !albumKey : albumKey === key;
  }

  const activeCategory = categoryParam && categories.some((c) => c.key === categoryParam) ? categoryParam : "All";

  const inCategory = activeCategory === "All" ? albums : albums.filter((a) => matches(a, activeCategory));

  const years = useMemo(() => {
    const set = new Set<string>();
    inCategory.forEach((a) => a.album_year && set.add(String(a.album_year)));
    return [...set].sort((a, b) => Number(b) - Number(a));
  }, [inCategory]);

  const shown = year === "All" ? inCategory : inCategory.filter((a) => String(a.album_year) === year);

  // Within a category the albums are grouped by year, newest year first.
  const grouped = useMemo(() => {
    const map = new Map<string, GalleryAlbumRow[]>();
    shown.forEach((a) => {
      const key = a.album_year ? String(a.album_year) : "Undated";
      map.set(key, [...(map.get(key) ?? []), a]);
    });
    return [...map.entries()].sort((a, b) => {
      if (a[0] === "Undated") return 1;
      if (b[0] === "Undated") return -1;
      return Number(b[0]) - Number(a[0]);
    });
  }, [shown]);

  function chooseCategory(key: string) {
    setYear("All");
    navigate({ to: "/events/albums", search: key === "All" ? {} : { category: key } });
  }

  const pill = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
      active
        ? "gradient-brand text-white border-transparent shadow-elegant"
        : "border-border text-muted-foreground hover:border-[#E13495] hover:text-[#E13495]"
    }`;

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
          subtitle="Pick a category, then a year, and open an album to page through the photographs and watch the videos inside."
        />

        {categories.length > 1 && (
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <button onClick={() => chooseCategory("All")} className={pill(activeCategory === "All")}>
              All albums
            </button>
            {categories.map((c) => (
              <button key={c.key} onClick={() => chooseCategory(c.key)} className={pill(activeCategory === c.key)}>
                {c.name}
              </button>
            ))}
          </div>
        )}


        {loading ? (
          <p className="text-center text-sm text-muted-foreground">Loading albums…</p>
        ) : shown.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Albums will appear here soon.</p>
        ) : (
          <div className="space-y-14">
            {grouped.map(([groupYear, list]) => (
              <div key={groupYear}>
                {grouped.length > 1 && (
                  <h3 className="mb-6 text-center font-display text-xl font-bold">
                    {groupYear === "Undated" ? "Other albums" : groupYear}
                  </h3>
                )}
                <AlbumGrid albums={list} />
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
