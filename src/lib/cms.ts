import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "media";

export type SiteSettings = {
  id: string;
  church_name: string;
  short_description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  service_times: string | null;
  map_url: string | null;
  footer_text: string | null;
  copyright_text: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  facebook_url: string | null;
};

/** Values currently shown on the website — used until an administrator edits them. */
export const SETTINGS_FALLBACK: SiteSettings = {
  id: "",
  church_name: "RCCG Praise Palace Northampton",
  short_description:
    "A vibrant Redeemed Christian Church of God parish in Northampton, UK. Come as you are — it shall end in praise.",
  phone: "+44 7000 000 000",
  email: "rccgpraisepalace01@gmail.com",
  address: "Briar Hill Community Centre NN4 8SX",
  service_times: "Sunday Worship 10:00 AM · Wednesday Bible Study 7:00 PM",
  map_url: "https://www.google.com/maps/search/?api=1&query=Briar+Hill+Community+Centre+NN4+8SX",
  footer_text:
    "A vibrant Redeemed Christian Church of God parish in Northampton, UK. Come as you are — it shall end in praise.",
  copyright_text: "© {year} RCCG Praise Palace Northampton. All rights reserved.",
  instagram_url: "https://www.instagram.com/rccg_praisepalace_northampton/",
  youtube_url: "https://www.youtube.com/@rccg_praisepalace_northampton",
  facebook_url: "https://www.facebook.com/profile.php?id=100069680592786",
};

/** Merge DB values over the fallback, ignoring null/empty strings so nothing ever goes blank. */
function merge<T extends Record<string, any>>(fallback: T, row: Partial<T> | null | undefined): T {
  if (!row) return fallback;
  const out: any = { ...fallback };
  for (const [k, v] of Object.entries(row)) {
    if (v !== null && v !== undefined && v !== "") out[k] = v;
  }
  return out as T;
}

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(SETTINGS_FALLBACK);

  useEffect(() => {
    let active = true;
    supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setSettings(merge(SETTINGS_FALLBACK, data as any));
      });
    return () => {
      active = false;
    };
  }, []);

  return settings;
}

export type PageSection = {
  id: string;
  page_slug: string;
  section_key: string;
  page_title: string | null;
  headline: string | null;
  subheading: string | null;
  body: string | null;
  cta_label: string | null;
  cta_href: string | null;
  image_url: string | null;
  is_visible: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
};

export const CMS_PAGES = [
  { slug: "home", label: "Homepage" },
  { slug: "about", label: "About" },
  { slug: "media", label: "Media" },
  { slug: "contact", label: "Contact" },
  { slug: "plan-a-visit", label: "Plan a Visit" },
  { slug: "prayer-request", label: "Prayer Request" },
  { slug: "share-testimony", label: "Share a Testimony" },
  { slug: "give", label: "Giving" },
] as const;

/** Sections the website looks for on each page. Admins can also add their own keys. */
export const DEFAULT_SECTION_KEYS = ["hero", "intro", "cta"];

/**
 * Every section key the website reads, per page. Each entry is a separate
 * record so repeated cards and images can be edited independently.
 */
export const SECTION_KEY_SUGGESTIONS: Record<string, { key: string; label: string }[]> = {
  home: [
    { key: "hero", label: "Hero text and buttons" },
    { key: "hero_slide_1", label: "Hero slider image 1" },
    { key: "hero_slide_2", label: "Hero slider image 2" },
    { key: "hero_slide_3", label: "Hero slider image 3" },
    { key: "hero_watch_live", label: "Watch Live button" },
    { key: "hero_service_1", label: "Service card 1 (Worship)" },
    { key: "hero_service_2", label: "Service card 2 (Bible Study)" },
    { key: "hero_service_3", label: "Service card 3 (Night Vigil)" },
    { key: "welcome", label: "Welcome section + image" },
    { key: "programs", label: "Weekly Rhythms heading" },
    { key: "program_card_1", label: "Weekly Rhythms card 1" },
    { key: "program_card_2", label: "Weekly Rhythms card 2" },
    { key: "program_card_3", label: "Weekly Rhythms card 3" },
    { key: "program_card_4", label: "Weekly Rhythms card 4" },
    { key: "ministries", label: "Grow. Serve. Belong. heading" },
    { key: "ministry_card_1", label: "Grow/Serve/Belong card 1" },
    { key: "ministry_card_2", label: "Grow/Serve/Belong card 2" },
    { key: "ministry_card_3", label: "Grow/Serve/Belong card 3" },
    { key: "pastor", label: "Pastor section + photo" },
    { key: "events", label: "Events heading" },
    { key: "event_card_1", label: "Event preview card 1" },
    { key: "event_card_2", label: "Event preview card 2" },
    { key: "event_card_3", label: "Event preview card 3" },
    { key: "giving_cta", label: "Giving call to action" },
  ],
  media: [{ key: "hero", label: "Media page hero (heading + background image)" }],
};

/**
 * Remembers the last content loaded for each page so moving between pages
 * never shows the built-in wording again once the real content is known.
 */
const sectionCache = new Map<string, Record<string, PageSection>>();

/** All sections for a page, including hidden ones (visibility is applied by the caller). */
export function usePageSectionsAll(pageSlug: string) {
  const [sections, setSections] = useState<Record<string, PageSection>>(
    () => sectionCache.get(pageSlug) ?? {},
  );

  useEffect(() => {
    let active = true;
    const cached = sectionCache.get(pageSlug);
    if (cached) setSections(cached);
    supabase
      .from("page_sections")
      .select("*")
      .eq("page_slug", pageSlug)
      .order("sort_order")
      .then(({ data }) => {
        if (!active || !data) return;
        const map = Object.fromEntries(
          (data as any[]).map((s) => [s.section_key, s as PageSection]),
        );
        sectionCache.set(pageSlug, map);
        setSections(map);
      });
    return () => {
      active = false;
    };
  }, [pageSlug]);

  return sections;
}


export function usePageSections(pageSlug: string) {
  const all = usePageSectionsAll(pageSlug);
  return Object.fromEntries(Object.entries(all).filter(([, s]) => s.is_visible));
}

/** Returns the CMS section if one exists and is visible, otherwise null (page keeps its built-in content). */
export function usePageSection(pageSlug: string, sectionKey: string): PageSection | null {
  const sections = usePageSections(pageSlug);
  return sections[sectionKey] ?? null;
}

/**
 * Content helpers for a page. Every getter falls back to the wording or image
 * already designed into the page, so nothing ever goes blank or disappears.
 */
export function usePageContent(pageSlug: string) {
  const all = usePageSectionsAll(pageSlug);
  const sections = Object.fromEntries(Object.entries(all).filter(([, s]) => s.is_visible));

  function text(key: string, field: "headline" | "subheading" | "body" | "cta_label" | "cta_href" | "page_title", fallback: string) {
    const value = sections[key]?.[field];
    return typeof value === "string" && value.trim() ? value : fallback;
  }

  function image(key: string, fallback: string) {
    return mediaUrl(sections[key]?.image_url) || fallback;
  }

  /** A card is shown unless an administrator has explicitly hidden its record. */
  function visible(key: string) {
    return all[key] ? all[key].is_visible : true;
  }

  return { sections, all, text, image, visible };
}


export type Ministry = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  image_url: string | null;
  leader: string | null;
  meeting_info: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ChurchEvent = {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  venue: string | null;
  image_url: string | null;
  registration_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
};

export type GalleryAlbum = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  sort_order: number;
};

export type GalleryImage = {
  id: string;
  album_id: string;
  image_url: string;
  caption: string | null;
  alt_text: string | null;
  sort_order: number;
};

export type GivingContent = {
  id: string;
  intro_text: string | null;
  instructions: string | null;
  payment_details: string | null;
  external_link: string | null;
  cta_label: string | null;
  cta_href: string | null;
  image_url: string | null;
};

export type PublishedTestimony = {
  id: string;
  full_name: string;
  title: string;
  testimony: string;
  created_at: string;
};

export type Sermon = {
  id: string;
  title: string;
  slug: string;
  speaker: string | null;
  sermon_date: string | null;
  short_description: string | null;
  full_description: string | null;
  category: string | null;
  youtube_url: string | null;
  youtube_video_id: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
};

export type Podcast = {
  id: string;
  title: string;
  slug: string;
  speaker_or_host: string | null;
  description: string | null;
  publication_date: string | null;
  audio_file_url: string | null;
  external_audio_url: string | null;
  cover_image_url: string | null;
  duration: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
};

/**
 * Podcast audio lives in the same public media store as images, inside a
 * "podcasts/" folder, so uploads work without a second storage area.
 */
export const PODCAST_BUCKET = MEDIA_BUCKET;
export const PODCAST_FOLDER = "podcasts";


/** Pull the 11-character video id out of any common YouTube URL form. */
export function youTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (/^[\w-]{11}$/.test(raw)) return raw;
  const m =
    raw.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/) ?? null;
  return m ? m[1] : null;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function usePublishedSermons() {
  return useCmsList<Sermon>(() =>
    supabase
      .from("sermons" as any)
      .select("*")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("sort_order")
      .order("sermon_date", { ascending: false, nullsFirst: false }),
  );
}

/** The standard YouTube poster for a video id. */
export function youTubePoster(videoId: string | null | undefined): string | null {
  return videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null;
}

/**
 * The large poster image for a sermon: the administrator's thumbnail first,
 * then the YouTube image, then the page's built-in image.
 */
export function sermonPoster(sermon: Sermon | null | undefined, fallback: string): string {
  if (!sermon) return fallback;
  const id = sermon.youtube_video_id || youTubeId(sermon.youtube_url);
  return mediaUrl(sermon.thumbnail_url) || youTubePoster(id) || fallback;
}

/** Featured published sermon, otherwise the newest published sermon. */
export function pickFeaturedSermon(rows: Sermon[]): Sermon | null {
  if (rows.length === 0) return null;
  const featured = rows.find((s) => s.is_featured);
  if (featured) return featured;
  const dated = [...rows].sort((a, b) => (b.sermon_date ?? "").localeCompare(a.sermon_date ?? ""));
  return dated[0] ?? null;
}

export function usePublishedPodcasts() {
  return useCmsList<Podcast>(() =>
    supabase
      .from("podcasts" as any)
      .select("*")
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("sort_order")
      .order("publication_date", { ascending: false, nullsFirst: false }),
  );
}

/** Public URL for an uploaded podcast audio file (accepts a full URL too). */
export function podcastAudioUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  if (/^(https?:)?\/\//.test(pathOrUrl) || pathOrUrl.startsWith("/")) return pathOrUrl;
  return supabase.storage.from(PODCAST_BUCKET).getPublicUrl(pathOrUrl).data.publicUrl;
}

/** True when a link points straight at an audio file the browser can play in-page. */
export function isDirectAudio(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(mp3|m4a|mp4|wav|ogg|oga|opus|webm|aac|flac)(\?.*)?$/i.test(url.split("#")[0]);
}

/** Playback source for an episode: uploaded file first, then a direct audio link. */
export function episodeAudioSource(ep: Podcast): { src: string | null; external: string | null } {
  const uploaded = podcastAudioUrl(ep.audio_file_url);
  if (uploaded) return { src: uploaded, external: ep.external_audio_url ?? null };
  if (isDirectAudio(ep.external_audio_url)) return { src: ep.external_audio_url!, external: null };
  return { src: null, external: ep.external_audio_url ?? null };
}

/** Generic read hook with a safe fallback so the public site never renders blank. */
export function useCmsList<T>(
  loader: () => PromiseLike<{ data: any; error: any }>,
  deps: unknown[] = [],
): { rows: T[]; loading: boolean; reload: () => void } {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.resolve(loader()).then(({ data }) => {
      if (!active) return;
      setRows((data as T[]) ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { rows, loading, reload: () => setTick((t) => t + 1) };
}

/** Published events that have not happened yet, soonest first. */
export function usePublishedEvents() {
  return useCmsList<ChurchEvent>(() =>
    supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .gte("start_at", new Date().toISOString())
      .order("start_at", { ascending: true }),
  );
}

export function useActiveMinistries() {
  return useCmsList<Ministry>(() =>
    supabase.from("ministries").select("*").eq("is_active", true).order("sort_order").order("name"),
  );
}


export function usePublishedTestimonies(limit?: number) {
  return useCmsList<PublishedTestimony>(() => {
    let q = supabase
      .from("published_testimonies" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (limit) q = q.limit(limit);
    return q;
  }, [limit]);
}

export function useGivingContent(): GivingContent | null {
  const [row, setRow] = useState<GivingContent | null>(null);
  useEffect(() => {
    let active = true;
    supabase
      .from("giving_content")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setRow(data as any);
      });
    return () => {
      active = false;
    };
  }, []);
  return row;
}

/** Public URL for a file stored in the media bucket (accepts a full URL too). */
export function mediaUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  if (/^(https?:)?\/\//.test(pathOrUrl) || pathOrUrl.startsWith("/")) return pathOrUrl;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(pathOrUrl).data.publicUrl;
}

/** Use a CMS image when present, otherwise keep the image already on the page. */
export function imageOr(cmsUrl: string | null | undefined, fallback: string): string {
  return mediaUrl(cmsUrl) || fallback;
}

export function textOr(value: string | null | undefined, fallback: string): string {
  return value && value.trim() ? value : fallback;
}

export function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatEventTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/* =====================================================================
 * Section items — one editable record per card/image inside a section
 * ===================================================================== */

export type SectionItem = {
  id: string;
  section_id: string;
  item_key: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  image_url: string | null;
  icon_key: string | null;
  cta_label: string | null;
  cta_href: string | null;
  link_type: "internal" | "external" | "none";
  link_target: "self" | "blank";
  is_visible: boolean;
  sort_order: number;
};

export const SECTION_TEMPLATES = [
  { value: "hero", label: "Hero (big heading + background image)" },
  { value: "rich_text", label: "Rich text block" },
  { value: "image_and_text", label: "Image beside text" },
  { value: "card_grid", label: "Card grid (uses items)" },
  { value: "image_grid", label: "Image grid / slider (uses items)" },
  { value: "cta", label: "Call to action" },
  { value: "event_list", label: "Event list" },
  { value: "album_list", label: "Photo albums" },
  { value: "form_section", label: "Form section" },
  { value: "custom", label: "Custom" },
] as const;

/** Visible items for one section of one page, ordered as the administrator arranged them. */
export function useSectionItems(pageSlug: string, sectionKey: string) {
  const [rows, setRows] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: section } = await supabase
        .from("page_sections")
        .select("id")
        .eq("page_slug", pageSlug)
        .eq("section_key", sectionKey)
        .maybeSingle();
      if (!active) return;
      if (!section) {
        setRows([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("page_section_items" as any)
        .select("*")
        .eq("section_id", (section as any).id)
        .eq("is_visible", true)
        .order("sort_order");
      if (!active) return;
      setRows(((data as any[]) ?? []) as SectionItem[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [pageSlug, sectionKey]);

  return { rows, loading };
}

/* =====================================================================
 * Navigation
 * ===================================================================== */

export type NavRecord = {
  id: string;
  parent_id: string | null;
  label: string;
  href: string;
  link_type: "internal" | "external" | "none";
  is_external: boolean;
  is_visible: boolean;
  sort_order: number;
  location: "header" | "footer";
};

export type NavNode = NavRecord & { children: NavNode[] };

function buildNavTree(rows: NavRecord[]): NavNode[] {
  const byId = new Map<string, NavNode>();
  rows.forEach((r) => byId.set(r.id, { ...r, children: [] }));
  const roots: NavNode[] = [];
  byId.forEach((node) => {
    if (node.parent_id && byId.has(node.parent_id)) byId.get(node.parent_id)!.children.push(node);
    else if (!node.parent_id) roots.push(node);
  });
  const sortRec = (list: NavNode[]) => {
    list.sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label));
    list.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

/** Menu managed in Admin → Navigation. Empty until records exist, so callers keep their built-in menu. */
export function useNavigation(location: "header" | "footer" = "header") {
  const [tree, setTree] = useState<NavNode[]>([]);

  useEffect(() => {
    let active = true;
    supabase
      .from("nav_items" as any)
      .select("*")
      .eq("location", location)
      .eq("is_visible", true)
      .order("sort_order")
      .then(({ data }) => {
        if (active && data) setTree(buildNavTree(data as any as NavRecord[]));
      });
    return () => {
      active = false;
    };
  }, [location]);

  return tree;
}

/* =====================================================================
 * Events — upcoming and past
 * ===================================================================== */

export type ChurchEventRow = ChurchEvent & { slug: string | null; detail_page: string | null };

/** Published events that have already happened, most recent first. */
export function usePastEvents(limit = 24) {
  return useCmsList<ChurchEventRow>(() =>
    supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .lt("start_at", new Date().toISOString())
      .order("start_at", { ascending: false })
      .limit(limit),
  );
}

/** Where an event card should link: its own page, then a registration link, else nowhere. */
export function eventLink(ev: Partial<ChurchEventRow>): { to: string | null; external: boolean } {
  if (ev.detail_page) return { to: ev.detail_page, external: false };
  if (ev.registration_url) return { to: ev.registration_url, external: true };
  return { to: null, external: false };
}

/* =====================================================================
 * Podcast playback (uploaded / external platform / YouTube)
 * ===================================================================== */

export type PodcastRow = Podcast & {
  playback_type: "upload" | "external" | "youtube";
  youtube_url: string | null;
  youtube_video_id: string | null;
};

export type EpisodeSource =
  | { kind: "audio"; src: string; external: string | null }
  | { kind: "youtube"; videoId: string; url: string }
  | { kind: "external"; url: string }
  | { kind: "none" };

/** How an episode should play, based on the source type chosen in the admin area. */
export function episodeSource(ep: Partial<PodcastRow>): EpisodeSource {
  const type = ep.playback_type ?? (ep.audio_file_url ? "upload" : ep.external_audio_url ? "external" : "upload");
  if (type === "youtube") {
    const id = ep.youtube_video_id || youTubeId(ep.youtube_url);
    if (id) return { kind: "youtube", videoId: id, url: ep.youtube_url || `https://www.youtube.com/watch?v=${id}` };
  }
  const uploaded = podcastAudioUrl(ep.audio_file_url);
  if (type === "upload" && uploaded) return { kind: "audio", src: uploaded, external: ep.external_audio_url ?? null };
  if (ep.external_audio_url) {
    if (isDirectAudio(ep.external_audio_url)) return { kind: "audio", src: ep.external_audio_url, external: null };
    return { kind: "external", url: ep.external_audio_url };
  }
  if (uploaded) return { kind: "audio", src: uploaded, external: null };
  return { kind: "none" };
}

/** Friendly platform name for an external episode link. */
export function platformName(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("spotify")) return "Spotify";
  if (u.includes("apple")) return "Apple Podcasts";
  if (u.includes("youtube") || u.includes("youtu.be")) return "YouTube";
  if (u.includes("audiomack")) return "Audiomack";
  if (u.includes("soundcloud")) return "SoundCloud";
  return "Listen";
}

/* =====================================================================
 * Gallery albums
 * ===================================================================== */

export type GalleryAlbumRow = GalleryAlbum & {
  category: string;
  event_slug: string | null;
  location: string | null;
  album_year: number | null;
  album_date: string | null;
};

export function usePublishedAlbums(eventSlug?: string) {
  return useCmsList<GalleryAlbumRow>(() => {
    let q = supabase
      .from("gallery_albums")
      .select("*")
      .eq("is_published", true)
      .order("album_year", { ascending: false, nullsFirst: false })
      .order("sort_order");
    if (eventSlug) q = q.eq("event_slug", eventSlug);
    return q;
  }, [eventSlug ?? ""]);
}

export function useAlbumImages(albumId: string | null) {
  return useCmsList<GalleryImage>(() => {
    if (!albumId) return Promise.resolve({ data: [], error: null }) as any;
    return supabase.from("gallery_images").select("*").eq("album_id", albumId).order("sort_order");
  }, [albumId ?? ""]);
}
