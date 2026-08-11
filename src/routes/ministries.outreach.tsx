import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Loader2, HeartHandshake } from "lucide-react";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { useActiveMinistries, mediaUrl } from "@/lib/cms";
import { eventPhotos } from "@/lib/gallery-images";
import heroImg from "@/assets/hero-worship.jpg";

export const Route = createFileRoute("/ministries/outreach")({
  head: () => ({
    meta: [
      { title: "Outreach & Initiatives — RCCG Praise Palace Northampton" },
      { name: "description", content: "PraisePalace Radio, Praise Palace Business School, Raising Champions Youth Camp and our Community Outreach initiatives." },
      { property: "og:title", content: "Outreach & Initiatives — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Serving our city and beyond through radio, enterprise, youth and community initiatives." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/ministries/outreach" }],
  }),
  component: OutreachPage,
});

const IMAGE_FALLBACKS: Record<string, string> = {
  "raising-champions-youth-camp": eventPhotos.youth.url,
  "praisepalace-radio": eventPhotos.modernWorship.url,
  "praise-palace-business-school": eventPhotos.business.url,
};

function OutreachPage() {
  const { rows, loading } = useActiveMinistries("outreach");

  return (
    <>
      <PageHero
        eyebrow="Beyond Our Walls"
        title="Outreach & Initiatives"
        subtitle="Serving our city and beyond through radio, enterprise, youth and community work."
        image={heroImg}
      />

      <Section>
        <SectionHeader eyebrow="Reach · Serve · Impact" title="Our Initiatives" />

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((m) => {
              const href = m.link_url ?? "";
              const external = /^https?:/.test(href);
              const image = mediaUrl(m.image_url) || IMAGE_FALLBACKS[m.slug] || heroImg;
              return (
                <article key={m.id} className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5 transition hover:-translate-y-1">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={image}
                      alt={m.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = heroImg; }}
                    />
                  </div>
                  <div className="p-5">
                    <h2 className="font-display text-lg font-bold leading-tight">{m.name}</h2>
                    {m.short_description && <p className="mt-2 text-sm text-muted-foreground">{m.short_description}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <Link to="/ministries/$slug" params={{ slug: m.slug }} className="inline-flex items-center gap-1 text-sm font-semibold text-[#E13495] hover:underline">
                        Learn more <ArrowRight className="h-4 w-4" />
                      </Link>
                      {href && external && (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-[#E13495]">
                          Visit site <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            <article className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5 transition hover:-translate-y-1">
              <div className="grid aspect-[16/10] place-items-center gradient-brand text-white">
                <HeartHandshake className="h-12 w-12" />
              </div>
              <div className="p-5">
                <h2 className="font-display text-lg font-bold leading-tight">Community Outreach</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Partnerships and initiatives serving our wider community, including the UK SME Growth Summit.
                </p>
                <Link to="/ministries/community-outreach" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E13495] hover:underline">
                  Learn more <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </div>
        )}
      </Section>
    </>
  );
}
