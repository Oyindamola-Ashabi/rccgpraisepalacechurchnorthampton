import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero, Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { AlbumGrid } from "@/components/album-flipbook";
import { Calendar, MapPin, Mail, Phone, Loader2, CheckCircle2, Heart, Users, Sparkles } from "lucide-react";
import { eventPhotos } from "@/lib/gallery-images";
import { supabase } from "@/integrations/supabase/client";
import {
  usePageContent,
  useCouplesRetreatAlbums,
  useSiteSettings,
  formatEventDate,
  formatEventTime,
  type ChurchEventRow,
} from "@/lib/cms";

const couplesImg = eventPhotos.couples.url;
const dinnerImg = eventPhotos.familyMeals.url;

export const Route = createFileRoute("/events/couples-retreat")({
  head: () => ({
    meta: [
      { title: "Couples Retreat — RCCG Praise Palace Northampton" },
      { name: "description", content: "The Couples Retreat at RCCG Praise Palace Northampton — teaching, fellowship and rest for married couples. Register your place." },
      { property: "og:title", content: "Couples Retreat — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Love, legacy and laughter — a retreat for married couples." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/events/couples-retreat" }],
  }),
  component: CouplesRetreatPage,
});

function useRetreatEvent() {
  const [event, setEvent] = useState<ChurchEventRow | null>(null);
  useEffect(() => {
    let active = true;
    supabase
      .from("events")
      .select("*")
      .eq("slug", "couples-retreat")
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setEvent(data as any);
      });
    return () => {
      active = false;
    };
  }, []);
  return event;
}

function CouplesRetreatPage() {
  const { text, image } = usePageContent("couples-retreat");
  const settings = useSiteSettings();
  const event = useRetreatEvent();
  const { rows: albums } = useCouplesRetreatAlbums();

  // A date is only shown once an administrator publishes the real event details.
  const hasDate = Boolean(event?.is_published && event?.start_at);

  return (
    <>
      <PageHero
        eyebrow={text("hero", "subheading", "Couples Retreat")}
        title={<>Love. <span className="text-[#F0DE51]">Legacy.</span> Christ.</>}
        subtitle={text("hero", "body", "A refreshing retreat for married couples — teaching, fellowship, rest and laughter.")}
        image={image("hero", couplesImg)}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <img
            src={image("details", dinnerImg)}
            alt="Couples at the retreat"
            className="rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]"
            loading="lazy"
          />
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              {text("intro", "headline", "A weekend set apart for your marriage")}
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {text(
                "intro",
                "body",
                "Step away from the rush and invest in your marriage. Expect honest teaching, prayer, shared meals and space to breathe together — all rooted in God's design for covenant love.",
              )}
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[#E13495]" />
                {hasDate ? (
                  <span>
                    {formatEventDate(event!.start_at)} · {formatEventTime(event!.start_at)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Next retreat date to be announced</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#E13495]" />
                <span>{event?.venue || settings.address || "Venue to be announced"}</span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#register"
                className="rounded-full gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95"
              >
                Register your place
              </a>
              <BrandButton to="/contact" variant="outline">Ask a question</BrandButton>
            </div>
          </div>
        </div>
      </Section>

      <section className="bg-secondary/40 border-y">
        <Section className="!py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { Icon: Heart, title: "Honest teaching", body: "Practical, scriptural sessions on communication, intimacy and purpose." },
              { Icon: Users, title: "Real fellowship", body: "Time with other couples walking the same road — encouragement that lasts." },
              { Icon: Sparkles, title: "Rest and joy", body: "Good food, laughter and unhurried time together away from the routine." },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
                <Icon className="h-6 w-6 text-[#E13495]" />
                <h3 className="mt-3 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <Section id="register">
        <SectionHeader
          eyebrow={text("register", "subheading", "Registration")}
          title={text("register", "headline", "Reserve your place")}
          subtitle={text("register", "body", "Tell us who's coming and we'll be in touch with the full details.")}
        />
        <RegistrationForm eventId={event?.id ?? null} />
      </Section>

      {albums.length > 0 && (
        <section className="bg-secondary/40 border-y">
          <Section className="!py-16">
            <SectionHeader
              eyebrow={text("albums", "subheading", "Photo albums")}
              title={text("albums", "headline", "Retreats we've shared")}
              subtitle={text("albums", "body", "Flip through photos from previous retreats.")}
            />
            <AlbumGrid albums={albums} />
          </Section>
        </section>
      )}

      <Section className="!py-14">
        <div className="rounded-3xl gradient-brand p-8 text-white md:p-12">
          <h2 className="font-display text-2xl font-bold md:text-3xl">{text("contact", "headline", "Questions about the retreat?")}</h2>
          <p className="mt-2 text-white/90">{text("contact", "body", "Our team is glad to help you plan your weekend.")}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 hover:bg-white/25">
                <Mail className="h-4 w-4" /> {settings.email}
              </a>
            )}
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 hover:bg-white/25">
                <Phone className="h-4 w-4" /> {settings.phone}
              </a>
            )}
          </div>
        </div>
      </Section>
    </>
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

function RegistrationForm({ eventId }: { eventId: string | null }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
    setError(null);

    const name = form.full_name.trim();
    const email = form.email.trim();
    const attendees = Number(form.number_of_attendees);

    if (name.length < 2 || name.length > 100) return setError("Please enter your full name.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Please enter a valid email address.");
    if (!Number.isFinite(attendees) || attendees < 1 || attendees > 50) return setError("Please enter between 1 and 50 attendees.");
    if (form.message.length > 1000) return setError("Please keep your message under 1000 characters.");
    if (!consent) return setError("Please confirm you are happy for us to contact you about the retreat.");

    setBusy(true);
    const { error: err } = await supabase.from("event_registrations" as any).insert({
      event_id: eventId,
      event_slug: "couples-retreat",
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
      status: "new",
    });
    setBusy(false);

    if (err) {
      setError("Sorry, we could not save your registration. Please try again or email us.");
      return;
    }
    setDone(true);
    setForm(EMPTY_FORM);
    setConsent(false);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  }

  const input = "mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]";
  const labelText = "text-xs font-semibold uppercase tracking-widest text-muted-foreground";

  return (
    <>
      <form onSubmit={submit} className="mx-auto max-w-2xl rounded-3xl bg-card p-6 shadow-card ring-1 ring-black/5 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelText}>Full name</span>
            <input required maxLength={100} value={form.full_name} onChange={set("full_name")} className={input} />
          </label>
          <label className="block">
            <span className={labelText}>Spouse's name</span>
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
          {busy ? "Sending…" : "Submit application"}
        </button>
      </form>

      {done && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-card p-8 text-center shadow-elegant">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h3 className="mt-4 font-display text-xl font-bold">Thank you!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your registration has been received. We'll be in touch with the retreat details shortly.
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
