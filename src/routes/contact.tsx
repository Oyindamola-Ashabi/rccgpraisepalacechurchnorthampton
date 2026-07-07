import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";
import heroImg from "@/assets/community.jpg";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — PraisePalace Church" },
      { name: "description", content: "Get in touch with PraisePalace Church in Newport Pagnell, UK. Address, phone, email and directions." },
      { property: "og:title", content: "Contact — PraisePalace Church" },
      { property: "og:description", content: "Reach out or plan your visit today." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHero eyebrow="Get In Touch" title="We'd Love To Hear From You" subtitle="Prayer requests, visits, questions — we're here." image={heroImg} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader center={false} eyebrow="Reach Us" title="Contact Information" />
            <div className="space-y-5">
              {[
                { icon: MapPin, label: "Address", value: "350A iCentre, Howard Way, Newport Pagnell, MK16 9PY" },
                { icon: Phone, label: "Phone", value: "+44 7000 000 000", href: "tel:+447000000000" },
                { icon: Mail, label: "Email", value: "oyintesting@gmail.com", href: "mailto:oyintesting@gmail.com" },
                { icon: Clock, label: "Service Times", value: "Sundays 10:00 AM · Wed 7:00 PM" },
              ].map((c) => (
                <div key={c.label} className="flex gap-4 rounded-2xl bg-card p-5 shadow-card ring-1 ring-black/5">
                  <div className="shrink-0 grid h-12 w-12 place-items-center rounded-xl gradient-brand text-white">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{c.label}</div>
                    {c.href ? (
                      <a href={c.href} className="mt-1 block font-display font-semibold text-lg hover:text-[#E13495] break-words">{c.value}</a>
                    ) : (
                      <div className="mt-1 font-display font-semibold text-lg">{c.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader center={false} eyebrow="Message" title="Send a Note" />
            {sent ? (
              <div className="rounded-2xl bg-card p-8 shadow-card ring-1 ring-black/5 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-brand text-white">✓</div>
                <h3 className="mt-4 font-display font-bold text-xl">Thank you!</h3>
                <p className="mt-2 text-sm text-muted-foreground">Your message has been received. We'll be in touch shortly.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); setSent(true); }}
                className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5 space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name" name="firstName" required />
                  <Field label="Last name" name="lastName" required />
                </div>
                <Field label="Email" name="email" type="email" required />
                <Field label="Subject" name="subject" />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Message</label>
                  <textarea required rows={5} name="message" className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]" />
                </div>
                <BrandButton to="#">Send message</BrandButton>
              </form>
            )}
          </div>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5">
          <iframe
            title="PraisePalace Church location"
            src="https://www.google.com/maps?q=350A+iCentre+Howard+Way+Newport+Pagnell+MK16+9PY&output=embed"
            width="100%"
            height="420"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Section>
    </>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]"
      />
    </div>
  );
}
