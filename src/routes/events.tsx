import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { VideoEmbed } from "@/components/video-embed";
import { Calendar, MapPin, Clock, ArrowRight, CalendarPlus } from "lucide-react";
import heroImg from "@/assets/hero-worship.jpg";
import { eventPhotos } from "@/lib/gallery-images";
import { usePublishedEvents, formatEventDate, formatEventTime } from "@/lib/cms";

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

/** Built-in events kept alongside anything added in the admin area. */
const FALLBACK_EVENTS = [
  { start: "2026-08-15T17:00:00Z", image: eventPhotos.celebration.url, tag: "Couples", title: "Love & Legacy Couples Retreat", date: "Sat, 15 Aug 2026", time: "6:00 PM", location: "Praise Palace Auditorium", to: "/events/couples" },
  { start: "2026-06-20T08:00:00Z", image: eventPhotos.youth.url, tag: "Youth", title: "Raising Champions Youth Camp 2026", date: "Fri, 20 Jun 2026", time: "All Day", location: "Sanctuary Grounds" },
  { start: "2026-07-09T18:30:00Z", image: eventPhotos.tableFellowship.url, tag: "Podcast", title: "Praise Talks Live Recording", date: "Wed, 09 Jul 2026", time: "7:30 PM", location: "Studio B" },
  { start: "2026-07-25T19:00:00Z", image: eventPhotos.dinner.url, tag: "Worship", title: "Night of Worship & Praise", date: "Fri, 25 Jul 2026", time: "8:00 PM", location: "Main Sanctuary" },
  { start: "2026-06-21T09:00:00Z", image: eventPhotos.fathers.url, tag: "Celebration", title: "Fathers' Honour Sunday", date: "Sun, 21 Jun 2026", time: "10:00 AM", location: "Main Sanctuary" },
  { start: "2026-10-04T09:00:00Z", image: eventPhotos.familyMeals.url, tag: "Outreach", title: "Family Life Class", date: "Sat, 04 Oct 2026", time: "10:00 AM", location: "Briar Hill Community Centre" },
];

type EventCardData = {
  start: number;
  image: string;
  tag: string;
  title: string;
  date: string;
  time: string;
  location: string;
  to?: string;
  href?: string;
  description?: string;
};

function EventsPage() {
  const { rows } = usePublishedEvents();
  const now = Date.now();

  // Admin-managed events come first; built-in ones are kept unless the admin
  // already manages an event with the same name. Past events are never shown.
  const fromCms: EventCardData[] = rows.map((e) => {
    const link = e.registration_url ?? undefined;
    const internal = !!link && link.startsWith("/");
    return {
      start: new Date(e.start_at).getTime(),
      image: e.image_url ?? heroImg,
      tag: e.is_featured ? "Featured" : "Event",
      title: e.title,
      date: formatEventDate(e.start_at),
      time: formatEventTime(e.start_at),
      location: e.venue ?? "RCCG Praise Palace Northampton",
      to: internal ? link : undefined,
      href: internal ? undefined : link,
      description: e.description ?? undefined,
    };
  });

  const cmsTitles = new Set(fromCms.map((e) => e.title.toLowerCase()));
  const fromBuiltIn: EventCardData[] = FALLBACK_EVENTS.filter(
    (e) => new Date(e.start).getTime() >= now && !cmsTitles.has(e.title.toLowerCase()),
  ).map((e) => ({ ...e, start: new Date(e.start).getTime(), to: (e as any).to as string | undefined }));

  const events = [...fromCms, ...fromBuiltIn]
    .filter((e) => e.start >= now)
    .sort((a, b) => a.start - b.start);


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
                {e.description && <p className="mt-3 text-sm text-muted-foreground">{e.description}</p>}
                {e.href ? (
                  <a href={e.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E13495] hover:underline">
                    Register <ArrowRight className="h-4 w-4" />
                  </a>
                ) : e.to ? (
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
          <SectionHeader eyebrow="Highlights" title="Event Videos" subtitle="A glimpse of the atmosphere at Praise Palace gatherings." />
          <div className="grid gap-6 md:grid-cols-2">
            <VideoEmbed poster={eventPhotos.modernWorship.url} title="Night of Worship" searchQuery="RCCG Praise Palace Northampton worship" />
            <VideoEmbed poster={eventPhotos.celebration.url} title="Annual Celebration Highlights" searchQuery="RCCG Praise Palace Northampton celebration" />
          </div>
          <div className="mt-10 text-center">
            <Link to="/media/gallery" className="inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95 transition">
              View Photo Gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      </section>
    </>
  );
}

function saveToCalendar(title: string, dateStr: string, time: string, location: string) {
  const parsed = new Date(dateStr.replace(/^[A-Za-z]+,\s*/, ""));
  const start = isNaN(parsed.getTime()) ? new Date() : parsed;
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RCCG Praise Palace Northampton//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@praisepalace.church`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${title} — ${time} — RCCG Praise Palace Northampton`,
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
