import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Section, SectionHeader } from "@/components/section-ui";
import {
  Calendar,
  MapPin,
  Mail,
  Phone,
  Loader2,
  CheckCircle2,
  Clock,
  Quote,
  ArrowRight,
  Images,
  HeartHandshake,
} from "lucide-react";

import { eventPhotos } from "@/lib/gallery-images";
import { supabase } from "@/integrations/supabase/client";
import {
  usePageContent,
  useSectionItems,
  useCouplesRetreatEvents,
  useSiteSettings,
  formatEventDate,
  formatEventTime,
  eventKey,
  slugify,
  type ChurchEventRow,
} from "@/lib/cms";

const couplesImg = eventPhotos.couples.url;
const dinnerImg = eventPhotos.familyMeals.url;

/** Where "View Previous Couples Retreats" always goes — the one church gallery. */
const ALBUMS_TO = "/events/albums" as const;
const ALBUMS_SEARCH = { category: "couples-retreat" } as any;

export const Route = createFileRoute("/events/couples-retreat")({
  validateSearch: (search: Record<string, unknown>): { event?: string } =>
    typeof search.event === "string" ? { event: search.event } : {},
  head: () => ({
    meta: [
      { title: "Couples Retreat — RCCG Praise Palace Northampton" },
      {
        name: "description",
        content:
          "The Couples Retreat at RCCG Praise Palace Northampton — biblical teaching, fellowship and time away for married couples. Register your interest.",
      },
      { property: "og:title", content: "Couples Retreat — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Stronger together — growing in love, faith and partnership." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/events/couples-retreat" }],
  }),
  component: CouplesRetreatPage,
});

/** Splits the CMS Scripture field ("quote | reference") into its two parts. */
function splitScripture(value: string): { quote: string; reference: string } {
  const [quote, reference] = value.split("|");
  return { quote: (quote ?? "").trim(), reference: (reference ?? "").trim() };
}

function Paragraphs({ text, className = "" }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className={`leading-relaxed text-muted-foreground ${i > 0 ? "mt-4" : ""} ${className}`}>
            {p}
          </p>
        ))}
    </>
  );
}

function scrollToRegister() {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function RetreatButtons({ variant = "light" }: { variant?: "light" | "dark" }) {
  const secondary =
    variant === "dark"
      ? "border-2 border-white/70 text-white hover:bg-white hover:text-[#E13495]"
      : "border-2 border-border bg-card text-foreground hover:border-[#E13495] hover:text-[#E13495]";
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={scrollToRegister}
        className="inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95"
      >
        <HeartHandshake className="h-4 w-4" /> Register Your Interest
      </button>
      <Link
        to={ALBUMS_TO}
        search={ALBUMS_SEARCH}
        className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${secondary}`}
      >
        <Images className="h-4 w-4" /> View Previous Couples Retreats
      </Link>
    </div>
  );
}

function CouplesRetreatPage() {
  const { event: eventParam } = Route.useSearch();
  const { text, image, visible } = usePageContent("couples-retreat");
  const settings = useSiteSettings();
  const { rows: retreats } = useCouplesRetreatEvents();
  const { rows: expectItems } = useSectionItems("couples-retreat", "expect");
  const { rows: annualItems } = useSectionItems("couples-retreat", "annual");

  // The retreat highlighted at the top of the "Upcoming" block: the one the
  // visitor arrived from, otherwise the next one on the calendar.
  const featured = useMemo(() => {
    if (eventParam) {
      const match = retreats.find((r) => eventKey(r) === eventParam || r.id === eventParam);
      if (match) return match;
    }
    return retreats.find((r) => r.registration_open) ?? retreats[0] ?? null;
  }, [retreats, eventParam]);

  const scripture = splitScripture(text("christ_centred", "subheading", ""));

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand opacity-90" />
        <img
          src={image("hero", couplesImg)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center text-white md:py-32">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.25em] backdrop-blur">
            {text("hero", "subheading", "Couples Retreat")}
          </div>
          <h1 className="font-display text-3xl font-black leading-tight md:text-5xl">
            {text("hero", "headline", "Stronger Together. Growing in Love, Faith & Partnership.")}
          </h1>
          <div className="mx-auto mt-6 max-w-2xl text-left text-white/90 [&_p]:text-white/90">
            <Paragraphs text={text("hero", "body", "")} className="!text-white/90" />
          </div>
        </div>
      </section>


      {/* ---------------- INTRODUCTION ---------------- */}
      {visible("intro") && (
        <Section>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <img
              src={image("intro", image("details", dinnerImg))}
              alt="Couples together at the retreat"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-elegant"
              loading="lazy"
            />
            <div>
              <h2 className="font-display text-2xl font-bold md:text-4xl">
                {text("intro", "headline", "Every marriage needs intentional investment.")}
              </h2>
              <div className="mt-5">
                <Paragraphs text={text("intro", "body", "")} />
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* ---------------- WHAT TO EXPECT ---------------- */}
      {visible("expect") && (
        <section className="border-y bg-secondary/40">
          <Section>
            <SectionHeader
              eyebrow="The Retreat"
              title={text("expect", "headline", "What to Expect")}
              subtitle={text("expect", "body", "")}
            />
            {expectItems.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {expectItems.map((item) => (
                  <li key={item.id} className="flex gap-3 rounded-2xl bg-card p-4 shadow-card ring-1 ring-black/5">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#E13495]" />
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      {item.body && <p className="mt-1 text-xs text-muted-foreground">{item.body}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {text("expect", "cta_label", "").trim() && (
              <p className="mx-auto mt-10 max-w-3xl text-center text-muted-foreground">
                {text("expect", "cta_label", "")}
              </p>
            )}
          </Section>
        </section>
      )}

      {/* ---------------- TIME AWAY ---------------- */}
      {visible("time_away") && (
        <Section>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                {text("time_away", "headline", "Time Away for the Two of You")}
              </h2>
              <div className="mt-5">
                <Paragraphs text={text("time_away", "body", "")} />
              </div>
            </div>
            <img
              src={image("time_away", couplesImg)}
              alt="Time away together"
              className="order-1 aspect-[4/3] w-full rounded-3xl object-cover shadow-elegant lg:order-2"
              loading="lazy"
            />
          </div>
        </Section>
      )}

      {/* ---------------- CHRIST-CENTRED ---------------- */}
      {visible("christ_centred") && (
        <section className="border-y bg-secondary/30">
          <Section className="!py-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                {text("christ_centred", "headline", "A Christ-Centred Experience")}
              </h2>
              {scripture.quote && (
                <figure className="mt-8 rounded-3xl bg-card p-8 shadow-card ring-1 ring-black/5">
                  <Quote className="mx-auto h-7 w-7 text-[#E13495]" />
                  <blockquote className="mt-4 font-display text-lg leading-relaxed md:text-xl">
                    {scripture.quote}
                  </blockquote>
                  {scripture.reference && (
                    <figcaption className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#E13495]">
                      {scripture.reference}
                    </figcaption>
                  )}
                </figure>
              )}
              <div className="mt-8 text-left sm:text-center">
                <Paragraphs text={text("christ_centred", "body", "")} />
              </div>
            </div>
          </Section>
        </section>
      )}

      {/* ---------------- WHO SHOULD ATTEND ---------------- */}
      {visible("who") && (
        <Section className="!py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              {text("who", "headline", "Who Should Attend?")}
            </h2>
            <div className="mt-5">
              <Paragraphs text={text("who", "body", "")} />
            </div>
          </div>
        </Section>
      )}

      {/* ---------------- UPCOMING RETREAT ---------------- */}
      {visible("upcoming") && (
        <section className="border-y bg-secondary/40" id="upcoming">
          <Section>
            <SectionHeader
              eyebrow="Upcoming Couples Retreat"
              title={text("upcoming", "headline", "Your Marriage Is Worth Investing In")}
              subtitle={text("upcoming", "body", "")}
            />
            {retreats.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                Details of the next Couples Retreat will be announced soon.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {retreats.map((r) => (
                  <RetreatCard key={r.id} retreat={r} highlighted={featured?.id === r.id} />
                ))}
              </div>
            )}
          </Section>
        </section>
      )}

      {/* ---------------- WHY ATTEND ---------------- */}
      {visible("why") && (
        <Section className="!py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold md:text-3xl">{text("why", "headline", "Why Attend?")}</h2>
            <div className="mt-5 text-left sm:text-center">
              <Paragraphs text={text("why", "body", "")} />
            </div>
          </div>
        </Section>
      )}

      {/* ---------------- ANNUAL RETREATS ---------------- */}
      {visible("annual") && annualItems.length > 0 && (
        <section className="border-y bg-secondary/30">
          <Section>
            <SectionHeader eyebrow="Twice Every Year" title={text("annual", "headline", "Our Annual Retreats")} />
            <div className="grid gap-6 md:grid-cols-2">
              {annualItems.map((item) => (
                <div key={item.id} className="rounded-3xl bg-card p-7 shadow-card ring-1 ring-black/5">
                  {item.image_url && (
                    <img src={item.image_url} alt="" className="mb-5 aspect-[16/9] w-full rounded-2xl object-cover" loading="lazy" />
                  )}
                  <h3 className="font-display text-xl font-bold">{item.title}</h3>
                  {item.body && <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>}
                </div>
              ))}
            </div>
            {text("annual", "body", "").trim() && (
              <p className="mx-auto mt-8 max-w-3xl text-center text-muted-foreground">{text("annual", "body", "")}</p>
            )}
          </Section>
        </section>
      )}

      {/* ---------------- REGISTRATION ---------------- */}
      <Section id="register">
        <SectionHeader
          eyebrow={text("register", "subheading", "Registration")}
          title={text("register", "headline", "Register Your Interest")}
          subtitle={text("register", "body", "")}
        />
        <RegistrationForm retreats={retreats} preselected={featured} />
      </Section>

      {/* ---------------- COME AND GROW TOGETHER ---------------- */}
      {visible("closing") && (
        <section className="border-y bg-secondary/40">
          <Section className="!py-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-display text-2xl font-bold md:text-3xl">
                {text("closing", "headline", "Come and Grow Together")}
              </h2>
              <div className="mt-5 text-left sm:text-center">
                <Paragraphs text={text("closing", "body", "")} />
              </div>
              {text("closing", "subheading", "").trim() && (
                <p className="mt-8 inline-block rounded-full bg-[#F0DE51] px-6 py-3 font-display text-base font-bold text-[#3a2b00]">
                  {text("closing", "subheading", "")}
                </p>
              )}
              <div className="mt-8 flex justify-center">
                <RetreatButtons />
              </div>
            </div>
          </Section>
        </section>
      )}

      {/* ---------------- ALBUMS LINK ---------------- */}
      {visible("albums") && (
        <Section className="!py-14">
          <div className="rounded-3xl bg-card p-8 text-center shadow-card ring-1 ring-black/5">
            <h2 className="font-display text-xl font-bold">
              {text("albums", "headline", "Photographs from previous retreats")}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              {text("albums", "body", "Every retreat album lives with the rest of our church albums.")}
            </p>
            <Link
              to={ALBUMS_TO}
        search={ALBUMS_SEARCH}
              className="mt-5 inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-elegant"
            >
              View Previous Couples Retreats <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      )}

      {/* ---------------- CONTACT ---------------- */}
      {visible("contact") && (
        <Section className="!py-14">
          <div className="rounded-3xl gradient-brand p-8 text-white md:p-12">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              {text("contact", "headline", "Questions about the retreat?")}
            </h2>
            <p className="mt-2 text-white/90">{text("contact", "body", "Our team is glad to help you plan your time away.")}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm">
              {settings.email && (
                <a href={`mailto:${settings.email}`} className="inline-flex max-w-full items-center gap-2 break-all rounded-full bg-white/15 px-4 py-2 hover:bg-white/25">
                  <Mail className="h-4 w-4" /> {settings.email}
                </a>
              )}
              {settings.phone && (
                <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="inline-flex max-w-full items-center gap-2 break-all rounded-full bg-white/15 px-4 py-2 hover:bg-white/25">
                  <Phone className="h-4 w-4" /> {settings.phone}
                </a>
              )}
            </div>
          </div>
        </Section>
      )}
    </>
  );
}

/** One upcoming Couples Retreat, using only details entered in Admin → Events. */
function RetreatCard({ retreat, highlighted }: { retreat: ChurchEventRow; highlighted: boolean }) {
  const open = Boolean(retreat.registration_open);
  return (
    <article
      className={`overflow-hidden rounded-3xl bg-card shadow-card ring-1 transition ${
        highlighted ? "ring-2 ring-[#E13495]" : "ring-black/5"
      }`}
    >
      {retreat.image_url && (
        <img src={retreat.image_url} alt={retreat.title} className="aspect-[16/9] w-full object-cover" loading="lazy" />
      )}
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-xl font-bold">{retreat.title}</h3>
          {retreat.badge_label?.trim() && (
            <span className="rounded-full gradient-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              {retreat.badge_label}
            </span>
          )}
        </div>
        {retreat.description && <p className="mt-3 text-sm text-muted-foreground">{retreat.description}</p>}
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#E13495]" /> {formatEventDate(retreat.start_at)}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#E13495]" /> {formatEventTime(retreat.start_at)}
          </div>
          {retreat.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#E13495]" /> {retreat.venue}
            </div>
          )}
        </div>
        <div className="mt-5">
          {open ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Registration of interest is open
              </p>
              <button
                type="button"
                onClick={scrollToRegister}
                className="mt-3 inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant hover:opacity-95"
              >
                <HeartHandshake className="h-4 w-4" /> Register Your Interest
              </button>
            </>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Registration for this retreat has not opened yet
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

const EMPTY_FORM = {
  full_name: "",
  spouse_name: "",
  email: "",
  phone: "",
  number_of_attendees: "2",
  accommodation_preference: "",
  dietary_requirements: "",
  accessibility_requirements: "",
  message: "",
};

const DRAFT_KEY = "couples-retreat-registration";

function RegistrationForm({
  retreats,
  preselected,
}: {
  retreats: ChurchEventRow[];
  preselected: ChurchEventRow | null;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [eventId, setEventId] = useState<string>("");

  // Couples may register for any retreat whose interest list is open; when none
  // are open they can still express interest in an announced retreat.
  const choices = useMemo(() => {
    const open = retreats.filter((r) => r.registration_open);
    return open.length ? open : retreats;
  }, [retreats]);

  useEffect(() => {
    if (eventId && choices.some((c) => c.id === eventId)) return;
    const wanted = preselected && choices.some((c) => c.id === preselected.id) ? preselected.id : choices[0]?.id ?? "";
    setEventId(wanted);
  }, [choices, preselected, eventId]);

  // Keep a local draft so a half-finished application is not lost on refresh.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFT_KEY);
      if (saved) setForm({ ...EMPTY_FORM, ...JSON.parse(saved) });
    } catch {
      /* ignore unreadable drafts */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      /* storage may be unavailable */
    }
  }, [form]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return; // guards against double submission
    setError(null);

    const name = form.full_name.trim();
    const email = form.email.trim();
    const attendees = Number(form.number_of_attendees);

    if (name.length < 2 || name.length > 100) return setError("Please enter your full name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Please enter a valid email address.");
    if (!Number.isFinite(attendees) || attendees < 1 || attendees > 50) return setError("Please enter between 1 and 50 attendees.");
    if (form.message.length > 1000) return setError("Please keep your message under 1000 characters.");
    if (!consent) return setError("Please tick the consent box so we may contact you.");

    const chosen = choices.find((c) => c.id === eventId) ?? null;

    setBusy(true);
    const { error: insertError } = await supabase.from("event_registrations").insert({
      event_id: chosen?.id ?? null,
      event_slug: chosen ? eventKey(chosen) || slugify(chosen.title) : "couples-retreat",
      full_name: name,
      spouse_name: form.spouse_name.trim() || null,
      email,
      phone: form.phone.trim() || null,
      number_of_attendees: attendees,
      accommodation_preference: form.accommodation_preference || null,
      dietary_requirements: form.dietary_requirements.trim() || null,
      accessibility_requirements: form.accessibility_requirements.trim() || null,
      message: form.message.trim() || null,
      consent_given: true,
    } as any);
    setBusy(false);

    if (insertError) {
      setError("Sorry, we could not submit your registration. Please try again or contact the church office.");
      return;
    }

    setForm(EMPTY_FORM);
    setConsent(false);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* storage may be unavailable */
    }
    setDone(true);
  }

  const input = "mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm";
  const labelText = "text-xs font-semibold uppercase tracking-widest text-muted-foreground";

  return (
    <>
      <form onSubmit={submit} className="mx-auto max-w-3xl rounded-3xl bg-card p-6 shadow-card ring-1 ring-black/5 md:p-8">
        {choices.length > 0 && (
          <label className="mb-5 block">
            <span className={labelText}>Which Couples Retreat are you interested in?</span>
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={input}>
              {choices.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} — {formatEventDate(c.start_at)}
                  {c.registration_open ? "" : " (interest list not yet open)"}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelText}>Your full name</span>
            <input required maxLength={100} value={form.full_name} onChange={set("full_name")} className={input} />
          </label>
          <label className="block">
            <span className={labelText}>Spouse's name (optional)</span>
            <input maxLength={100} value={form.spouse_name} onChange={set("spouse_name")} className={input} />
          </label>
          <label className="block">
            <span className={labelText}>Email</span>
            <input required type="email" maxLength={255} value={form.email} onChange={set("email")} className={input} />
          </label>
          <label className="block">
            <span className={labelText}>Phone (optional)</span>
            <input maxLength={40} value={form.phone} onChange={set("phone")} className={input} />
          </label>
          <label className="block">
            <span className={labelText}>Number attending</span>
            <input type="number" min={1} max={50} value={form.number_of_attendees} onChange={set("number_of_attendees")} className={input} />
          </label>
          <label className="block">
            <span className={labelText}>Accommodation preference</span>
            <select value={form.accommodation_preference} onChange={set("accommodation_preference")} className={input}>
              <option value="">No preference</option>
              <option value="Twin room">Twin room</option>
              <option value="Double room">Double room</option>
              <option value="Family room">Family room</option>
              <option value="Not staying overnight">Not staying overnight</option>
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className={labelText}>Dietary requirements (optional)</span>
          <input maxLength={300} value={form.dietary_requirements} onChange={set("dietary_requirements")} className={input} />
        </label>
        <label className="mt-4 block">
          <span className={labelText}>Accessibility requirements (optional)</span>
          <input maxLength={300} value={form.accessibility_requirements} onChange={set("accessibility_requirements")} className={input} />
        </label>
        <label className="mt-4 block">
          <span className={labelText}>Anything else we should know? (optional)</span>
          <textarea rows={4} maxLength={1000} value={form.message} onChange={set("message")} className={input} />
        </label>

        <label className="mt-5 flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#E13495]"
          />
          <span className="text-muted-foreground">
            I am happy for the church to contact me about the Couples Retreat and to hold these details for the purpose of this event.
          </span>
        </label>

        {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 inline-flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Submitting…" : "Register Your Interest"}
        </button>
      </form>

      {done && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-elegant">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h3 className="mt-4 font-display text-xl font-bold">Thank you!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your interest has been received. We'll be in touch with the retreat details shortly.
            </p>
            <button
              onClick={() => setDone(false)}
              className="mt-6 rounded-full gradient-brand px-6 py-2.5 text-sm font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
