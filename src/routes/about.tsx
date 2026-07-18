import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { Heart, Target, Eye, Users, Images, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-worship.jpg";
import pastorAsset from "@/assets/pastor.jpg.asset.json";
const pastorsImg = pastorAsset.url;
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
      { title: "About — PraisePalace Church" },
      { name: "description", content: "Discover the story, vision and mission of PraisePalace Church — an RCCG parish in Newport Pagnell, UK." },
      { property: "og:title", content: "About PraisePalace Church" },
      { property: "og:description", content: "Our story, mission and pastors." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero eyebrow="Our Story" title="Who We Are" subtitle="A family church for all nations — a parish of the Redeemed Christian Church of God." image={heroImg} />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <img src={communityImg} alt="Community" className="rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]" loading="lazy" />
          <div>
            <SectionHeader
              center={false}
              eyebrow="Welcome"
              title={<>A House of <span className="text-gradient-brand">Praise & Purpose</span></>}
            />
            <p className="text-muted-foreground leading-relaxed">
              PraisePalace Church exists to raise a generation of worshippers rooted in the word of God and empowered by His Spirit. We believe every life has a divine purpose, and every story shall end in praise.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Located in Newport Pagnell, UK, we are a growing community of believers from many nations, united by our love for Jesus and our commitment to His kingdom.
            </p>
          </div>
        </div>
      </Section>

      <section className="bg-secondary/40 border-y">
        <Section>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Eye, title: "Our Vision", text: "To raise a global family of Christ-centred worshippers whose lives end in praise." },
              { icon: Target, title: "Our Mission", text: "To reach the lost, disciple the found, and empower every believer to walk in purpose." },
              { icon: Heart, title: "Our Values", text: "Prayer, worship, love, integrity and unwavering faith in the finished work of Christ." },
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

      <Section>
        <SectionHeader eyebrow="Leadership" title="Our Pastor" subtitle="Dedicated servant leading the PraisePalace family with grace and truth." />
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <img src={pastorsImg} alt="Lead Pastor of PraisePalace Church" className="rounded-3xl shadow-elegant object-cover w-full max-w-md mx-auto aspect-[3/4]" loading="lazy" />
          <div>
            <h3 className="font-display font-bold text-3xl">Our Pastor</h3>
            <p className="mt-2 text-sm font-semibold text-[#E13495] uppercase tracking-widest">Lead Pastor</p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Our pastor is passionate about the spread of the gospel of Jesus Christ to the ends of the earth — evidenced by miracles, signs and wonders as in the days of the apostles. He has dedicated his life to the cause of Christ, having pastored various other parishes of the RCCG before founding PraisePalace.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              He believes deeply in prayer as a potent key to realising every person's divine purpose on the earth.
            </p>
            <div className="mt-6"><BrandButton to="/contact">Get in Touch</BrandButton></div>
          </div>
        </div>
      </Section>

      <section className="bg-secondary/40 border-y">
        <Section>
          <SectionHeader eyebrow="Our Family" title="Life at Praise Palace" subtitle="Moments of fellowship, worship and joy across our community." />
          <div className="grid gap-4 md:grid-cols-3">
            {galleryPhotos.slice(0, 6).map((p) => (
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
            <BrandButton to="/contact" variant="gold">Plan a Visit</BrandButton>
            <BrandButton to="/events" variant="outline">See Events</BrandButton>
          </div>
        </div>
      </section>
    </>
  );
}
