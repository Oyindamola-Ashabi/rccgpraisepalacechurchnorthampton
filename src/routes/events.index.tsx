import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/section-ui";
import { Calendar, MapPin, Clock, ArrowRight, CalendarPlus } from "lucide-react";
import heroImg from "@/assets/hero-worship.jpg";
import { eventPhotos } from "@/lib/gallery-images";
import { usePublishedEvents, formatEventDate, formatEventTime, eventEndsAt, type ChurchEvent } from "@/lib/cms";
import { useState } from "react";

export const Route = createFileRoute("/events/")({
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

type EventCardData = {
  id: string;
  start: number;
  image: string;
  tag: string | null;
  title: string;
  date: string;
  time: string;
  location: string;
  to?: string;
  href?: string;
  description?: string;
};

function toCard(e: ChurchEvent & { detail_page?: string | null }): EventCardData {
  const link = e.detail_page ?? e.registration_url ?? undefined;
  const internal = !!link && link.startsWith("/");
  return {
    id: e.id,
    start: new Date(e.start_at).getTime(),
    image: e.image_url ?? heroImg,
    tag: e.badge_label?.trim() || null,
    title: e.title,
    date: formatEventDate(e.start_at),
    time: formatEventTime(e.start_at),
    location: e.venue ?? "RCCG Praise Palace Northampton",
    to: internal ? link : undefined,
    href: internal ? undefined : link,
    description: e.description ?? undefined,
  };
}

function EventsPage() {
  const { rows } = usePublishedEvents();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const now = Date.now();

  // Upcoming / past is worked out automatically from the event dates:
  // an event stays upcoming until its end date (or start date) has passed.
  const events = rows
    .filter((e) => eventEndsAt(e) >= now)
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
    .map((e) => toCard(e as any));

  const pastEvents = rows
    .filter((e) => eventEndsAt(e) < now)
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime())
    .map((e) => toCard(e as any));

  const shown = tab === "upcoming" ? events : pastEvents;



  return (
    <>
      <PageHero eyebrow="Gather With Us" title="Upcoming Events" subtitle="Life-shaping moments of worship, teaching and connection." image={heroImg} />

      <Section>
        <div className="mb-8 flex justify-center gap-2">
          {(["upcoming", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                tab === t ? "gradient-brand text-white shadow-elegant" : "border text-foreground/70 hover:bg-secondary/60"
              }`}
            >
              {t === "upcoming" ? `Upcoming (${events.length})` : `Past (${pastEvents.length})`}
            </button>
          ))}
        </div>

        {shown.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {tab === "upcoming" ? "No upcoming events right now — please check back soon." : "No past events recorded yet."}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((e) => (
            <article key={e.id} className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5 hover:-translate-y-1 transition">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={e.image} alt={e.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                {e.tag && <span className="absolute top-3 left-3 rounded-full gradient-brand text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1">{e.tag}</span>}
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
          <div className="text-center">
            <Link to="/events/albums" className="inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95 transition">
              View Photo & Video Albums <ArrowRight className="h-4 w-4" />
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
