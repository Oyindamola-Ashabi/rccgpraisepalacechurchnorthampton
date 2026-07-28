import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Quote } from "lucide-react";
import { PageHero, Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { usePublishedTestimonies } from "@/lib/cms";
import heroImg from "@/assets/hero-worship.jpg";

export const Route = createFileRoute("/testimonies")({
  head: () => ({
    meta: [
      { title: "Testimonies — RCCG Praise Palace Northampton" },
      { name: "description", content: "Read testimonies of God's goodness shared by members and friends of RCCG Praise Palace Northampton." },
      { property: "og:title", content: "Testimonies — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Stories of answered prayer, healing and grace from our church family." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/testimonies" },
    ],
    links: [{ rel: "canonical", href: "/testimonies" }],
  }),
  component: TestimoniesPage,
});

function TestimoniesPage() {
  const { rows, loading } = usePublishedTestimonies();

  return (
    <>
      <PageHero
        eyebrow="Praise Reports"
        title={<>Testimonies of <span className="text-[#F0DE51]">His Goodness</span></>}
        subtitle="Every story here was shared by someone in our church family and published with their permission."
        image={heroImg}
      />

      <Section>
        <SectionHeader
          eyebrow="It Shall End In Praise"
          title="What God Has Done"
          subtitle="Answered prayers, healings, open doors and quiet miracles — shared to build your faith."
        />

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
        ) : rows.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No testimonies have been published yet. Yours could be the first — we would love to hear it.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rows.map((t) => (
              <article key={t.id} className="flex flex-col rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
                <Quote className="h-6 w-6 text-[#E13495]" />
                <h2 className="mt-4 font-display text-lg font-bold">{t.title}</h2>
                <p className="mt-3 flex-1 whitespace-pre-wrap text-sm text-muted-foreground">{t.testimony}</p>
                <footer className="mt-5 border-t pt-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{t.full_name}</span>
                  {t.created_at && <> · {new Date(t.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</>}
                </footer>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-secondary/40 p-8 text-center ring-1 ring-black/5">
          <h3 className="font-display text-2xl font-bold">Has God done something for you?</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Share your testimony with us. With your consent, it may be published here after review by our team.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <BrandButton to="/share-testimony">Share Your Testimony</BrandButton>
            <Link to="/prayer-request" className="inline-flex items-center justify-center rounded-full border-2 px-6 py-3 text-sm font-semibold hover:border-[#E13495] hover:text-[#E13495]">
              Request Prayer
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
