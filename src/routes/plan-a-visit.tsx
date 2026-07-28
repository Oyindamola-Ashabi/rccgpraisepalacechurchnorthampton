import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/community.jpg";

export const Route = createFileRoute("/plan-a-visit")({
  head: () => ({
    meta: [
      { title: "Plan a Visit — RCCG Praise Palace Northampton" },
      { name: "description", content: "Planning your first visit to RCCG Praise Palace Northampton? Tell us when you're coming and we'll be ready to welcome you." },
      { property: "og:title", content: "Plan a Visit — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Let us know you're coming and we'll save you a seat at Briar Hill Community Centre." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/plan-a-visit" },
    ],
    links: [{ rel: "canonical", href: "/plan-a-visit" }],
  }),
  component: PlanAVisitPage,
});

const SERVICES = [
  "Sunday Service — 10:00 AM",
  "Bible Study — Wednesdays 7:00 PM",
  "Night Vigil — Last Friday 11:00 PM",
  "Prayer Connect — Last Day of the Month 11:30 PM",
];

const today = () => new Date().toISOString().slice(0, 10);

function PlanAVisitPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const visitDate = String(fd.get("visit_date") ?? "").trim();
    if (visitDate && visitDate < today()) {
      setError("Please choose a visit date that is today or later.");
      return;
    }
    setSending(true);
    setError(null);
    const { error: insertError } = await supabase.from("visit_plans").insert({
      full_name: String(fd.get("full_name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: (String(fd.get("phone") ?? "").trim() || null) as string | null,
      service: (String(fd.get("service") ?? "").trim() || null) as string | null,
      visit_date: (visitDate || null) as string | null,
      number_of_adults: Number(fd.get("number_of_adults") ?? 1),
      number_of_children: Number(fd.get("number_of_children") ?? 0),
      notes: (String(fd.get("notes") ?? "").trim() || null) as string | null,
    });
    setSending(false);
    if (insertError) {
      setError("Sorry, we couldn't save your visit plan. Please check your details and try again.");
      return;
    }
    form.reset();
    setSent(true);
  }

  return (
    <>
      <PageHero
        eyebrow="You're Welcome Here"
        title="Plan a Visit"
        subtitle="Tell us when you're coming and we'll be looking out for you at Briar Hill Community Centre."
        image={heroImg}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeader center={false} eyebrow="Your First Visit" title="What To Expect" />
            <div className="space-y-4 text-muted-foreground">
              <p>Come exactly as you are. You'll be met at the door, shown around, and there's no pressure to give or take part in anything.</p>
              <p>Services last about two hours with worship, the word and prayer. Children are very welcome, and our team will help you settle in.</p>
              <p className="font-semibold text-foreground">Briar Hill Community Centre, NN4 8SX</p>
            </div>
          </div>

          <div>
            <SectionHeader center={false} eyebrow="Let Us Know" title="Tell Us You're Coming" />
            {sent ? (
              <div className="rounded-2xl bg-card p-8 shadow-card ring-1 ring-black/5 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-brand text-white">✓</div>
                <h3 className="mt-4 font-display font-bold text-xl">Thank you!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your visit plan has been received. Someone from our welcome team will be in touch, and we'll be ready to receive you.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-5 rounded-full border px-5 py-2 text-sm font-semibold hover:bg-secondary/50"
                >
                  Plan another visit
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate={false} className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField id="v-name" label="Full name" name="full_name" required autoComplete="name" />
                  <FormField id="v-email" label="Email" name="email" type="email" required autoComplete="email" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField id="v-phone" label="Phone (optional)" name="phone" type="tel" autoComplete="tel" />
                  <div>
                    <label htmlFor="v-service" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Service you'd like to attend</label>
                    <select
                      id="v-service"
                      name="service"
                      defaultValue=""
                      className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]"
                    >
                      <option value="">Any service</option>
                      {SERVICES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField id="v-date" label="Visit date (optional)" name="visit_date" type="date" min={today()} />
                  <FormField id="v-adults" label="Adults" name="number_of_adults" type="number" min="1" defaultValue="1" required />
                  <FormField id="v-children" label="Children" name="number_of_children" type="number" min="0" defaultValue="0" required />
                </div>
                <div>
                  <label htmlFor="v-notes" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Anything we should know? (optional)</label>
                  <textarea
                    id="v-notes"
                    name="notes"
                    rows={4}
                    className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]"
                  />
                </div>
                {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center rounded-full gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95 transition disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Plan my visit"}
                </button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}

function FormField({
  id, label, name, type = "text", required = false, min, defaultValue, autoComplete,
}: {
  id: string; label: string; name: string; type?: string; required?: boolean; min?: string; defaultValue?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        id={id}
        type={type}
        name={name}
        required={required}
        min={min}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]"
      />
    </div>
  );
}
