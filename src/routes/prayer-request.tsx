import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/section-ui";
import { CmsPageHero } from "@/components/cms-page-hero";
import { usePageContent } from "@/lib/cms";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/worship-team.jpg";

export const Route = createFileRoute("/prayer-request")({
  head: () => ({
    meta: [
      { title: "Prayer Request — RCCG Praise Palace Northampton" },
      { name: "description", content: "Share a confidential prayer request with the RCCG Praise Palace Northampton prayer team. Requests are never published." },
      { property: "og:title", content: "Prayer Request — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Our prayer team would love to stand with you in prayer — confidentially." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/prayer-request" },
    ],
    links: [{ rel: "canonical", href: "/prayer-request" }],
  }),
  component: PrayerRequestPage,
});

function PrayerRequestPage() {
  const { text } = usePageContent("prayer-request");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anonymous, setAnonymous] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const fullName = String(fd.get("full_name") ?? "").trim();
    const request = String(fd.get("request") ?? "").trim();
    if (!request) { setError("Please write your prayer request."); return; }
    if (!anonymous && !fullName) { setError("Please enter your name, or tick the anonymous box."); return; }
    setSending(true);
    setError(null);
    const { error: insertError } = await supabase.from("prayer_requests").insert({
      full_name: (anonymous ? null : fullName) as string | null,
      email: (String(fd.get("email") ?? "").trim() || null) as string | null,
      phone: (String(fd.get("phone") ?? "").trim() || null) as string | null,
      request,
      is_anonymous: anonymous,
      is_urgent: fd.get("is_urgent") === "on",
    });
    setSending(false);
    if (insertError) {
      setError("Sorry, your prayer request could not be sent. Please try again in a moment.");
      return;
    }
    form.reset();
    setAnonymous(false);
    setSent(true);
  }

  return (
    <>
      <CmsPageHero page="prayer-request"
        eyebrow="We Pray With You"
        title="Prayer Request"
        subtitle="Whatever you're facing, you don't have to carry it alone. Our prayer team is here."
        image={heroImg}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeader center={false} eyebrow={text("confidential", "subheading", "Confidential")} title={text("confidential", "headline", "Held In Confidence")} />
            <div className="space-y-4 text-muted-foreground">
              <p>Every request is received privately by our pastoral and prayer team. Prayer requests are <strong className="text-foreground">never published</strong> on this website or shared publicly.</p>
              <p>You may submit anonymously if you'd prefer — simply tick the anonymous box and leave your name out.</p>
              <p>If your situation is urgent, tick the urgent box and we will prioritise it.</p>
            </div>
          </div>

          <div>
            <SectionHeader center={false} eyebrow={text("form", "subheading", "Your Request")} title={text("form", "headline", "Send Us Your Prayer Need")} />
            {sent ? (
              <div className="rounded-2xl bg-card p-8 shadow-card ring-1 ring-black/5 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-brand text-white">✓</div>
                <h3 className="mt-4 font-display font-bold text-xl">Thank you — we're praying.</h3>
                <p className="mt-2 text-sm text-muted-foreground">Your request has been received privately by our prayer team.</p>
                <button onClick={() => setSent(false)} className="mt-5 rounded-full border px-5 py-2 text-sm font-semibold hover:bg-secondary/50">
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5 space-y-4">
                <div>
                  <label htmlFor="p-name" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Full name {anonymous ? "(not required — anonymous)" : ""}
                  </label>
                  <input
                    id="p-name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    disabled={anonymous}
                    required={!anonymous}
                    className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495] disabled:opacity-50"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="p-email" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email (optional)</label>
                    <input id="p-email" name="email" type="email" autoComplete="email" className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]" />
                  </div>
                  <div>
                    <label htmlFor="p-phone" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Phone (optional)</label>
                    <input id="p-phone" name="phone" type="tel" autoComplete="tel" className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]" />
                  </div>
                </div>
                <div>
                  <label htmlFor="p-request" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your prayer request</label>
                  <textarea id="p-request" name="request" rows={6} required className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]" />
                </div>
                <div className="space-y-3 rounded-xl bg-secondary/40 p-4">
                  <label htmlFor="p-anon" className="flex items-start gap-3 text-sm">
                    <input id="p-anon" name="is_anonymous" type="checkbox" checked={anonymous} onChange={(ev) => setAnonymous(ev.target.checked)} className="mt-0.5 h-4 w-4 accent-[#E13495]" />
                    <span>Submit this request anonymously (your name will not be recorded)</span>
                  </label>
                  <label htmlFor="p-urgent" className="flex items-start gap-3 text-sm">
                    <input id="p-urgent" name="is_urgent" type="checkbox" className="mt-0.5 h-4 w-4 accent-[#E13495]" />
                    <span>This is urgent — please pray as soon as possible</span>
                  </label>
                </div>
                {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={sending} className="inline-flex items-center justify-center rounded-full gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95 transition disabled:opacity-60">
                  {sending ? "Sending…" : "Send prayer request"}
                </button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
