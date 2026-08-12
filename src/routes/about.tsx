import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { CmsPageHero } from "@/components/cms-page-hero";
import { usePageContent, useSectionItems, imageOr } from "@/lib/cms";
import { Highlight, Paragraphs } from "@/components/rich-text";
import { Heart, Target, Eye, Users, Images, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-worship.jpg";
import pastorAsset from "@/assets/pastor.jpg";
const pastorsImg = pastorAsset;
import { eventPhotos } from "@/lib/gallery-images";
const communityImg = eventPhotos.students.url;

// Curated Life at Praise Palace mosaic — 6 unique images.
const lifePhotos = [
  eventPhotos.family,
  eventPhotos.fathers,
  eventPhotos.guests,
  eventPhotos.familyMeals,
  eventPhotos.familyLife,
  eventPhotos.tableFellowship,
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — RCCG Praise Palace Northampton" },
      { name: "description", content: "Discover the story, vision and mission of RCCG Praise Palace Northampton — a Redeemed Christian Church of God parish." },
      { property: "og:title", content: "About RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Our story, mission and pastors." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { text, image, visible } = usePageContent("about");
  const { rows: lifeItems } = useSectionItems("about", "life_gallery");
  const { rows: pastorItems } = useSectionItems("about", "pastor");

  /**
   * The Our Pastor card is a CMS record, so the name, role, biography, photo
   * and button are all editable. The original wording remains as a fallback so
   * the page never appears empty.
   */
  const pastorFallback = {
    name: "Pastor Abiodun Bamgbala",
    role: "Lead Pastor",
    bio: "Pastor Abiodun Bamgbala is passionate about the spread of the gospel of Jesus Christ to the ends of the earth — evidenced by miracles, signs and wonders as in the days of the apostles. He has dedicated his life to the cause of Christ, having pastored various other parishes of the RCCG before leading Praise Palace Northampton.\n\nHe believes deeply in prayer as a potent key to realising every person's divine purpose on the earth.",
    image: pastorsImg,
    ctaLabel: "Get in Touch",
    ctaHref: "/contact",
  };
  const pastorItem = pastorItems[0];
  const pastor = {
    name: pastorItem?.title?.trim() || pastorFallback.name,
    role: pastorItem?.subtitle?.trim() || pastorFallback.role,
    bio: pastorItem?.body?.trim() || pastorFallback.bio,
    image: imageOr(pastorItem?.image_url, image("pastor", pastorFallback.image)),
    ctaLabel: pastorItem?.cta_label?.trim() || pastorFallback.ctaLabel,
    ctaHref: pastorItem?.cta_href?.trim() || pastorFallback.ctaHref,
  };
  const showPastor = visible("pastor");

  /** Administrators can replace these photos card-by-card in Admin → Page Content → About. */
  const lifeImages = lifeItems.length
    ? lifeItems.map((it, i) => ({
        url: imageOr(it.image_url, lifePhotos[i % lifePhotos.length].url),
        title: it.title ?? lifePhotos[i % lifePhotos.length].title,
      }))
    : lifePhotos.map((p) => ({ url: p.url, title: p.title }));


  return (
    <>
      <CmsPageHero page="about" eyebrow="Our Story" title="Who We Are" subtitle="A family church for all nations — a parish of the Redeemed Christian Church of God." image={heroImg} />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <img src={image("welcome", communityImg)} alt="Community" className="rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]" loading="lazy" />
          <div>
            <SectionHeader
              center={false}
              eyebrow={text("welcome", "subheading", "Welcome")}
              title={<Highlight text={text("welcome", "headline", "A House of *Praise & Purpose*")} />}
            />
            <div className="text-muted-foreground leading-relaxed">
              <Paragraphs text={text("welcome", "body", "RCCG Praise Palace Northampton exists to raise a generation of worshippers rooted in the word of God and empowered by His Spirit. We believe every life has a divine purpose, and every story shall end in praise.\n\nLocated at Briar Hill Community Centre, Northampton, we are a growing community of believers from many nations, united by our love for Jesus and our commitment to His kingdom.")} />
            </div>
          </div>
        </div>
      </Section>

      <section className="bg-secondary/40 border-y">
        <Section>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Eye, title: text("vision", "headline", "Our Vision"), text: text("vision", "body", "To raise a global family of Christ-centred worshippers whose lives end in praise.") },
              { icon: Target, title: text("mission", "headline", "Our Mission"), text: text("mission", "body", "To reach the lost, disciple the found, and empower every believer to walk in purpose.") },
              { icon: Heart, title: text("values", "headline", "Our Values"), text: text("values", "body", "Prayer, worship, love, integrity and unwavering faith in the finished work of Christ.") },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl bg-card p-8 shadow-card ring-1 ring-black/5">
                <div className="grid h-12 w-12 place-items-center rounded-xl gradient-brand text-white shadow-elegant">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display font-bold text-xl">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      {showPastor && (
        <Section>
          <SectionHeader
            eyebrow={text("pastor", "subheading", "Leadership")}
            title={text("pastor", "headline", "Our Pastor")}
            subtitle={text("pastor", "body", "Dedicated servant leading the RCCG Praise Palace Northampton family with grace and truth.")}
          />
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <img src={pastor.image} alt={pastor.name} className="rounded-3xl shadow-elegant object-cover w-full max-w-md mx-auto aspect-[3/4]" loading="lazy" />
            <div>
              <h3 className="font-display font-bold text-3xl">{pastor.name}</h3>
              <p className="mt-2 text-sm font-semibold text-[#E13495] uppercase tracking-widest">{pastor.role}</p>
              <div className="mt-4 text-muted-foreground leading-relaxed">
                <Paragraphs text={pastor.bio} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {pastor.ctaHref.startsWith("/") ? (
                  <BrandButton to={pastor.ctaHref}>{pastor.ctaLabel}</BrandButton>
                ) : (
                  <BrandButton href={pastor.ctaHref}>{pastor.ctaLabel}</BrandButton>
                )}
                {pastor.ctaHref !== "/book-appointment" && (
                  <BrandButton to="/book-appointment" variant="soft">Book Appointment</BrandButton>
                )}

              </div>


            </div>
          </div>
        </Section>
      )}

      <section className="bg-secondary/40 border-y">
        <Section>
          <SectionHeader
            eyebrow={text("life_gallery", "subheading", "Our Family")}
            title={text("life_gallery", "headline", "Life at Praise Palace")}
            subtitle={text("life_gallery", "body", "Moments of fellowship, worship and joy across our community.")}
          />
          <div className="grid gap-4 md:grid-cols-3">
            {lifeImages.map((p) => (
              <img key={p.url} src={p.url} alt={p.title} className="rounded-2xl shadow-card object-cover w-full aspect-[4/3]" loading="lazy" />
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/media/gallery" className="inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95 transition">
              <Images className="h-4 w-4" /> View Full Gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center text-white">
          <Users className="h-10 w-10 mx-auto mb-4 text-[#F0DE51]" />
          <h2 className="font-display font-bold text-3xl md:text-4xl">Come and Belong.</h2>
          <p className="mt-3 text-white/90 max-w-2xl mx-auto">Whether you're seeking, believing, or just curious — there's a seat waiting for you.</p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <BrandButton to="/plan-a-visit" variant="gold">Plan a Visit</BrandButton>
            <BrandButton to="/events" variant="outline">See Events</BrandButton>
          </div>
        </div>
      </section>
    </>
  );
}
