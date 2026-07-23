import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { Calendar, MapPin, Heart, Users, Sparkles, Mail, Phone } from "lucide-react";
import { eventPhotos } from "@/lib/gallery-images";
const womenImg = { url: eventPhotos.women.url };

export const Route = createFileRoute("/ministries/womens-fellowship")({
  head: () => ({
    meta: [
      { title: "Women Fellowship — RCCG Praise Palace Northampton" },
      { name: "description", content: "The Women Fellowship at RCCG Praise Palace Northampton — a sisterhood of grace, prayer and purpose." },
      { property: "og:title", content: "Women Fellowship — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "A sisterhood of grace, prayer and purpose." },
      { property: "og:url", content: "/ministries/womens-fellowship" },
    ],
    links: [{ rel: "canonical", href: "/ministries/womens-fellowship" }],
  }),
  component: WomensFellowshipPage,
});

function WomensFellowshipPage() {
  return (
    <>
      <PageHero
        eyebrow="Women Fellowship"
        title={<>Daughters of <span className="text-[#F0DE51]">Grace.</span></>}
        subtitle="A sisterhood pursuing Christ, purpose and one another."
        image={womenImg.url}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <img src={womenImg.url} alt="Women Fellowship" className="rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]" loading="lazy" />
          <div>
            <SectionHeader
              center={false}
              eyebrow="Who We Are"
              title={<>A Sisterhood of <span className="text-gradient-brand">Grace</span></>}
            />
            <p className="text-muted-foreground leading-relaxed">
              The Women Fellowship at Praise Palace is a home for every woman — daughters, wives, mothers and leaders — walking the journey of faith together with joy, honesty and courage.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              We pray, we worship, we serve, and we build one another up in love.
            </p>
            <div className="mt-6">
              <BrandButton to="/book-appointment">Speak With A Pastor</BrandButton>
            </div>
          </div>
        </div>
      </Section>

      <section className="bg-secondary/40 border-y">
        <Section>
          <SectionHeader eyebrow="What We Do" title="Our Rhythms" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Heart, title: "Sister Circles", desc: "Small groups sharing life, scripture and prayer." },
              { icon: Sparkles, title: "Worship Nights", desc: "Evenings of praise, prophecy and encounter." },
              { icon: Users, title: "Outreach & Care", desc: "Serving the vulnerable in our city with love and hope." },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
                <div className="grid h-12 w-12 place-items-center rounded-xl gradient-brand text-white shadow-elegant">
                  <c.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display font-bold text-xl">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <Section>
        <SectionHeader eyebrow="Upcoming" title="Women's Events" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Women's Worship Night", date: "Fri, 12 Sep 2026", loc: "Main Auditorium" },
            { title: "Sisters' High Tea", date: "Sat, 25 Oct 2026", loc: "Fellowship Hall" },
            { title: "Daughters of Grace Conference", date: "Fri–Sun, 07–09 Nov 2026", loc: "Praise Palace" },
          ].map((e) => (
            <div key={e.title} className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
              <div className="inline-block rounded-full gradient-brand text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1">Women</div>
              <h3 className="mt-3 font-display font-bold text-lg">{e.title}</h3>
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#E13495]" /> {e.date}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#E13495]" /> {e.loc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <section className="bg-secondary/40 border-y">
        <Section>
          <SectionHeader eyebrow="Get in Touch" title="Reach the Women's Team" />
          <div className="mx-auto max-w-2xl rounded-2xl bg-card p-8 shadow-card ring-1 ring-black/5 grid gap-4 sm:grid-cols-2">
            <a href="mailto:rccgpraisepalace01@gmail.com" className="flex items-center gap-3 hover:text-[#E13495]">
              <Mail className="h-5 w-5 text-[#E13495]" /> rccgpraisepalace01@gmail.com
            </a>
            <a href="tel:+447000000000" className="flex items-center gap-3 hover:text-[#E13495]">
              <Phone className="h-5 w-5 text-[#E13495]" /> +44 7000 000 000
            </a>
          </div>
        </Section>
      </section>
    </>
  );
}
