import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ChevronRight, Phone, Mail, Instagram, Youtube, Facebook } from "lucide-react";
import { useSiteSettings, useActiveMinistries, useNavigation, type NavNode } from "@/lib/cms";
import logoAsset from "@/assets/logo.png";
import rccgLogoAsset from "@/assets/rccg-logo.png";

type NavItem = {
  label: string;
  to?: string;
  external?: boolean;
  children?: NavItem[];
};

/** The menu shipped with the site — used until an administrator edits Admin → Navigation. */
const NAV: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  {
    label: "Ministries",
    to: "/ministries",
    children: [
      { label: "All Ministries", to: "/ministries" },
      { label: "Men Fellowship", to: "/ministries/mens-fellowship" },
      { label: "Women Fellowship", to: "/ministries/womens-fellowship" },
      { label: "PraisePalace Radio", to: "https://praisepalaceradio.com/", external: true },
      { label: "Business School", to: "https://praisepalacebusinessschool.com/", external: true },
      { label: "Youth Camp", to: "https://raisingchampions.org.uk", external: true },
      {
        label: "Community",
        children: [
          { label: "UK SME Growth Summit", to: "https://uksmegrowthsummit.co.uk/", external: true },
        ],
      },
    ],
  },
  {
    label: "Events",
    to: "/events",
    children: [
      { label: "All Events", to: "/events" },
      { label: "Couples Retreat", to: "/events/couples-retreat" },
    ],
  },
  {
    label: "Media",
    to: "/media",
    children: [
      { label: "All Media", to: "/media" },
      { label: "Gallery", to: "/media/gallery" },
      { label: "Podcast", to: "/media/podcast" },
      { label: "Podcast Episodes", to: "/podcasts" },
      { label: "Sermons", to: "/sermons" },
    ],
  },
  { label: "Sermons", to: "/sermons" },
  { label: "Book Appointment", to: "/book-appointment" },
  {
    label: "Connect",
    to: "/contact",
    children: [
      { label: "Contact Us", to: "/contact" },
      { label: "Plan a Visit", to: "/plan-a-visit" },
      { label: "Prayer Request", to: "/prayer-request" },
      { label: "Testimonies", to: "/testimonies" },
      { label: "Share a Testimony", to: "/share-testimony" },
    ],
  },
];

function toNavItem(node: NavNode): NavItem {
  return {
    label: node.label,
    to: node.link_type === "none" ? undefined : node.href,
    external: node.is_external || node.link_type === "external",
    children: node.children.length ? node.children.map(toNavItem) : undefined,
  };
}

/** One menu link — internal links keep client-side routing, external links open in a new tab. */
function NavLink({
  item,
  className,
  onClick,
  showArrow,
}: {
  item: NavItem;
  className: string;
  onClick?: () => void;
  showArrow?: boolean;
}) {
  if (!item.to) return <span className={className}>{item.label}</span>;
  if (item.external) {
    return (
      <a href={item.to} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
        {item.label} <span className="text-xs text-muted-foreground">↗</span>
      </a>
    );
  }
  return (
    <Link to={item.to as string} onClick={onClick} className={className}>
      {item.label}
      {showArrow && <ChevronDown className="h-3.5 w-3.5" />}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const settings = useSiteSettings();
  const { rows: ministries } = useActiveMinistries();
  const managed = useNavigation("header");

  // Admin → Navigation wins when it has records; otherwise the built-in menu is used.
  let nav: NavItem[] = managed.length ? managed.map(toNavItem) : NAV;

  // With the built-in menu, the Ministries list still mirrors Admin → Ministries.
  if (!managed.length && ministries.length) {
    nav = nav.map((item) =>
      item.label === "Ministries"
        ? {
            ...item,
            children: [
              { label: "All Ministries", to: "/ministries" },
              ...ministries.map((m) => ({
                label: m.name,
                to: m.link_url || `/ministries/${m.slug}`,
                external: Boolean(m.link_url && /^https?:\/\//i.test(m.link_url)),
              })),
              ...(item.children ?? []).filter((c) => c.label === "Community"),
            ],
          }
        : item,
    );
  }

  const socials = [
    { url: settings.instagram_url, Icon: Instagram, label: "Instagram" },
    { url: settings.youtube_url, Icon: Youtube, label: "YouTube" },
    { url: settings.facebook_url, Icon: Facebook, label: "Facebook" },
  ].filter((s) => Boolean(s.url));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:block gradient-brand text-white text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div className="flex items-center gap-5">
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2 hover:opacity-90">
                <Mail className="h-3.5 w-3.5" /> {settings.email}
              </a>
            )}
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 hover:opacity-90">
                <Phone className="h-3.5 w-3.5" /> {settings.phone}
              </a>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="opacity-90 font-medium tracking-wide">It Shall End In Praise</div>
            <div className="flex items-center gap-2">
              {socials.map(({ url, Icon, label }) => (
                <a
                  key={label}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-full p-1 hover:bg-white/20"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 w-full transition-all ${
          scrolled ? "bg-background/90 backdrop-blur-md shadow-sm" : "bg-background/70 backdrop-blur"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4 gap-3">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <img src={rccgLogoAsset} alt="RCCG" className="h-14 w-14 shrink-0 object-contain" />
            <img src={logoAsset} alt="Praise Palace" className="h-14 w-14 shrink-0 object-contain" />
            <div className="min-w-0 leading-tight">
              <div className="font-display font-extrabold text-sm sm:text-base truncate">
                <span className="text-[#E13495]">RCCG</span> <span className="text-[#996DB5]">Praise Palace</span>
              </div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Northampton</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {nav
              .filter((i) => i.label !== "Give")
              .map((item) => (
                <NavDesktopItem key={item.label} item={item} />
              ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {socials.map(({ url, Icon, label }) => (
              <a
                key={label}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-full border p-2 text-foreground/70 hover:text-[#E13495] hover:border-[#E13495] transition"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
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
              {nav
                .filter((i) => i.label !== "Give")
                .map((item) => {
                  if (!item.children) {
                    return (
                      <NavLink
                        key={item.label}
                        item={item}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                      />
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
                          {item.children.map((c) => (
                            <div key={c.label}>
                              <NavLink
                                item={c}
                                onClick={() => setOpen(false)}
                                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                              />
                              {c.children && (
                                <div className="ml-3 border-l pl-3 space-y-1">
                                  {c.children.map((g) => (
                                    <NavLink
                                      key={g.label}
                                      item={g}
                                      onClick={() => setOpen(false)}
                                      className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
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
      <NavLink
        item={item}
        className="rounded-md px-2.5 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition whitespace-nowrap"
      />
    );
  }

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {item.to ? (
        <NavLink
          item={item}
          showArrow
          className="flex items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition whitespace-nowrap"
        />
      ) : (
        <button className="flex items-center gap-1 rounded-md px-2.5 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition whitespace-nowrap">
          {item.label}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}
      {open && (
        <div className="absolute left-0 top-full pt-2 min-w-[240px]">
          <div className="rounded-xl border bg-popover p-2 shadow-card">
            {item.children.map((c) =>
              c.children ? (
                <NavSubGroup key={c.label} item={c} />
              ) : (
                <NavLink key={c.label} item={c} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted" />
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** A nested menu group such as Ministries → Community → UK SME Growth Summit. */
function NavSubGroup({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div className="flex cursor-default items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted">
        {item.label}
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
      {open && (
        <div className="absolute left-full top-0 pl-2 min-w-[240px]">
          <div className="rounded-xl border bg-popover p-2 shadow-card">
            {(item.children ?? []).map((g) => (
              <NavLink key={g.label} item={g} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
