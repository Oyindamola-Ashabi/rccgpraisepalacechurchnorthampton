import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { YouTubePlayer } from "@/components/video-embed";
import { Headphones, Video, ArrowRight, Image as ImageIcon, Play } from "lucide-react";
import heroImg from "@/assets/hero-worship.jpg";
import { galleryPhotos, eventPhotos } from "@/lib/gallery-images";
import {
  mediaUrl,
  pickFeaturedSermon,
  sermonPoster,
  usePageContent,
  usePublishedSermons,
  useSectionItems,
  youTubeId,
  youTubePoster,
} from "@/lib/cms";
import { Paragraphs } from "@/components/rich-text";

export const Route = createFileRoute("/media/")({
  head: () => ({
    meta: [
      { title: "Media — RCCG Praise Palace Northampton" },
      { name: "description", content: "Sermons, worship sessions, podcasts, gallery and video content from RCCG Praise Palace Northampton." },
      { property: "og:title", content: "Media — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Watch, listen and relive our moments — anywhere, anytime." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/media" },
    ],
    links: [{ rel: "canonical", href: "/media" }],
  }),
  component: MediaPage,
});

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function MediaPage() {
  const { text, image } = usePageContent("media");
  const { rows: sermons, loading } = usePublishedSermons();
  const featured = pickFeaturedSermon(sermons);
  const { rows: cardRows } = useSectionItems("media", "cards");

  const CARD_DEFAULTS: Record<string, { icon: any; image: string; overlay: string; accent: string }> = {
    albums: { icon: ImageIcon, image: galleryPhotos[0].url, overlay: "from-[#3a1d0d]/90 via-[#3a1d0d]/40 to-transparent", accent: "text-[#F0DE51]" },
    podcast: { icon: Headphones, image: eventPhotos.guests.url, overlay: "from-[#3a0d2a]/90 via-[#3a0d2a]/40 to-transparent", accent: "text-[#F0DE51]" },
    radio: { icon: Video, image: eventPhotos.students.url, overlay: "from-[#0d2a3a]/90 via-[#0d2a3a]/40 to-transparent", accent: "text-[#91D7F6]" },
  };

  const cards = cardRows
    .filter((r) => r.is_visible !== false)
    .map((r) => {
      const d = CARD_DEFAULTS[r.item_key] ?? { icon: ImageIcon, image: galleryPhotos[0].url, overlay: "from-black/90 via-black/40 to-transparent", accent: "text-[#F0DE51]" };
      const href = (r.cta_href ?? "").trim();
      return {
        key: r.id,
        icon: d.icon,
        overlay: d.overlay,
        accent: d.accent,
        image: mediaUrl(r.image_url) || d.image,
        title: r.title ?? "",
        body: r.body ?? "",
        ctaLabel: r.cta_label ?? "",
        href: href || "/media",
        external: /^https?:\/\//i.test(href),
      };
    })
    .filter((c) => c.title);

  const featuredPoster = sermonPoster(featured, eventPhotos.celebration.url);
  const featuredId = featured ? featured.youtube_video_id || youTubeId(featured.youtube_url) : null;
  const rest = featured ? sermons.filter((s) => s.id !== featured.id) : sermons;

  return (
    <>
      <PageHero
        eyebrow={text("hero", "subheading", "Watch. Listen. Grow.")}
        title={text("hero", "headline", "Media Library")}
        subtitle={text("hero", "body", "Sermons, worship, testimonies and podcasts — anywhere, anytime.")}
        image={image("hero", heroImg)}
      />

      {featured && (
        <Section>
          <SectionHeader eyebrow="Featured" title="Latest Message" />
          <div className="mx-auto max-w-4xl">
            <YouTubePlayer
              videoId={featuredId}
              youtubeUrl={featured.youtube_url ?? null}
              poster={featuredPoster}
              title={featured.title}
            />
            <div className="mt-6">
              <h3 className="font-display text-2xl font-bold">{featured.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {featured.speaker ?? "RCCG Praise Palace Northampton"}
                {featured.sermon_date ? ` · ${formatDate(featured.sermon_date)}` : ""}
              </p>
              {featured.short_description && (
                <div className="mt-3 leading-relaxed text-muted-foreground">
                  <Paragraphs text={featured.short_description} />
                </div>
              )}
              <Link
                to="/sermons/$slug"
                params={{ slug: featured.slug }}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E13495] hover:underline"
              >
                Open sermon page <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Section>
      )}


      <section className="bg-secondary/40 border-y">
        <Section>
          <SectionHeader eyebrow="Explore" title="Video Sermons" subtitle="Every published message from RCCG Praise Palace Northampton." />
          {loading ? (
            <p className="text-center text-sm text-muted-foreground">Loading sermons…</p>
          ) : rest.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              More messages are on the way — new sermons appear here as soon as they are published.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((s) => {
                const id = s.youtube_video_id || youTubeId(s.youtube_url);
                const poster =
                  mediaUrl(s.thumbnail_url) || youTubePoster(id) || eventPhotos.modernWorship.url;
                return (
                  <article key={s.id} className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5">
                    <Link
                      to="/sermons/$slug"
                      params={{ slug: s.slug }}
                      className="relative block aspect-video w-full overflow-hidden"
                      aria-label={`Watch ${s.title}`}
                    >
                      <img src={poster} alt={s.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
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
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <div className="mt-8 text-center">
            <Link to="/sermons" className="inline-flex items-center gap-1 text-sm font-semibold text-[#E13495] hover:underline">
              Go to the sermons page <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      </section>

      {cards.length > 0 && (
        <Section>
          <div className={`grid gap-6 ${cards.length >= 3 ? "md:grid-cols-3" : cards.length === 2 ? "md:grid-cols-2" : "md:max-w-xl md:mx-auto"}`}>
            {cards.map((c) => {
              const Icon = c.icon;
              const inner = (
                <>
                  <img src={c.image} alt={c.title} className="w-full aspect-[16/10] object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${c.overlay}`} />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                    <Icon className={`h-8 w-8 ${c.accent}`} />
                    <h3 className="mt-3 font-display font-bold text-2xl">{c.title}</h3>
                    {c.body && <p className="mt-1 text-sm text-white/80">{c.body}</p>}
                    {c.ctaLabel && (
                      <span className={`mt-3 inline-flex items-center gap-1 text-sm font-semibold ${c.accent}`}>
                        {c.ctaLabel} {c.external ? "↗" : <ArrowRight className="h-4 w-4" />}
                      </span>
                    )}
                  </div>
                </>
              );
              const className = "group relative overflow-hidden rounded-2xl shadow-elegant";
              return c.external ? (
                <a key={c.key} href={c.href} target="_blank" rel="noopener noreferrer" className={className}>{inner}</a>
              ) : (
                <Link key={c.key} to={c.href} className={className}>{inner}</Link>
              );
            })}
          </div>
        </Section>
      )}

    </>
  );
}
