import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { Calendar, MapPin, Clock, ArrowRight, Play } from "lucide-react";
import couplesImg from "@/assets/couples.jpg";
import youthImg from "@/assets/youth.jpg";
import podcastImg from "@/assets/podcast.jpg";
import worshipImg from "@/assets/worship-team.jpg";
import sermonImg from "@/assets/sermon.jpg";
import communityImg from "@/assets/community.jpg";
import heroImg from "@/assets/hero-worship.jpg";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — PraisePalace Church" },
      { name: "description", content: "Upcoming events, conferences and gatherings at PraisePalace Church." },
      { property: "og:title", content: "Events — PraisePalace Church" },
      { property: "og:description", content: "Join our upcoming gatherings, conferences and worship experiences." },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsPage,
});

const events = [
  { image: couplesImg, tag: "Couples", title: "Love & Legacy Couples Night", date: "Sat, 15 Aug 2026", time: "6:00 PM", location: "PraisePalace Auditorium", to: "/events/couples" },
  { image: youthImg, tag: "Youth", title: "Youth Camp 2026", date: "Fri, 20 Jun 2026", time: "All Day", location: "Sanctuary Grounds" },
  { image: podcastImg, tag: "Podcast", title: "Praise Talks Live Recording", date: "Wed, 09 Jul 2026", time: "7:30 PM", location: "Studio B" },
  { image: worshipImg, tag: "Worship", title: "Night of Worship & Praise", date: "Fri, 25 Jul 2026", time: "8:00 PM", location: "Main Sanctuary" },
  { image: sermonImg, tag: "Conference", title: "Annual Convention 2026", date: "Thu–Sun, 10–13 Sep", time: "Multiple", location: "Newport Pagnell" },
  { image: communityImg, tag: "Outreach", title: "Community Impact Day", date: "Sat, 04 Oct 2026", time: "10:00 AM", location: "Howard Way" },
];

function EventsPage() {
  return (
    <>
      <PageHero eyebrow="Gather With Us" title="Upcoming Events" subtitle="Life-shaping moments of worship, teaching and connection." image={heroImg} />

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <article key={e.title} className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5 hover:-translate-y-1 transition">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={e.image} alt={e.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                <span className="absolute top-3 left-3 rounded-full gradient-brand text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1">{e.tag}</span>
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-lg leading-tight">{e.title}</h3>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#E13495]" /> {e.date}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#E13495]" /> {e.time}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#E13495]" /> {e.location}</div>
                </div>
                {e.to ? (
                  <Link to={e.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E13495]">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E13495]">
                    Save the date <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <section className="bg-secondary/40 border-y">
        <Section>
          <SectionHeader eyebrow="Highlights" title="Event Videos" subtitle="A glimpse of the atmosphere at PraisePalace gatherings." />
          <div className="grid gap-6 md:grid-cols-2">
            {[worshipImg, sermonImg].map((img, i) => (
              <div key={i} className="group relative aspect-video overflow-hidden rounded-2xl shadow-card">
                <img src={img} alt="Event highlight" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition grid place-items-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full gradient-brand text-white shadow-elegant">
                    <Play className="h-7 w-7 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </section>
    </>
  );
}
