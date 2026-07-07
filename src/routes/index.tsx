import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeader, BrandButton } from "@/components/section-ui";
import { VideoEmbed } from "@/components/video-embed";
import { Calendar, Clock, MapPin, ArrowRight, Play, Heart, BookOpen, Users, Music, Radio, GraduationCap, Tent, Sparkles, HandHeart } from "lucide-react";
import heroImg from "@/assets/hero-worship.jpg";
import sermonImg from "@/assets/sermon.jpg";
import worshipImg from "@/assets/worship-team.jpg";
import communityImg from "@/assets/community.jpg";
import pastorAsset from "@/assets/pastor.jpg.asset.json";
const pastorsImg = pastorAsset.url;
import youthImg from "@/assets/youth.jpg";
import couplesImg from "@/assets/couples.jpg";
import podcastImg from "@/assets/podcast.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PraisePalace Church — It Shall End In Praise | RCCG UK" },
      { name: "description", content: "PraisePalace Church, a Redeemed Christian Church of God parish in Newport Pagnell, UK. Join us for Sunday worship, bible study, ministries and community." },
      { property: "og:title", content: "PraisePalace Church — It Shall End In Praise" },
      { property: "og:description", content: "A vibrant RCCG family in Newport Pagnell. Worship, grow and serve with us." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" className="h-full w-full object-cover" width={1600} height={1000} />
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a0d3a]/85 via-[#4a0d55]/70 to-[#7a1d70]/70" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-28 md:py-40 text-white">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur px-4 py-1.5 text-xs uppercase tracking-[0.25em]">
              <Sparkles className="h-3.5 w-3.5 text-[#F0DE51]" /> Welcome Home
            </div>
            <h1 className="font-display font-black text-5xl md:text-7xl leading-[1.05]">
              It Shall End
              <br />
              In <span className="text-[#F0DE51]">Praise</span>.
            </h1>
            <p className="mt-6 max-w-xl text-white/90 text-lg">
              PraisePalace Church is a family — a house of worship where every heart finds a home. Join us for Sunday service, midweek study, and life-changing encounters.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <BrandButton to="/about" variant="gold">Plan Your Visit</BrandButton>
              <BrandButton to="/media" variant="outline">
                <Play className="h-4 w-4 mr-2" /> Watch Live
              </BrandButton>
            </div>
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl">
              <ServiceTime day="Sundays" time="10:00 AM" label="Worship" />
              <ServiceTime day="Wednesdays" time="7:00 PM" label="Bible Study" />
              <ServiceTime day="Last Friday" time="11:00 PM" label="Night Vigil" />
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME VIDEO */}
      <Section>
        <SectionHeader
          eyebrow="Watch & Worship"
          title="Experience Our Latest Service"
          subtitle="Missed Sunday? Catch up on the word, worship and testimonies from PraisePalace."
        />
        <div className="mx-auto max-w-4xl">
          <VideoEmbed
            poster={worshipImg}
            title="PraisePalace Church — Latest Service"
            searchQuery="PraisePalace Church RCCG Newport Pagnell service"
          />
        </div>
      </Section>

      {/* WELCOME / ABOUT */}
      <section className="bg-gradient-to-b from-background to-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-20 grid gap-12 lg:grid-cols-2 items-center">
          <div className="relative">
            <img src={communityImg} alt="Community" className="rounded-3xl shadow-elegant object-cover w-full aspect-[4/3]" loading="lazy" width={1200} height={800} />
            <div className="absolute -bottom-6 -right-6 hidden md:block bg-[#F0DE51] rounded-2xl p-6 shadow-card max-w-[220px]">
              <div className="font-display font-bold text-3xl text-[#3a2b00]">15+</div>
              <div className="text-xs uppercase tracking-widest text-[#3a2b00]/70">Years of Faithful Service</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E13495] mb-3">Welcome Home</div>
            <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">
              We Have Been Waiting <span className="text-gradient-brand">For You.</span>
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              PraisePalace Church is a family church for all nations — a parish of The Redeemed Christian Church of God located in Newport Pagnell, UK. We are a community experiencing steady growth by His grace, dedicated to prayer, worship and the pursuit of Christ.
            </p>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              You are invited to join us for any of our services as we seek to bring alive the glory of His kingdom.
            </p>
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
              <BrandButton to="/about">About Us</BrandButton>
              <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[#E13495] hover:underline">
                Visit us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <Section>
        <SectionHeader
          eyebrow="Our Programs"
          title="Weekly Rhythms of Grace"
          subtitle="A steady heartbeat of prayer, worship and word — come as you are."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Heart, title: "Sunday Service", time: "10:00 AM Prompt", desc: "Worship, word and community for the whole family." },
            { icon: BookOpen, title: "Bible Study", time: "Wed · 7:00 PM", desc: "Go deep into the scriptures every Wednesday." },
            { icon: Music, title: "Night Vigil", time: "Last Fri · 11:00 PM", desc: "A monthly night of prayer, worship and breakthrough." },
            { icon: Users, title: "Prayer Connect", time: "Last Day · 11:30 PM", desc: "Closing every month in agreement and intercession." },
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
            eyebrow="Our Ministries"
            title="Grow. Serve. Belong."
            subtitle="Extensions of PraisePalace touching every area of life — radio, business, family and youth."
          />
          <div className="grid gap-6 md:grid-cols-3">
            <MinistryCard
              icon={Radio}
              title="PraisePalace Radio"
              desc="Faith-filled broadcasts, worship and word — streaming globally."
              href="https://praisepalaceradio.com/"
              image={worshipImg}
            />
            <MinistryCard
              icon={GraduationCap}
              title="Business School"
              desc="Empowering kingdom entrepreneurs with practical wisdom."
              href="https://praisepalacebusinessschool.com/"
              image={sermonImg}
            />
            <MinistryCard
              icon={Tent}
              title="Youth Camp"
              desc="A powerful gathering for the next generation."
              href="https://raisingchampions.org.uk"
              image={youthImg}
            />
          </div>
        </Section>
      </section>

      {/* PASTORS */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E13495] mb-3">Our Leaders</div>
            <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight">
              Passionate About <span className="text-gradient-brand">the Gospel.</span>
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Our Pastors are dedicated to the cause of Jesus Christ, spreading His gospel to the ends of the earth — evidenced by signs, wonders and lives transformed. They lead PraisePalace with grace, wisdom and an unwavering conviction that it shall all end in praise.
            </p>
            <div className="mt-6 flex gap-3">
              <BrandButton to="/about">Meet Our Pastors</BrandButton>
            </div>
          </div>
          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl shadow-elegant">
              <img src={pastorsImg} alt="Our Pastors" className="w-full aspect-[4/5] object-cover" loading="lazy" width={1000} height={1200} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="font-display font-bold text-2xl">Our Pastors</div>
                <div className="text-sm text-white/80">Lead Pastors, PraisePalace Church</div>
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
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#E13495] mb-3">Upcoming</div>
              <h2 className="font-display font-bold text-3xl md:text-4xl">Events You'll Love</h2>
            </div>
            <Link to="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-[#E13495] hover:underline">
              View all events <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <EventCard image={couplesImg} tag="Couples" title="Love & Legacy Couples Night" date="Sat, 15 Aug 2026" location="PraisePalace Auditorium" />
            <EventCard image={youthImg} tag="Youth" title="Youth Camp 2026" date="Fri, 20 Jun 2026" location="Sanctuary Grounds" />
            <EventCard image={podcastImg} tag="Podcast" title="Praise Talks Live Recording" date="Wed, 09 Jul 2026" location="Studio B" />
          </div>
        </Section>
      </section>

      {/* GIVING CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-brand" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center text-white">
          <HandHeart className="h-12 w-12 mx-auto mb-4 text-[#F0DE51]" />
          <h2 className="font-display font-bold text-3xl md:text-5xl">
            Don't wait for the right moment — <span className="text-[#F0DE51]">discover God now.</span>
          </h2>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto">
            Bring your tithes into the storehouse. Give cheerfully, sow generously — and see the windows of heaven open over your life.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <BrandButton to="/give" variant="gold">Give Now</BrandButton>
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
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5 bg-card">
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
          Visit site <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </a>
  );
}

function EventCard({ image, tag, title, date, location }: { image: string; tag: string; title: string; date: string; location: string }) {
  return (
    <div className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5">
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
    </div>
  );
}
