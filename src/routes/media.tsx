import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, SectionHeader } from "@/components/section-ui";
import { VideoEmbed } from "@/components/video-embed";
import { Headphones, Video, ArrowRight, Image as ImageIcon } from "lucide-react";
import heroImg from "@/assets/hero-worship.jpg";
import { galleryPhotos, eventPhotos } from "@/lib/gallery-images";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media — RCCG Praise Palace Northampton" },
      { name: "description", content: "Sermons, worship sessions, podcasts, gallery and video content from RCCG Praise Palace Northampton." },
      { property: "og:title", content: "Media — RCCG Praise Palace Northampton" },
      { property: "og:description", content: "Watch, listen and relive our moments — anywhere, anytime." },
      { property: "og:url", content: "/media" },
      { property: "og:image", content: eventPhotos.modernWorship.url },
    ],
    links: [{ rel: "canonical", href: "/media" }],
  }),
  component: MediaPage,
});

const videos = [
  { image: eventPhotos.modernWorship.url, title: "The Power of Praise", speaker: "Pastor Abiodun Bamgbala", date: "07 Jul 2026" },
  { image: eventPhotos.dinner.url, title: "Night of Worship — Highlights", speaker: "Praise Palace Worship", date: "28 Jun 2026" },
  { image: eventPhotos.fathers.url, title: "Fathers' Honour Service", speaker: "Pastor Abiodun Bamgbala", date: "22 Jun 2026" },
  { image: eventPhotos.family.url, title: "It Shall End In Praise", speaker: "Pastor Abiodun Bamgbala", date: "14 Jun 2026" },
  { image: eventPhotos.tableFellowship.url, title: "Midweek Encounter", speaker: "Guest Minister", date: "07 Jun 2026" },
  { image: eventPhotos.familyLife.url, title: "Family Life Teaching", speaker: "Pastor (Mrs.)", date: "31 May 2026" },
];

function MediaPage() {
  return (
    <>
      <PageHero eyebrow="Watch. Listen. Grow." title="Media Library" subtitle="Sermons, worship, testimonies and podcasts — anywhere, anytime." image={heroImg} />

      <Section>
        <SectionHeader eyebrow="Featured" title="Latest Message" />
        <div className="mx-auto max-w-4xl">
          <VideoEmbed
            poster={eventPhotos.celebration.url}
            title="RCCG Praise Palace — Latest Message"
            searchQuery="RCCG Praise Palace Northampton latest sermon"
          />
        </div>
      </Section>

      <section className="bg-secondary/40 border-y">
        <Section>
          <SectionHeader eyebrow="Explore" title="Video Sermons" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((s) => (
              <article key={s.title} className="group overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-black/5">
                <VideoEmbed poster={s.image} title={s.title} searchQuery={`RCCG Praise Palace Northampton ${s.title}`} />
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
        <div className="grid gap-6 md:grid-cols-3">
          <Link to="/media/gallery" className="group relative overflow-hidden rounded-2xl shadow-elegant">
            <img src={galleryPhotos[0].url} alt="Gallery" className="w-full aspect-[16/10] object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a1d0d]/90 via-[#3a1d0d]/40 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <ImageIcon className="h-8 w-8 text-[#F0DE51]" />
              <h3 className="mt-3 font-display font-bold text-2xl">Photo Gallery</h3>
              <p className="mt-1 text-sm text-white/80">Moments of worship, family and fellowship.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#F0DE51]">Browse gallery <ArrowRight className="h-4 w-4" /></span>
            </div>
          </Link>
          <Link to="/media/podcast" className="group relative overflow-hidden rounded-2xl shadow-elegant">
            <img src={eventPhotos.guests.url} alt="Podcast" className="w-full aspect-[16/10] object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a0d2a]/90 via-[#3a0d2a]/40 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <Headphones className="h-8 w-8 text-[#F0DE51]" />
              <h3 className="mt-3 font-display font-bold text-2xl">Praise Talks Podcast</h3>
              <p className="mt-1 text-sm text-white/80">Conversations that stir faith and fuel purpose.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#F0DE51]">Listen now <ArrowRight className="h-4 w-4" /></span>
            </div>
          </Link>
          <a href="https://praisepalaceradio.com/" target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-2xl shadow-elegant">
            <img src={eventPhotos.students.url} alt="Radio" className="w-full aspect-[16/10] object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d2a3a]/90 via-[#0d2a3a]/40 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <Video className="h-8 w-8 text-[#91D7F6]" />
              <h3 className="mt-3 font-display font-bold text-2xl">Praise Palace Radio</h3>
              <p className="mt-1 text-sm text-white/80">Faith-filled broadcasts, streaming 24/7.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#91D7F6]">Tune in ↗</span>
            </div>
          </a>
        </div>
      </Section>
    </>
  );
}
