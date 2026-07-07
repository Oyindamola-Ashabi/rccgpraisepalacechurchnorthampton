import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, Phone, Mail } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";

type NavChild = { label: string; to?: string; href?: string; external?: boolean };
type NavItem = { label: string; to?: string; children?: NavChild[] };

const NAV: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  {
    label: "Ministries",
    children: [
      { label: "PraisePalace Radio", href: "https://praisepalaceradio.com/", external: true },
      { label: "Business School", href: "https://praisepalacebusinessschool.com/", external: true },
      { label: "Youth Camp", href: "https://raisingchampions.org.uk", external: true },
    ],
  },
  {
    label: "Events",
    to: "/events",
    children: [
      { label: "All Events", to: "/events" },
      { label: "Couples", to: "/events/couples" },
    ],
  },
  {
    label: "Media",
    to: "/media",
    children: [
      { label: "All Media", to: "/media" },
      { label: "Podcast", to: "/media/podcast" },
    ],
  },
  { label: "Sermons", to: "/sermons" },
  { label: "Contact", to: "/contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:block gradient-brand text-white text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-5">
            <a href="mailto:oyintesting@gmail.com" className="flex items-center gap-2 hover:opacity-90">
              <Mail className="h-3.5 w-3.5" /> oyintesting@gmail.com
            </a>
            <a href="tel:+447000000000" className="flex items-center gap-2 hover:opacity-90">
              <Phone className="h-3.5 w-3.5" /> +44 7000 000 000
            </a>
          </div>
          <div className="opacity-90 font-medium tracking-wide">It Shall End In Praise</div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 w-full transition-all ${
          scrolled ? "bg-background/90 backdrop-blur-md shadow-sm" : "bg-background/70 backdrop-blur"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img src={logoAsset.url} alt="PraisePalace Church" className="h-12 w-12 shrink-0 object-contain" />
            <div className="min-w-0 leading-tight">
              <div className="font-display font-extrabold text-lg sm:text-xl truncate">
                <span className="text-[#E13495]">Praise</span>
                <span className="text-[#996DB5]">Palace</span>
              </div>
              <div className="text-[10px] sm:text-xs tracking-[0.2em] text-muted-foreground uppercase">
                Church
              </div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => (
              <NavDesktopItem key={item.label} item={item} />
            ))}
          </nav>

          <div className="hidden lg:block">
            <Link
              to="/give"
              className="rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-elegant hover:opacity-95 transition"
            >
              Give
            </Link>
          </div>

          <button
            className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden border-t bg-background max-h-[calc(100vh-64px)] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              {NAV.map((item) => {
                if (!item.children) {
                  return (
                    <Link
                      key={item.label}
                      to={item.to!}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                    >
                      {item.label}
                    </Link>
                  );
                }
                const isOpen = openDropdown === item.label;
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                    >
                      {item.label}
                      <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="ml-3 border-l pl-3 py-1 space-y-1">
                        {item.children.map((c) =>
                          c.external ? (
                            <a
                              key={c.label}
                              href={c.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setOpen(false)}
                              className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              {c.label} ↗
                            </a>
                          ) : (
                            <Link
                              key={c.label}
                              to={c.to!}
                              onClick={() => setOpen(false)}
                              className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              {c.label}
                            </Link>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <Link
                to="/give"
                onClick={() => setOpen(false)}
                className="mt-3 block rounded-full gradient-brand px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Give
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

function NavDesktopItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  if (!item.children) {
    return (
      <Link
        to={item.to!}
        activeOptions={{ exact: item.to === "/" }}
        activeProps={{ className: "text-[#E13495]" }}
        className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition"
      >
        {item.label}
      </Link>
    );
  }
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {item.to ? (
        <Link
          to={item.to}
          className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition"
        >
          {item.label}
          <ChevronDown className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition">
          {item.label}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}
      {open && (
        <div className="absolute left-0 top-full pt-2 min-w-[240px]">
          <div className="rounded-xl border bg-popover p-2 shadow-card">
            {item.children.map((c) =>
              c.external ? (
                <a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  {c.label} <span className="text-xs text-muted-foreground">↗</span>
                </a>
              ) : (
                <Link
                  key={c.label}
                  to={c.to!}
                  className="block rounded-lg px-3 py-2 text-sm hover:bg-muted"
                >
                  {c.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
