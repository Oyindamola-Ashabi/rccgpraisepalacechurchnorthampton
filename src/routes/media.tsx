import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { Play, Headphones, Video, ArrowRight } from "lucide-react";
import worshipImg from "@/assets/worship-team.jpg";
import sermonImg from "@/assets/sermon.jpg";
import podcastImg from "@/assets/podcast.jpg";
import communityImg from "@/assets/community.jpg";
import heroImg from "@/assets/hero-worship.jpg";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media — PraisePalace Church" },
      { name: "description", content: "Sermons, worship sessions, podcasts and video content from PraisePalace Church." },
      { property: "og:title", content: "Media — PraisePalace Church" },
      { property: "og:description", content: "Watch and listen anytime, anywhere." },
      { property: "og:url", content: "/media" },
    ],
    links: [{ rel: "canonical", href: "/media" }],
  }),
  component: MediaPage,
});

function MediaPage() {
  return (
    <>
      <PageHero eyebrow="Watch. Listen. Grow." title="Media Library" subtitle="Sermons, worship, testimonies and podcasts — anywhere, anytime." image={heroImg} />

      <Section>
        <SectionHeader eyebrow="Featured" title="Latest Message" />
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-elegant ring-1 ring-black/5">
          <div className="relative aspect-video bg-black">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/videoseries?list=PLbpi6ZahtOH6J5oPGySZcmTHtOLz-8s6u"
              title="Latest sermon"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </Section>

      <section className="bg-secondary/40 border-y">
        <Section>
          <SectionHeader eyebrow="Explore" title="Video Sermons" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { image: sermonImg, title: "The Power of Praise", speaker: "Pastor Iredele", date: "07 Jul 2026" },
              { image: worshipImg, title: "Worship Night — Highlights", speaker: "PraisePalace Worship", date: "28 Jun 2026" },
              { image: communityImg, title: "Faith Over Fear", speaker: "Pastor Olusola", date: "22 Jun 2026" },
              { image: sermonImg, title: "It Shall End In Praise", speaker: "Pastor Iredele", date: "14 Jun 2026" },
              { image: worshipImg, title: "Encounter Sunday", speaker: "Guest Minister", date: "07 Jun 2026" },
              { image: communityImg, title: "Kingdom Purpose", speaker: "Pastor Olusola", date: "31 May 2026" },
            ].map((s) => (
              <article key={s.title} className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5">
                <div className="relative aspect-video overflow-hidden">
                  <img src={s.image} alt={s.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition grid place-items-center">
                    <div className="grid h-14 w-14 place-items-center rounded-full gradient-brand text-white shadow-elegant">
                      <Play className="h-6 w-6 ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-lg leading-tight">{s.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.speaker} · {s.date}</p>
                </div>
              </article>
            ))}
          </div>
        </Section>
      </section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/media/podcast" className="group relative overflow-hidden rounded-2xl shadow-elegant">
            <img src={podcastImg} alt="Podcast" className="w-full aspect-[16/10] object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a0d2a]/90 via-[#3a0d2a]/40 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <Headphones className="h-8 w-8 text-[#F0DE51]" />
              <h3 className="mt-3 font-display font-bold text-2xl">Praise Talks Podcast</h3>
              <p className="mt-1 text-sm text-white/80">Conversations that stir faith and fuel purpose.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#F0DE51]">Listen now <ArrowRight className="h-4 w-4" /></span>
            </div>
          </Link>
          <a href="https://praisepalaceradio.com/" target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-2xl shadow-elegant">
            <img src={worshipImg} alt="Radio" className="w-full aspect-[16/10] object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d2a3a]/90 via-[#0d2a3a]/40 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <Video className="h-8 w-8 text-[#91D7F6]" />
              <h3 className="mt-3 font-display font-bold text-2xl">PraisePalace Radio</h3>
              <p className="mt-1 text-sm text-white/80">Faith-filled broadcasts, streaming 24/7.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#91D7F6]">Tune in ↗</span>
            </div>
          </a>
        </div>
      </Section>
    </>
  );
}
