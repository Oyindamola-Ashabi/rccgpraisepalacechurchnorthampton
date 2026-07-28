import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { HandHeart, Landmark, Gift } from "lucide-react";
import heroImg from "@/assets/hero-worship.jpg";
import { useGivingContent, useSiteSettings, textOr, usePageContent } from "@/lib/cms";

export const Route = createFileRoute("/give")({
  head: () => ({
    meta: [
      { title: "Give — RCCG Praise Palace Northampton" },
      { name: "description", content: "Give tithes, offerings and support the mission of RCCG Praise Palace Northampton." },
      { property: "og:title", content: "Give — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Partner with us to advance the gospel." },
      { property: "og:url", content: "/give" },
    ],
    links: [{ rel: "canonical", href: "/give" }],
  }),
  component: GivePage,
});

function GivePage() {
  const giving = useGivingContent();
  const { text, image } = usePageContent("give");
  const settings = useSiteSettings();

  return (
    <>
      <PageHero
        eyebrow={text("hero", "subheading", "Partnership")}
        title={text("hero", "headline", "Give Cheerfully")}
        subtitle={textOr(giving?.intro_text, text("hero", "body", "Bring your tithes into the storehouse — and see the windows of heaven open."))}
        image={giving?.image_url ?? image("hero", heroImg)}
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: HandHeart, title: "Tithe & Offering", desc: "Give faithfully to the storehouse — Malachi 3:10." },
            { icon: Gift, title: "Seed Giving", desc: "Sow into specific projects and causes close to your heart." },
            { icon: Landmark, title: "Church Building", desc: "Partner with us in expanding the reach of the gospel." },
          ].map((g) => (
            <div key={g.title} className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-brand text-white shadow-elegant">
                <g.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display font-bold text-xl">{g.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{g.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="bg-secondary/40 border-y">
        <Section>
          <SectionHeader
            eyebrow={text("bank_details", "subheading", "How To Give")}
            title={text("bank_details", "headline", "Bank Transfer Details")}
            subtitle={textOr(giving?.instructions, "Please contact the church office for our current bank details or to set up a standing order.")}
          />
          <div className="mx-auto max-w-xl rounded-2xl bg-card p-8 shadow-card ring-1 ring-black/5 text-center">
            {giving?.payment_details ? (
              <pre className="whitespace-pre-wrap text-left font-sans text-sm text-muted-foreground">{giving.payment_details}</pre>
            ) : (
              <p className="text-muted-foreground">
                For giving details, standing orders, or Gift Aid enrolment, please reach out to us.
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {giving?.cta_href ? (
                <BrandButton href={giving.cta_href}>{textOr(giving.cta_label, "Give Now")}</BrandButton>
              ) : (
                <BrandButton to="/contact">Contact Office</BrandButton>
              )}
              {settings.email && (
                <BrandButton href={`mailto:${settings.email}`} variant="gold">Email Us</BrandButton>
              )}
              {giving?.external_link && (
                <BrandButton href={giving.external_link} variant="gold">Online Giving</BrandButton>
              )}
            </div>
          </div>
        </Section>
      </section>
    </>
  );
}
