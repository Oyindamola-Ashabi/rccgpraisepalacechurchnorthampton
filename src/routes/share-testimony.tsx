import { createFileRoute } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/section-ui";
import { CmsPageHero } from "@/components/cms-page-hero";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/community.jpg";

export const Route = createFileRoute("/share-testimony")({
  head: () => ({
    meta: [
      { title: "Share a Testimony — RCCG Praise Palace Northampton" },
      { name: "description", content: "Tell us what God has done. Share your testimony with RCCG Praise Palace Northampton — it shall end in praise." },
      { property: "og:title", content: "Share a Testimony — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Give God the glory — share your testimony with our church family." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/share-testimony" },
    ],
    links: [{ rel: "canonical", href: "/share-testimony" }],
  }),
  component: ShareTestimonyPage,
});

function ShareTestimonyPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSending(true);
    setError(null);
    const { error: insertError } = await supabase.from("testimony_submissions").insert({
      full_name: String(fd.get("full_name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      title: String(fd.get("title") ?? "").trim(),
      testimony: String(fd.get("testimony") ?? "").trim(),
      allow_publish: fd.get("allow_publish") === "on",
    });
    setSending(false);
    if (insertError) {
      setError("Sorry, your testimony could not be sent. Please try again in a moment.");
      return;
    }
    form.reset();
    setSent(true);
  }

  return (
    <>
      <CmsPageHero page="share-testimony"
        eyebrow="Give God The Glory"
        title="Share Your Testimony"
        subtitle="Every testimony strengthens someone else's faith. Tell us what the Lord has done."
        image={heroImg}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeader center={false} eyebrow="Why Share" title="It Shall End In Praise" />
            <div className="space-y-4 text-muted-foreground">
              <p>Healing, provision, breakthrough, peace, a door that finally opened — whatever God has done, your story matters.</p>
              <p>Your testimony goes straight to our pastoral team. Nothing is published automatically: if you give consent, an administrator reviews and approves it first.</p>
            </div>
          </div>

          <div>
            <SectionHeader center={false} eyebrow="Your Story" title="Tell Us What God Did" />
            {sent ? (
              <div className="rounded-2xl bg-card p-8 shadow-card ring-1 ring-black/5 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-brand text-white">✓</div>
                <h3 className="mt-4 font-display font-bold text-xl">Thank you for sharing!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your testimony has been received. If you gave consent, our team will review it before any publication.
                </p>
                <button onClick={() => setSent(false)} className="mt-5 rounded-full border px-5 py-2 text-sm font-semibold hover:bg-secondary/50">
                  Share another testimony
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="t-name" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Full name</label>
                    <input id="t-name" name="full_name" type="text" required autoComplete="name" className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]" />
                  </div>
                  <div>
                    <label htmlFor="t-email" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
                    <input id="t-email" name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]" />
                  </div>
                </div>
                <div>
                  <label htmlFor="t-title" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Testimony title</label>
                  <input id="t-title" name="title" type="text" required className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]" />
                </div>
                <div>
                  <label htmlFor="t-body" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your testimony</label>
                  <textarea id="t-body" name="testimony" rows={7} required className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]" />
                </div>
                <label htmlFor="t-consent" className="flex items-start gap-3 rounded-xl bg-secondary/40 p-4 text-sm">
                  <input id="t-consent" name="allow_publish" type="checkbox" defaultChecked={false} className="mt-0.5 h-4 w-4 accent-[#E13495]" />
                  <span>
                    I give consent for the church to <strong>consider</strong> publishing this testimony. Publication is not automatic — an administrator must review and approve it first, and it may never be published.
                  </span>
                </label>
                {error && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={sending} className="inline-flex items-center justify-center rounded-full gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95 transition disabled:opacity-60">
                  {sending ? "Sending…" : "Share my testimony"}
                </button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
