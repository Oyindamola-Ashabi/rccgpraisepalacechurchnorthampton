import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, ArrowRight } from "lucide-react";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { useActiveMinistries } from "@/lib/cms";
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

/** Shown until an administrator adds ministries in the admin area. */
const BUILT_IN = [
  { name: "Men Fellowship", short: "Brothers building one another in faith, purpose and accountability.", image: eventPhotos.men.url, to: "/ministries/mens-fellowship" },
  { name: "Women Fellowship", short: "A sisterhood of grace, prayer and practical support.", image: eventPhotos.women.url, to: "/ministries/womens-fellowship" },
  { name: "Couples Retreat", short: "Strengthening marriages with the word of God.", image: eventPhotos.couples.url, to: "/events/couples" },
  { name: "Raising Champions Youth Camp", short: "Equipping the next generation to live boldly for Christ.", image: eventPhotos.youth.url, href: "https://raisingchampions.org.uk" },
  { name: "PraisePalace Radio", short: "Worship, teaching and encouragement on demand.", image: eventPhotos.modernWorship.url, href: "https://praisepalaceradio.com/" },
  { name: "Praise Palace Business School", short: "Kingdom principles for enterprise and career.", image: eventPhotos.business.url, href: "https://praisepalacebusinessschool.com/" },
];

function MinistriesPage() {
  const { rows, loading } = useActiveMinistries();

  const items = rows.length
    ? rows.map((m) => ({
        name: m.name,
        short: m.short_description ?? m.full_description ?? "",
        image: m.image_url ?? heroImg,
        leader: m.leader,
        meeting: m.meeting_info,
        href: m.link_url && /^https?:/.test(m.link_url) ? m.link_url : undefined,
        to: m.link_url && m.link_url.startsWith("/") ? m.link_url : undefined,
      }))
    : BUILT_IN.map((b) => ({ ...b, leader: null as string | null, meeting: null as string | null }));

  return (
    <>
      <PageHero
        eyebrow="Get Involved"
        title="Our Ministries"
        subtitle="There is a place for everyone at RCCG Praise Palace Northampton — find yours."
        image={heroImg}
      />

      <Section>
        <SectionHeader eyebrow="Belong · Grow · Serve" title="Find Your Place" subtitle="Each ministry is a family within the family — a place to be known, discipled and sent." />

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => (
              <article key={m.name} className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5 transition hover:-translate-y-1">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = heroImg; }}
                  />
                </div>
                <div className="p-5">
                  <h2 className="font-display text-lg font-bold leading-tight">{m.name}</h2>
                  {m.short && <p className="mt-2 text-sm text-muted-foreground">{m.short}</p>}
                  {m.leader && <p className="mt-2 text-xs text-muted-foreground"><span className="font-semibold">Leader:</span> {m.leader}</p>}
                  {m.meeting && <p className="text-xs text-muted-foreground"><span className="font-semibold">Meets:</span> {m.meeting}</p>}
                  {m.to && (
                    <Link to={m.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E13495] hover:underline">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {m.href && (
                    <a href={m.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E13495] hover:underline">
                      Visit site <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
