import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { VideoEmbed } from "@/components/video-embed";
import { Calendar, MapPin, Clock, ArrowRight, CalendarPlus } from "lucide-react";
import heroImg from "@/assets/hero-worship.jpg";
import { eventPhotos, galleryPhotos } from "@/lib/gallery-images";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — RCCG Praise Palace Northampton" },
      { name: "description", content: "Upcoming events, conferences and gatherings at RCCG Praise Palace Northampton." },
      { property: "og:title", content: "Events — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Join our upcoming gatherings, conferences and worship experiences." },
      { property: "og:url", content: "/events" },
      { property: "og:image", content: eventPhotos.couples.url },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsPage,
});

const events = [
  { image: eventPhotos.couples.url, tag: "Couples", title: "Love & Legacy Couples Retreat", date: "Sat, 15 Aug 2026", time: "6:00 PM", location: "PraisePalace Auditorium", to: "/events/couples" },
  { image: eventPhotos.family.url, tag: "Youth", title: "Youth Camp 2026", date: "Fri, 20 Jun 2026", time: "All Day", location: "Sanctuary Grounds" },
  { image: eventPhotos.wordEvening.url, tag: "Podcast", title: "Praise Talks Live Recording", date: "Wed, 09 Jul 2026", time: "7:30 PM", location: "Studio B" },
  { image: eventPhotos.dinner.url, tag: "Worship", title: "Night of Worship & Praise", date: "Fri, 25 Jul 2026", time: "8:00 PM", location: "Main Sanctuary" },
  { image: eventPhotos.fathers.url, tag: "Celebration", title: "Fathers' Honour Sunday", date: "Sun, 21 Jun 2026", time: "10:00 AM", location: "Main Sanctuary" },
  { image: eventPhotos.familyLife.url, tag: "Outreach", title: "Family Life Class", date: "Sat, 04 Oct 2026", time: "10:00 AM", location: "Howard Way" },
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
                  <Link to={e.to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E13495] hover:underline">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => saveToCalendar(e.title, e.date, e.time, e.location)}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E13495] hover:underline"
                  >
                    <CalendarPlus className="h-4 w-4" /> Save the date
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
            <VideoEmbed poster={worshipImg} title="Night of Worship" searchQuery="PraisePalace Church night of worship" />
            <VideoEmbed poster={sermonImg} title="Annual Convention Highlights" searchQuery="PraisePalace Church convention" />
          </div>
        </Section>
      </section>
    </>
  );
}

function saveToCalendar(title: string, dateStr: string, time: string, location: string) {
  // Best-effort .ics generation from human-readable date; falls back to today.
  const parsed = new Date(dateStr.replace(/^[A-Za-z]+,\s*/, ""));
  const start = isNaN(parsed.getTime()) ? new Date() : parsed;
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PraisePalace Church//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@praisepalace.church`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${title} — ${time} — PraisePalace Church`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
