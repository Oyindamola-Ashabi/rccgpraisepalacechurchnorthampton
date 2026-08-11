import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { useSectionItems, usePageContent, mediaUrl, type SectionItem } from "@/lib/cms";
import heroImg from "@/assets/community.jpg";

export const Route = createFileRoute("/ministries/community-outreach")({
  head: () => ({
    meta: [
      { title: "Community Outreach — RCCG Praise Palace Northampton" },
      { name: "description", content: "Community initiatives and partnerships of RCCG Praise Palace Northampton, including the UK SME Growth Summit." },
      { property: "og:title", content: "Community Outreach — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Initiatives and partnerships our church family is part of." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/ministries/community-outreach" }],
  }),
  component: CommunityOutreachPage,
});

function CommunityOutreachPage() {
  /** Uses the same CMS records as the homepage Community Spotlight — one source of truth. */
  const { rows, loading } = useSectionItems("home", "community");
  const { text } = usePageContent("home");

  return (
    <>
      <PageHero
        eyebrow="Outreach & Initiatives"
        title="Community Outreach"
        subtitle={text("community", "body", "Initiatives and partnerships our church family is part of.")}
        image={heroImg}
      />

      <Section>
        <SectionHeader eyebrow={text("community", "subheading", "Community")} title="Our Community Initiatives" />

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
        ) : rows.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Community initiatives will be announced here soon.</p>
        ) : (
          <div className={`grid gap-6 ${rows.length > 1 ? "md:grid-cols-2 lg:grid-cols-3" : "mx-auto max-w-2xl"}`}>
            {rows.map((item: SectionItem) => <OutreachCard key={item.id} item={item} />)}
          </div>
        )}
      </Section>
    </>
  );
}

function OutreachCard({ item }: { item: SectionItem }) {
  const href = (item.cta_href ?? "").trim() || "https://uksmegrowthsummit.co.uk/";
  const internal = href.startsWith("/");
  const badge = item.badge_label?.trim();
  const label = item.cta_label?.trim() || "Register Now";
  const image = mediaUrl(item.image_url);

  return (
    <article className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5 transition hover:shadow-elegant">
      {image && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img src={image} alt={item.title ?? "Community initiative"} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          {badge && (
            <span className="absolute left-4 top-4 rounded-full gradient-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">{badge}</span>
          )}
        </div>
      )}
      <div className="p-6">
        <h2 className="font-display text-xl font-bold">{item.title}</h2>
        {item.body && <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>}
        {href && (
          internal ? (
            <Link to={href} className="mt-4 inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant">
              {label} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant">
              {label} <ExternalLink className="h-4 w-4" />
            </a>
          )
        )}
      </div>
    </article>
  );
}
