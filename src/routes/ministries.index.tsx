import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, ArrowRight } from "lucide-react";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { useActiveMinistries, mediaUrl } from "@/lib/cms";
import { eventPhotos } from "@/lib/gallery-images";
import heroImg from "@/assets/hero-worship.jpg";

export const Route = createFileRoute("/ministries/")({
  head: () => ({
    meta: [
      { title: "Ministries — RCCG Praise Palace Northampton" },
      { name: "description", content: "Explore the ministries of RCCG Praise Palace Northampton — men, women, youth, radio, business school and more." },
      { property: "og:title", content: "Ministries — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Find your place to belong, grow and serve." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/ministries" },
    ],
    links: [{ rel: "canonical", href: "/ministries" }],
  }),
  component: MinistriesPage,
});

/** Built-in images kept as fallbacks when a ministry has no image in the admin. */
const IMAGE_FALLBACKS: Record<string, string> = {
  "mens-fellowship": eventPhotos.men.url,
  "womens-fellowship": eventPhotos.women.url,
  "couples-retreat": eventPhotos.couples.url,
};

/** Shown only if the admin has no ministries at all. */
const BUILT_IN = [
  { name: "Men Fellowship", slug: "mens-fellowship", short: "Brothers building one another in faith, purpose and accountability." },
  { name: "Women Fellowship", slug: "womens-fellowship", short: "A sisterhood of grace, prayer and practical support." },
];

function MinistriesPage() {
  const { rows, loading } = useActiveMinistries("church");

  const items = (rows.length ? rows : BUILT_IN).map((m: any) => ({
    name: m.name,
    slug: m.slug,
    short: m.short_description ?? m.short ?? "",
    image: mediaUrl(m.image_url) || IMAGE_FALLBACKS[m.slug] || heroImg,
    leader: (m.leader ?? null) as string | null,
    meeting: (m.meeting_info ?? null) as string | null,
    extra: (m.link_url ?? null) as string | null,
  }));

  return (
    <>
      <PageHero
        eyebrow="Get Involved"
        title="Our Ministries"
        subtitle="Our church ministries — there is a place for everyone at RCCG Praise Palace Northampton."
        image={heroImg}
      />

      <Section>
        <SectionHeader eyebrow="Belong · Grow · Serve" title="Find Your Place" subtitle="Each ministry is a family within the family — a place to be known, discipled and sent." />

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => {
              const externalExtra = !!m.extra && /^https?:/.test(m.extra);
              return (
                <article key={m.slug} className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5 transition hover:-translate-y-1">
                  <Link to="/ministries/$slug" params={{ slug: m.slug }} className="block">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={m.image}
                        alt={m.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = heroImg; }}
                      />
                    </div>
                  </Link>
                  <div className="p-5">
                    <h2 className="font-display text-lg font-bold leading-tight">
                      <Link to="/ministries/$slug" params={{ slug: m.slug }} className="hover:text-[#E13495]">{m.name}</Link>
                    </h2>
                    {m.short && <p className="mt-2 text-sm text-muted-foreground">{m.short}</p>}
                    {m.leader && <p className="mt-2 text-xs text-muted-foreground"><span className="font-semibold">Leader:</span> {m.leader}</p>}
                    {m.meeting && <p className="text-xs text-muted-foreground"><span className="font-semibold">Meets:</span> {m.meeting}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <Link to="/ministries/$slug" params={{ slug: m.slug }} className="inline-flex items-center gap-1 text-sm font-semibold text-[#E13495] hover:underline">
                        Learn more <ArrowRight className="h-4 w-4" />
                      </Link>
                      {m.extra && externalExtra && (
                        <a href={m.extra} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-[#E13495]">
                          Visit site <ArrowRight className="h-4 w-4" />
                        </a>
                      )}
                      {m.extra && !externalExtra && (
                        <Link to={m.extra} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-[#E13495]">
                          More <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
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
