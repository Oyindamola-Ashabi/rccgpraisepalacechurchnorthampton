import { useSiteSettings } from "@/lib/cms";
import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { Calendar, MapPin, Shield, Users, Flame, Mail, Phone } from "lucide-react";
import { eventPhotos } from "@/lib/gallery-images";
const mensImg = { url: eventPhotos.men.url };

export const Route = createFileRoute("/ministries/mens-fellowship")({
  head: () => ({
    meta: [
      { title: "Men Fellowship — RCCG Praise Palace Northampton" },
      { name: "description", content: "The Men Fellowship at RCCG Praise Palace Northampton — raising godly men through prayer, brotherhood and purpose." },
      { property: "og:title", content: "Men Fellowship — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Raising godly men of purpose, prayer and brotherhood." },
      { property: "og:url", content: "/ministries/mens-fellowship" },
    ],
    links: [{ rel: "canonical", href: "/ministries/mens-fellowship" }],
  }),
  component: MensFellowshipPage,
});

function MensFellowshipPage() {
  const settings = useSiteSettings();
  return (
    <>
      <PageHero
        eyebrow="Men Fellowship"
        title={<>Iron Sharpens <span className="text-[#F0DE51]">Iron.</span></>}
        subtitle="A brotherhood of men committed to Christ, family and destiny."
        image={mensImg.url}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <img src={mensImg.url} alt="Men Fellowship" className="rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]" loading="lazy" />
          <div>
            <SectionHeader
              center={false}
              eyebrow="Who We Are"
              title={<>Men of <span className="text-gradient-brand">Purpose</span></>}
            />
            <p className="text-muted-foreground leading-relaxed">
              The Men Fellowship exists to raise a generation of godly men — husbands, fathers, leaders and kingdom builders. We gather to pray, study God's word and hold one another accountable.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Every man has a calling. Together, we discover it, walk in it and finish strong.
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
              { icon: Shield, title: "Accountability Circles", desc: "Small groups where men grow in truth, honesty and courage." },
              { icon: Flame, title: "Prayer Breakfast", desc: "Monthly gathering — food, fellowship and fervent prayer." },
              { icon: Users, title: "Mentorship", desc: "Seasoned fathers walking with younger men through every season." },
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
        <SectionHeader eyebrow="Upcoming" title="Men's Events" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Men's Prayer Breakfast", date: "Sat, 05 Sep 2026", loc: "Praise Palace Hall" },
            { title: "Fathers & Sons Day Out", date: "Sat, 17 Oct 2026", loc: "Northampton Park" },
            { title: "Men of Valour Conference", date: "Fri–Sat, 13–14 Nov 2026", loc: "Main Auditorium" },
          ].map((e) => (
            <div key={e.title} className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
              <div className="inline-block rounded-full gradient-brand text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1">Men</div>
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
          <SectionHeader eyebrow="Get in Touch" title="Reach the Men's Team" />
          <div className="mx-auto max-w-2xl rounded-2xl bg-card p-8 shadow-card ring-1 ring-black/5 grid gap-4 sm:grid-cols-2">
            <a href="mailto:rccgpraisepalace01@gmail.com" className="flex items-center gap-3 hover:text-[#E13495]">
              <Mail className="h-5 w-5 text-[#E13495]" /> rccgpraisepalace01@gmail.com
            </a>
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="flex items-center gap-3 hover:text-[#E13495]">
                <Phone className="h-5 w-5 text-[#E13495]" /> {settings.phone}
              </a>
            )}
          </div>
        </Section>
      </section>
    </>
  );
}
