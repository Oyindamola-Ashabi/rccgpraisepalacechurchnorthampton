import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Users, CalendarDays } from "lucide-react";
import { PageHero, Section, BrandButton } from "@/components/section-ui";
import { Paragraphs } from "@/components/rich-text";
import { supabase } from "@/integrations/supabase/client";
import { mediaUrl, type Ministry } from "@/lib/cms";
import heroImg from "@/assets/hero-worship.jpg";

export const Route = createFileRoute("/ministries/$slug")({
  head: () => ({
    meta: [
      { title: "Ministry — RCCG Praise Palace Northampton" },
      { name: "description", content: "Discover this ministry of RCCG Praise Palace Northampton — belong, grow and serve with us." },
      { property: "og:title", content: "Ministry — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Belong, grow and serve with us at RCCG Praise Palace Northampton." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MinistryDetailPage,
  errorComponent: ({ error }) => (
    <Section>
      <p role="alert" className="text-center text-sm text-muted-foreground">{error.message}</p>
    </Section>
  ),
  notFoundComponent: () => <MinistryMissing />,
});

function MinistryDetailPage() {
  const { slug } = Route.useParams();
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("ministries")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setMinistry((data as any) ?? null);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <Section>
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
      </Section>
    );
  }

  if (!ministry) return <MinistryMissing />;

  const image = mediaUrl(ministry.image_url) || heroImg;
  const link = ministry.link_url ?? undefined;
  const external = !!link && /^https?:/.test(link);

  return (
    <>
      <PageHero
        eyebrow="Our Ministries"
        title={ministry.name}
        subtitle={ministry.short_description ?? undefined}
        image={image}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 items-start">
          <img
            src={image}
            alt={ministry.name}
            loading="lazy"
            className="rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = heroImg; }}
          />
          <div>
            <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight">{ministry.name}</h2>
            <div className="mt-5 text-muted-foreground leading-relaxed">
              <Paragraphs text={ministry.full_description ?? ministry.short_description ?? "More details about this ministry are coming soon."} />
            </div>

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              {ministry.leader && (
                <p className="flex items-center gap-2"><Users className="h-4 w-4 text-[#E13495]" /> <span className="font-semibold">Leader:</span> {ministry.leader}</p>
              )}
              {ministry.meeting_info && (
                <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#E13495]" /> <span className="font-semibold">Meets:</span> {ministry.meeting_info}</p>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <BrandButton to="/contact">Get in Touch</BrandButton>
              <BrandButton to="/plan-a-visit" variant="outline">Plan a Visit</BrandButton>
              {link && external && (
                <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 self-center text-sm font-semibold text-[#E13495] hover:underline">
                  Visit site <ArrowRight className="h-4 w-4" />
                </a>
              )}
              {link && !external && (
                <Link to={link} className="inline-flex items-center gap-1 self-center text-sm font-semibold text-[#E13495] hover:underline">
                  Learn more <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>

            <Link to="/ministries" className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-[#E13495] hover:underline">
              All ministries <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}

function MinistryMissing() {
  return (
    <Section>
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-display text-3xl font-bold">Ministry not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This ministry may have been renamed or is no longer active.
        </p>
        <div className="mt-6 flex justify-center">
          <BrandButton to="/ministries">Back to Ministries</BrandButton>
        </div>
      </div>
    </Section>
  );
}
