import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { Calendar, MapPin, Heart, Users, Sparkles, Mail, Phone } from "lucide-react";
import { eventPhotos } from "@/lib/gallery-images";
const couplesImg = eventPhotos.couples.url;
const dinnerImg = eventPhotos.dinner.url;

export const Route = createFileRoute("/events/couples")({
  head: () => ({
    meta: [
      { title: "Couples Retreat — RCCG Praise Palace Northampton" },
      { name: "description", content: "Couples Retreat at RCCG Praise Palace Northampton — retreats, mentorship and date nights for God-honouring marriages." },
      { property: "og:title", content: "Couples Retreat — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Strengthening marriages through Christ." },
      { property: "og:url", content: "/events/couples" },
    ],
    links: [{ rel: "canonical", href: "/events/couples" }],
  }),
  component: CouplesPage,
});

function CouplesPage() {
  return (
    <>
      <PageHero eyebrow="Couples Retreat" title={<>Love. <span className="text-[#F0DE51]">Legacy.</span> Christ.</>} subtitle="Building marriages that reflect God's heart — one couple, one story at a time." image={couplesImg} />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <img src={dinnerImg} alt="Couples" className="rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]" loading="lazy" />
          <div>
            <SectionHeader
              center={false}
              eyebrow="Who We Are"
              title={<>A Community for <span className="text-gradient-brand">Marriages</span></>}
            />
            <p className="text-muted-foreground leading-relaxed">
              The Couples Ministry at PraisePalace exists to nurture marriages built on Christ. Through teaching, mentorship and shared experiences, we walk with couples through every season — dating and engaged, newly-married, seasoned and everything in between.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              We host retreats, date nights, dinners and honest conversations that celebrate love and equip couples for a lifetime of purpose together.
            </p>
          </div>
        </div>
      </Section>

      <section className="bg-secondary/40 border-y">
        <Section>
          <SectionHeader eyebrow="What We Offer" title="Ways to Get Involved" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Heart, title: "Date Nights", desc: "Curated evenings of connection, faith and fun for married couples." },
              { icon: Users, title: "Mentorship Circles", desc: "Small groups led by seasoned couples who walk alongside younger marriages." },
              { icon: Sparkles, title: "Marriage Retreats", desc: "Immersive weekends to reset, refocus and rekindle the flame." },
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
        <SectionHeader eyebrow="Upcoming" title="Couples Events" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Love & Legacy Night", date: "Sat, 15 Aug 2026", loc: "PraisePalace Auditorium" },
            { title: "Autumn Marriage Retreat", date: "Fri–Sun, 03–05 Oct", loc: "Cotswold Grange Hotel" },
            { title: "Date Night: Under The Stars", date: "Sat, 12 Nov 2026", loc: "Main Hall" },
          ].map((e) => (
            <div key={e.title} className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
              <div className="inline-block rounded-full gradient-brand text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1">Couples</div>
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
          <SectionHeader eyebrow="Get in Touch" title="Reach the Couples Team" />
          <div className="mx-auto max-w-2xl rounded-2xl bg-card p-8 shadow-card ring-1 ring-black/5 grid gap-4 sm:grid-cols-2">
            <a href="mailto:oyintesting@gmail.com" className="flex items-center gap-3 hover:text-[#E13495]">
              <Mail className="h-5 w-5 text-[#E13495]" /> oyintesting@gmail.com
            </a>
            <a href="tel:+447000000000" className="flex items-center gap-3 hover:text-[#E13495]">
              <Phone className="h-5 w-5 text-[#E13495]" /> +44 7000 000 000
            </a>
          </div>
          <div className="mt-8 text-center">
            <BrandButton to="/contact">Contact the Church</BrandButton>
          </div>
        </Section>
      </section>
    </>
  );
}
