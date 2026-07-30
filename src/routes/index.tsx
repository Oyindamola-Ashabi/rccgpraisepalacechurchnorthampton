import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { HeroSlider } from "@/components/hero-slider";
import { Calendar, Clock, MapPin, ArrowRight, Play, Heart, BookOpen, Users, Music, Radio, GraduationCap, Tent, Sparkles, HandHeart } from "lucide-react";
import heroImg from "@/assets/hero-worship.jpg";
import pastorAsset from "@/assets/pastor.jpg";
const pastorsImg = pastorAsset;
import { eventPhotos, heroSlides } from "@/lib/gallery-images";
import { usePageContent, useSiteSettings, useSectionItems, imageOr, type SectionItem } from "@/lib/cms";

/** Card icons an administrator can choose per item. */
const CARD_ICONS: Record<string, any> = {
  radio: Radio,
  "graduation-cap": GraduationCap,
  tent: Tent,
  users: Users,
  heart: Heart,
  sparkles: Sparkles,
  music: Music,
  "book-open": BookOpen,
  "hand-heart": HandHeart,
};
function cardIcon(key: string | null | undefined) {
  return (key && CARD_ICONS[key]) || Sparkles;
}
import { Highlight, HighlightGold, Paragraphs } from "@/components/rich-text";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RCCG Praise Palace Northampton — It Shall End In Praise" },
      { name: "description", content: "RCCG Praise Palace Northampton — a Redeemed Christian Church of God parish. Join us for Sunday worship, bible study, ministries and community." },
      { property: "og:title", content: "RCCG Praise Palace Northampton — It Shall End In Praise" },
      { property: "og:description", content: "A vibrant RCCG family in Northampton. Worship, grow and serve with us." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const { text, image, visible } = usePageContent("home");
  const settings = useSiteSettings();
  const { rows: ministryItems } = useSectionItems("home", "ministries");

  /**
   * The "Grow. Serve. Belong." cards are individual CMS records, so each keeps
   * its own image, wording, icon and destination. The original six cards are
   * the built-in fallback, so they never disappear.
   */
  const ministryCardDefaults = [
    { title: "PraisePalace Radio", desc: "Faith-filled broadcasts, worship and word — streaming globally.", href: "https://praisepalaceradio.com/", image: eventPhotos.students.url, icon: "radio" },
    { title: "Business School", desc: "Empowering kingdom entrepreneurs with practical wisdom.", href: "https://praisepalacebusinessschool.com/", image: eventPhotos.business.url, icon: "graduation-cap" },
    { title: "Youth Camp", desc: "A powerful gathering for the next generation.", href: "https://raisingchampions.org.uk", image: eventPhotos.youth.url, icon: "tent" },
    { title: "Men Fellowship", desc: "Brothers building one another in faith, character and purpose.", href: "/ministries/mens-fellowship", image: eventPhotos.men.url, icon: "users" },
    { title: "Women Fellowship", desc: "A sisterhood of prayer, encouragement and kingdom service.", href: "/ministries/womens-fellowship", image: eventPhotos.women.url, icon: "heart" },
    { title: "Couples Retreat", desc: "A refreshing retreat for married couples — love, legacy and laughter.", href: "/events/couples-retreat", image: eventPhotos.couples.url, icon: "sparkles" },
  ];

  const homeMinistries = (ministryItems.length
    ? ministryItems.map((it: SectionItem, i: number) => ({
        key: it.id,
        title: it.title ?? ministryCardDefaults[i]?.title ?? "",
        desc: it.body ?? "",
        href: it.cta_href ?? "#",
        image: imageOr(it.image_url, ministryCardDefaults[i]?.image ?? eventPhotos.students.url),
        icon: cardIcon(it.icon_key),
      }))
    : ministryCardDefaults.map((d, i) => {
        const key = `ministry_card_${i + 1}`;
        return {
          key,
          title: text(key, "headline", d.title),
          desc: text(key, "body", d.desc),
          href: text(key, "cta_href", d.href),
          image: image(key, d.image),
          icon: cardIcon(d.icon),
          show: visible(key),
        };
      })
  ).filter((m: any) => m.show !== false) as any[];


  const eventCardDefaults = [
    { image: eventPhotos.couples.url, tag: "Couples", title: "Love & Legacy Couples Retreat", date: "Sat, 15 Aug 2026", location: "Praise Palace Auditorium", to: "/events/couples" },
    { image: eventPhotos.celebration.url, tag: "Family", title: "Fathers' Honour Sunday", date: "Sun, 21 Jun 2026", location: "Main Sanctuary", to: "/events" },
    { image: eventPhotos.modernWorship.url, tag: "Worship", title: "Praise Talks Live Recording", date: "Wed, 09 Jul 2026", location: "Studio B", to: "/events" },
  ];
  const homeEvents = eventCardDefaults
    .map((d, i) => {
      const key = `event_card_${i + 1}`;
      return {
        key,
        image: image(key, d.image),
        tag: text(key, "subheading", d.tag),
        title: text(key, "headline", d.title),
        date: text(key, "body", d.date),
        location: text(key, "cta_label", d.location),
        to: text(key, "cta_href", d.to),
        show: visible(key),
      };
    })
    .filter((e) => e.show);

  const watchLiveHref = text("hero_watch_live", "cta_href", "/media");
  const watchLiveExternal = /^https?:/.test(watchLiveHref);
  const heroHref = text("hero", "cta_href", "/plan-a-visit");
  const heroExternal = /^https?:/.test(heroHref);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <HeroSlider
          images={[
            image("hero_slide_1", heroImg),
            image("hero_slide_2", heroSlides[0].url),
            image("hero_slide_3", heroSlides[1].url),
          ]}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-40 text-white">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-1.5 text-xs uppercase tracking-[0.25em]">
              <Sparkles className="h-3.5 w-3.5 text-[#F0DE51]" /> {text("hero", "subheading", "Welcome Home")}
            </div>
            <h1 className="font-display font-black text-5xl md:text-7xl leading-[1.05]">
              <HighlightGold text={text("hero", "headline", "It Shall End In *Praise*.")} />
            </h1>
            <p className="mt-6 max-w-xl text-white/90 text-lg">
              {text("hero", "body", settings.short_description ?? "RCCG Praise Palace Northampton is a family — a house of worship where every heart finds a home. Join us for Sunday service, midweek study, and life-changing encounters.")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {heroExternal ? (
                <BrandButton href={heroHref} external variant="gold">{text("hero", "cta_label", "Plan Your Visit")}</BrandButton>
              ) : (
                <BrandButton to={heroHref} variant="gold">{text("hero", "cta_label", "Plan Your Visit")}</BrandButton>
              )}
              {watchLiveExternal ? (
                <BrandButton href={watchLiveHref} external variant="outline">
                  <Play className="h-4 w-4 mr-2" /> {text("hero_watch_live", "cta_label", "Watch Live")}
                </BrandButton>
              ) : (
                <BrandButton to={watchLiveHref} variant="outline">
                  <Play className="h-4 w-4 mr-2" /> {text("hero_watch_live", "cta_label", "Watch Live")}
                </BrandButton>
              )}
            </div>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl">
              <ServiceTime
                label={text("hero_service_1", "headline", "Worship")}
                day={text("hero_service_1", "subheading", "Sundays")}
                time={text("hero_service_1", "body", "10:00 AM")}
              />
              <ServiceTime
                label={text("hero_service_2", "headline", "Bible Study")}
                day={text("hero_service_2", "subheading", "Wednesdays")}
                time={text("hero_service_2", "body", "7:00 PM")}
              />
              <ServiceTime
                label={text("hero_service_3", "headline", "Night Vigil")}
                day={text("hero_service_3", "subheading", "Last Friday")}
                time={text("hero_service_3", "body", "11:00 PM")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME / ABOUT */}
      <section className="bg-gradient-to-b from-background to-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-20 grid gap-12 lg:grid-cols-2 items-center">
          <div className="relative">
            <img src={image("welcome", eventPhotos.fathers.url)} alt="RCCG Praise Palace family" className="rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]" loading="lazy" width={1200} height={800} />
            <div className="absolute -bottom-6 -right-6 hidden md:block bg-[#F0DE51] rounded-2xl p-6 shadow-card max-w-[240px]">
              <div className="font-display font-bold text-2xl text-[#3a2b00] leading-tight">A Family for All Nations</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-[#3a2b00]/70">One House. One Praise.</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E13495] mb-3">{text("welcome", "subheading", "Welcome Home")}</div>
            <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">
              <Highlight text={text("welcome", "headline", "We Have Been Waiting *For You.*")} />
            </h2>
            <div className="mt-5 text-muted-foreground leading-relaxed">
              <Paragraphs text={text("welcome", "body", "RCCG Praise Palace Northampton is a family church for all nations — a parish of The Redeemed Christian Church of God. We are a community experiencing steady growth by His grace, dedicated to prayer, worship and the pursuit of Christ.\n\nYou are invited to join us for any of our services as we seek to bring alive the glory of His kingdom.")} />
            </div>
            <ul className="mt-6 space-y-3">
              {[
                "Join us every Sunday by 10AM",
                "We pray, we worship, we share the word",
                "A welcoming home for every heart",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full gradient-brand" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <BrandButton to={text("welcome", "cta_href", "/about")}>{text("welcome", "cta_label", "About Us")}</BrandButton>
              <Link to="/plan-a-visit" className="inline-flex items-center gap-2 text-sm font-semibold text-[#E13495] hover:underline">
                Visit us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <Section>
        <SectionHeader
          eyebrow={text("programs", "subheading", "Our Programs")}
          title={text("programs", "headline", "Weekly Rhythms of Grace")}
          subtitle={text("programs", "body", "A steady heartbeat of prayer, worship and word — come as you are.")}
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Heart, title: text("program_card_1", "headline", "Sunday Service"), time: text("program_card_1", "subheading", "10:00 AM"), desc: text("program_card_1", "body", "Worship, word and community for the whole family.") },
            { icon: BookOpen, title: text("program_card_2", "headline", "Bible Study"), time: text("program_card_2", "subheading", "Wed · 7:00 PM"), desc: text("program_card_2", "body", "Go deep into the scriptures every Wednesday.") },
            { icon: Music, title: text("program_card_3", "headline", "Night Vigil"), time: text("program_card_3", "subheading", "Last Fri · 11:00 PM"), desc: text("program_card_3", "body", "A monthly night of prayer, worship and breakthrough.") },
            { icon: Users, title: text("program_card_4", "headline", "Prayer Connect"), time: text("program_card_4", "subheading", "Last Day · 11:30 PM"), desc: text("program_card_4", "body", "Closing every month in agreement and intercession.") },
          ].map((p) => (
            <div key={p.title} className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5 hover:-translate-y-1 transition">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full gradient-brand opacity-10 group-hover:opacity-20 transition" />
              <div className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-xl gradient-brand text-white shadow-elegant">
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display font-bold text-xl">{p.title}</h3>
                <p className="mt-1 text-sm font-semibold text-[#E13495]">{p.time}</p>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* MINISTRIES */}
      <section className="bg-secondary/40 border-y">
        <Section className="!py-20">
          <SectionHeader
            eyebrow={text("ministries", "subheading", "Our Ministries")}
            title={text("ministries", "headline", "Grow. Serve. Belong.")}
            subtitle={text("ministries", "body", "Extensions of Praise Palace touching every area of life — radio, business, family and youth.")}
          />
          <div className="grid gap-6 md:grid-cols-3">
            {homeMinistries.map((m: any) => (
              <MinistryCard
                key={m.title}
                icon={m.icon}
                title={m.title}
                desc={m.desc}
                href={m.href}
                image={m.image}
              />
            ))}
          </div>
        </Section>
      </section>

      {/* PASTORS */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E13495] mb-3">{text("pastor", "subheading", "Our Leader")}</div>
            <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">
              <Highlight text={text("pastor", "headline", "Passionate About *the Gospel.*")} />
            </h2>
            <div className="mt-5 text-muted-foreground leading-relaxed">
              <Paragraphs text={text("pastor", "body", "Pastor Abiodun Bamgbala leads RCCG Praise Palace Northampton with grace, wisdom and an unwavering conviction that it shall all end in praise. He is dedicated to the cause of Jesus Christ, spreading the gospel — evidenced by signs, wonders and lives transformed.")} />
            </div>
            <div className="mt-6 flex gap-3">
              <BrandButton to="/about">Meet Our Pastor</BrandButton>
              <BrandButton to="/book-appointment" variant="outline">Book Appointment</BrandButton>
            </div>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-elegant">
              <img src={image("pastor", pastorsImg)} alt="Pastor Abiodun Bamgbala" className="w-full aspect-[4/5] object-cover" loading="lazy" width={1000} height={1200} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="font-display font-bold text-2xl">Pastor Abiodun Bamgbala</div>
                <div className="text-sm text-white/80">Lead Pastor, RCCG Praise Palace Northampton</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* EVENTS PREVIEW */}
      <section className="bg-gradient-to-b from-background to-[#fdf3f9]">
        <Section>
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E13495] mb-3">{text("events", "subheading", "Upcoming")}</div>
              <h2 className="font-display font-bold text-3xl md:text-4xl">{text("events", "headline", "Events You'll Love")}</h2>
            </div>
            <Link to="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-[#E13495] hover:underline">
              View all events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {homeEvents.map((e) => (
              <EventCard key={e.key} image={e.image} tag={e.tag} title={e.title} date={e.date} location={e.location} to={e.to} />
            ))}
          </div>
        </Section>
      </section>

      {/* GIVING CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center text-white">
          <HandHeart className="h-12 w-12 mx-auto mb-4 text-[#F0DE51]" />
          <h2 className="font-display font-bold text-3xl md:text-5xl">
            <HighlightGold text={text("giving_cta", "headline", "Don't wait for the right moment — *discover God now.*")} />
          </h2>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto">
            {text("giving_cta", "body", "Bring your tithes into the storehouse. Give cheerfully, sow generously — and see the windows of heaven open over your life.")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <BrandButton to={text("giving_cta", "cta_href", "/give")} variant="gold">{text("giving_cta", "cta_label", "Give Now")}</BrandButton>
            <BrandButton to="/contact" variant="outline">Contact Us</BrandButton>
          </div>
        </div>
      </section>
    </>
  );
}

function ServiceTime({ day, time, label }: { day: string; time: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur px-4 py-3">
      <div className="text-[10px] uppercase tracking-widest text-[#F0DE51]">{label}</div>
      <div className="font-display font-bold text-lg">{day}</div>
      <div className="text-xs text-white/80 flex items-center gap-1"><Clock className="h-3 w-3" /> {time}</div>
    </div>
  );
}

function MinistryCard({ icon: Icon, title, desc, href, image }: { icon: any; title: string; desc: string; href: string; image: string }) {
  const internal = href.startsWith("/");
  const Wrapper: any = internal ? Link : "a";
  const wrapperProps: any = internal
    ? { to: href }
    : { href, target: "_blank", rel: "noopener noreferrer" };
  return (
    <Wrapper {...wrapperProps} className="group relative overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5 bg-card block">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4 grid h-11 w-11 place-items-center rounded-xl gradient-brand text-white shadow-elegant">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-display font-bold text-xl">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#E13495]">
          {internal ? "Learn more" : "Visit site"} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Wrapper>
  );
}

function EventCard({ image, tag, title, date, location, to }: { image: string; tag: string; title: string; date: string; location: string; to: string }) {
  return (
    <Link to={to} className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5 block">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
        <span className="absolute top-3 left-3 rounded-full gradient-brand text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1">{tag}</span>
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-lg leading-tight">{title}</h3>
        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#E13495]" /> {date}</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#E13495]" /> {location}</div>
        </div>
      </div>
    </Link>
  );
}
