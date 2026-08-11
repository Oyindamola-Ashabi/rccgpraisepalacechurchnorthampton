import { createFileRoute, Outlet, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, LayoutDashboard, Mail, CalendarCheck, HeartHandshake, Quote, Users, LogOut, UserCog, Settings, FileText, Image as ImageIcon, Images, Church, CalendarDays, HandCoins, Mic, Headphones, Menu as MenuIcon, ClipboardList } from "lucide-react";
import { adminSignOut, isStaff, roleLabel, useAdminSession } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — RCCG Praise Palace Northampton" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminLayout,
});

/** Website content first, then the people-facing inboxes, then settings. */
const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/pages", label: "Page Content", icon: FileText },
  { to: "/admin/navigation", label: "Navigation Menu", icon: MenuIcon },
  { to: "/admin/media", label: "Media Library", icon: ImageIcon },
  { to: "/admin/gallery", label: "Albums", icon: Images },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/ministries", label: "Ministries", icon: Church },
  { to: "/admin/sermons", label: "Sermons", icon: Mic },
  { to: "/admin/podcasts", label: "Podcasts", icon: Headphones },
  { to: "/admin/pastors", label: "Pastors", icon: UserCog },
  { to: "/admin/giving", label: "Giving Page", icon: HandCoins },
  { to: "/admin/registrations", label: "Event Registrations", icon: ClipboardList },
  { to: "/admin/appointments", label: "Appointments", icon: CalendarCheck },
  { to: "/admin/contact", label: "Contact Messages", icon: Mail },
  { to: "/admin/prayer", label: "Prayer Requests", icon: HeartHandshake },
  { to: "/admin/testimonies", label: "Testimonies", icon: Quote },
  { to: "/admin/visits", label: "Plan a Visit Requests", icon: Users },
  { to: "/admin/settings", label: "Site Settings", icon: Settings },
];


function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname.startsWith("/admin/login");
  const { loading, user, roles } = useAdminSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLogin && !loading && !user) navigate({ to: "/admin/login", replace: true });
  }, [isLogin, loading, user, navigate]);

  if (isLogin) return <Outlet />;

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#E13495]" />
      </div>
    );
  }

  if (!user) return null;

  if (!isStaff(roles)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">No admin access</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your account ({user.email}) is signed in but has not been granted a staff role. Please ask a super admin to grant you access.
        </p>
        <button
          onClick={async () => { await adminSignOut(); navigate({ to: "/admin/login", replace: true }); }}
          className="mt-6 rounded-full gradient-brand px-6 py-2.5 text-sm font-semibold text-white shadow-elegant"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl gap-8 px-4 py-10 lg:flex">
      <aside className="lg:w-64 lg:shrink-0">
        <div className="rounded-2xl bg-card p-4 shadow-card ring-1 ring-black/5">
          <div className="px-2 pb-3">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Signed in</div>
            <div className="truncate text-sm font-semibold">{user.email}</div>
            <div className="text-xs text-[#E13495]">{roleLabel(roles)}</div>
          </div>
          <nav className="space-y-1">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                    active ? "gradient-brand text-white shadow-elegant" : "hover:bg-secondary/60"
                  )}
                >
                  <item.icon className="h-4 w-4" /> {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={async () => { await adminSignOut(); navigate({ to: "/admin/login", replace: true }); }}
            className="mt-3 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="mt-8 min-w-0 flex-1 lg:mt-0">
        <Outlet />
      </main>
    </div>
  );
}
