import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, MessageSquare, CheckCircle2 } from "lucide-react";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/book-appointment")({
  head: () => ({
    meta: [
      { title: "Book an Appointment — RCCG Praise Palace Northampton" },
      { name: "description", content: "Book a private appointment with a pastor at RCCG Praise Palace Northampton. Choose your pastor, date and time." },
      { property: "og:title", content: "Book an Appointment — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Prayer, counsel and pastoral care — book time with a pastor." },
      { property: "og:url", content: "/book-appointment" },
    ],
    links: [{ rel: "canonical", href: "/book-appointment" }],
  }),
  component: BookAppointmentPage,
});

const PASTORS = [
  { id: "pastor-lead", name: "Pastor (Lead Pastor)", focus: "General pastoral care, vision & counsel" },
  { id: "pastor-mrs", name: "Pastor (Mrs.)", focus: "Women, marriage & family" },
  { id: "pastor-youth", name: "Youth Pastor", focus: "Youth, career & discipleship" },
  { id: "pastor-mens", name: "Men Fellowship Pastor", focus: "Men, fatherhood & purpose" },
];

const TIMES = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const REASONS = ["Prayer", "Counselling", "Marriage", "Baptism / Dedication", "Career & Purpose", "Other"];

function BookAppointmentPage() {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const [pastor, setPastor] = useState(PASTORS[0].id);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("");
  const [reason, setReason] = useState(REASONS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const disabled = !date || !time || !name.trim() || !email.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setSubmitted(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <PageHero
        eyebrow="Pastoral Care"
        title={<>Book an <span className="text-[#F0DE51]">Appointment</span></>}
        subtitle="Meet privately with a pastor for prayer, counsel and encouragement. Choose your pastor, pick a date and time — we'll confirm by email."
      />

      <Section>
        {submitted && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center animate-fade-in" onClick={() => setSubmitted(false)}>
            <div className="max-w-md w-full rounded-3xl bg-card p-8 shadow-elegant text-center" onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full gradient-brand text-white">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-5 font-display font-bold text-2xl">Thank you, {name.split(" ")[0] || "friend"}!</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Your appointment request with <span className="font-semibold text-foreground">{PASTORS.find((p) => p.id === pastor)?.name}</span> on{" "}
                <span className="font-semibold text-foreground">{date && format(date, "EEE, d MMM yyyy")} at {time}</span> has been received. We'll confirm shortly by email.
              </p>
              <button onClick={() => setSubmitted(false)} className="mt-6 rounded-full gradient-brand px-6 py-2.5 text-sm font-semibold text-white shadow-elegant hover:opacity-95">Close</button>
            </div>
          </div>
        )}
        <div className="grid gap-8 lg:grid-cols-[1.1fr,1fr]">
          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-3xl bg-card p-6 md:p-8 shadow-card ring-1 ring-black/5 space-y-8">
            {/* Pastor */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-[#E13495]" />
                <h3 className="font-display font-bold text-lg">Choose a Pastor</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {PASTORS.map((p) => (
                  <label
                    key={p.id}
                    className={cn(
                      "cursor-pointer rounded-2xl border-2 p-4 transition",
                      pastor === p.id ? "border-[#E13495] bg-[#E13495]/5" : "border-border hover:border-[#996DB5]/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="pastor"
                      value={p.id}
                      checked={pastor === p.id}
                      onChange={() => setPastor(p.id)}
                      className="sr-only"
                    />
                    <div className="font-semibold text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{p.focus}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="h-4 w-4 text-[#E13495]" />
                <h3 className="font-display font-bold text-lg">Pick a Date</h3>
              </div>
              <div className="rounded-2xl border bg-background p-2 inline-block">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < today}
                  className={cn("pointer-events-auto")}
                />
              </div>
              {date && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Selected: <span className="font-semibold text-foreground">{format(date, "EEEE, d MMMM yyyy")}</span>
                </p>
              )}
            </div>

            {/* Time */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-[#E13495]" />
                <h3 className="font-display font-bold text-lg">Choose a Time</h3>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {TIMES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTime(t)}
                    className={cn(
                      "rounded-lg border-2 px-3 py-2 text-sm font-medium transition",
                      time === t
                        ? "border-[#E13495] bg-[#E13495] text-white"
                        : "border-border hover:border-[#996DB5]/50"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-[#E13495]" />
                <h3 className="font-display font-bold text-lg">Reason</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {REASONS.map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setReason(r)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm transition",
                      reason === r
                        ? "border-[#E13495] bg-[#E13495]/10 text-[#E13495] font-semibold"
                        : "border-border hover:border-[#996DB5]/50"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name *" icon={User}>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Your name" />
              </Field>
              <Field label="Email *" icon={Mail}>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
              </Field>
              <Field label="Phone" icon={Phone}>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+44 ..." />
              </Field>
              <Field label="Notes" icon={MessageSquare}>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input" placeholder="Anything we should know" />
              </Field>
            </div>

            <button
              type="submit"
              disabled={disabled}
              className="w-full rounded-full gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-elegant hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Appointment
            </button>


            <style>{`.input{width:100%;border:1px solid hsl(var(--border));border-radius:0.75rem;padding:0.65rem 0.9rem;font-size:0.875rem;background:hsl(var(--background))}.input:focus{outline:none;border-color:#E13495;box-shadow:0 0 0 3px rgba(225,52,149,0.15)}`}</style>
          </form>

          {/* Summary sidebar */}
          <aside className="space-y-6">
            <div className="rounded-3xl gradient-brand p-6 md:p-8 text-white shadow-elegant">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#F0DE51]">Your Appointment</div>
              <h3 className="mt-2 font-display font-bold text-2xl">Summary</h3>
              <dl className="mt-5 space-y-3 text-sm">
                <SummaryRow label="Pastor" value={PASTORS.find((p) => p.id === pastor)?.name ?? "—"} />
                <SummaryRow label="Date" value={date ? format(date, "EEE, d MMM yyyy") : "Select a date"} />
                <SummaryRow label="Time" value={time || "Select a time"} />
                <SummaryRow label="Reason" value={reason} />
              </dl>
            </div>
            <div className="rounded-3xl bg-secondary/40 p-6 md:p-8">
              <h4 className="font-display font-bold text-lg">Need it urgent?</h4>
              <p className="mt-2 text-sm text-muted-foreground">For urgent prayer or care, please reach us directly.</p>
              <div className="mt-4 space-y-2 text-sm">
                <a href="tel:+447000000000" className="flex items-center gap-2 hover:text-[#E13495]"><Phone className="h-4 w-4 text-[#E13495]" /> +44 7000 000 000</a>
                <a href="mailto:oyintesting@gmail.com" className="flex items-center gap-2 hover:text-[#E13495] break-all"><Mail className="h-4 w-4 text-[#E13495]" /> oyintesting@gmail.com</a>
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-[#E13495]" /> {label}
      </span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/15 pb-2 last:border-0">
      <dt className="text-white/70 text-xs uppercase tracking-wider">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
