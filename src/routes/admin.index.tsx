import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, CalendarCheck, HeartHandshake, Quote, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  component: AdminDashboard,
});

const CARDS = [
  { table: "contact_messages", label: "Contact Messages", to: "/admin/contact", icon: Mail },
  { table: "appointment_requests", label: "Appointments", to: "/admin/appointments", icon: CalendarCheck },
  { table: "prayer_requests", label: "Prayer Requests", to: "/admin/prayer", icon: HeartHandshake },
  { table: "testimony_submissions", label: "Testimonies", to: "/admin/testimonies", icon: Quote },
  { table: "visit_plans", label: "Plan a Visit", to: "/admin/visits", icon: Users },
] as const;

function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, { total: number; unread: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const entries = await Promise.all(
        CARDS.map(async (c) => {
          const total = await supabase.from(c.table as any).select("id", { count: "exact", head: true });
          const unread = await supabase.from(c.table as any).select("id", { count: "exact", head: true }).eq("is_read", false);
          return [c.table, { total: total.count ?? 0, unread: unread.count ?? 0 }] as const;
        })
      );
      if (!active) return;
      setStats(Object.fromEntries(entries));
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everything submitted through the website, in one place.</p>

      {loading ? (
        <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {CARDS.map((c) => {
            const s = stats[c.table] ?? { total: 0, unread: 0 };
            return (
              <Link key={c.table} to={c.to} className="rounded-2xl bg-card p-5 shadow-card ring-1 ring-black/5 transition hover:shadow-elegant">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-white"><c.icon className="h-4 w-4" /></span>
                  <span className="font-semibold">{c.label}</span>
                </div>
                <div className="mt-4 flex items-end gap-3">
                  <span className="font-display text-3xl font-bold">{s.total}</span>
                  <span className="pb-1 text-xs text-muted-foreground">total</span>
                </div>
                <div className="mt-1 text-xs font-semibold text-[#E13495]">{s.unread} unread</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
