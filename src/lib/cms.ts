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
  phone: null,
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

/** Merge a site_settings row over the fallback (phone stays optional). */
export function mergeSettings(row: Partial<SiteSettings> | null | undefined): SiteSettings {
  const merged = merge(SETTINGS_FALLBACK, row);
  const phone = (row as any)?.phone;
  merged.phone = typeof phone === "string" && phone.trim() ? phone : null;
  return merged;
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
        if (!active || !data) return;
        const row = data as any;
        const merged = merge(SETTINGS_FALLBACK, row);
        // Phone numbers are optional: a blank value in Admin removes them everywhere.
        merged.phone = typeof row.phone === "string" && row.phone.trim() ? row.phone : null;
        setSettings(merged);
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
  { slug: "home", label: "Homepage", blurb: "Manage the hero images, service times, programmes, ministry cards and community content shown on the homepage." },
  { slug: "about", label: "About", blurb: "Edit the About page content and manage the photographs displayed in Life at Praise Palace." },
  { slug: "media", label: "Media", blurb: "Manage the Media page heading, Watch Live video, poster image and supporting content." },
  { slug: "couples-retreat", label: "Couples Retreat", blurb: "Edit the Couples Retreat page, upcoming retreat information, registration section and previous retreat albums." },
  { slug: "contact", label: "Contact", blurb: "Edit the Contact page heading, introduction and contact details block." },
  { slug: "plan-a-visit", label: "Plan a Visit", blurb: "Edit the Plan a Visit page wording and form introduction." },
  { slug: "prayer-request", label: "Prayer Request", blurb: "Edit the Prayer Request page wording and reassurance text." },
  { slug: "share-testimony", label: "Share a Testimony", blurb: "Edit the Share a Testimony page wording." },
  { slug: "give", label: "Giving", blurb: "Edit the Giving page heading, ways to give and bank details." },
  { slug: "events", label: "Events", blurb: "Edit the Events page banner and introduction." },
  { slug: "gallery", label: "Gallery", blurb: "Edit the Gallery page banner and introduction." },
] as const;

/** Sections the website looks for on each page. Admins can also add their own keys. */
export const DEFAULT_SECTION_KEYS = ["hero", "intro", "cta"];

/**
 * The editable blocks the website actually reads, per page. Each entry carries a
 * plain-English name, a short explanation and the layout the website uses — the
 * layout is assigned automatically so administrators never choose a template.
 */
export type SectionSpec = {
  key: string;
  label: string;
  hint: string;
  template: string;
  /** Friendly wording for the button that opens the child cards/images. */
  itemsLabel?: string;
  /** Word used for one child record, e.g. "card", "slide", "photo". */
  itemNoun?: string;
  /** Plain-English names for the section's own fields, when the generic ones do not fit. */
  sectionFields?: { headline?: string; subheading?: string; body?: string; image?: string; cta_label?: string; cta_href?: string };
  /** Plain-English names for the fields of each child card in this section. */
  itemFields?: { title?: string; subtitle?: string; body?: string; image?: string; cta_label?: string; cta_href?: string };
};

export const SECTION_LIBRARY: Record<string, SectionSpec[]> = {
  home: [
    { key: "hero", label: "Homepage Hero", hint: "The large welcome heading, text and buttons at the very top of the homepage.", template: "hero" },
    { key: "hero_slides", label: "Hero Background Slides", hint: "The photographs that fade behind the homepage hero.", template: "image_grid", itemsLabel: "Manage hero slides", itemNoun: "slide" },
    { key: "hero_services", label: "Hero Service Times", hint: "The Sunday, Wednesday and Last Friday boxes shown inside the hero.", template: "card_grid", itemsLabel: "Manage service-time cards", itemNoun: "service card" },
    { key: "hero_watch_live", label: "Watch Live button", hint: "The wording and destination of the Watch Live button in the hero.", template: "cta" },
    {
      key: "welcome",
      label: "Welcome Home",
      hint: "The small label, heading, short introduction, picture and button of the Welcome Home block on the homepage.",
      template: "image_and_text",
      sectionFields: {
        subheading: "Small label (e.g. WELCOME HOME)",
        headline: "Main heading",
        body: "Introductory text",
        image: "Supporting picture",
      },
    },
    {
      key: "welcome_highlights",
      label: "Welcome Home Highlights",
      hint: "The short points listed under the Welcome Home text. Edit, reorder, hide, remove or add as many as you like — if none are visible the section simply shows the heading and paragraph.",
      template: "card_grid",
      itemsLabel: "Manage highlights",
      itemNoun: "highlight",
      itemFields: { title: "Highlight", body: "Short description (optional)" },
    },
    {
      key: "tagline",
      label: "Homepage Tagline",
      hint: "The small gold badge beside the Welcome Home picture — “A Family for All Nations · One House. One Praise.”",
      template: "custom",
      sectionFields: { headline: "Tagline", subheading: "Second line" },
    },
    { key: "programs", label: "Weekly Rhythms of Grace", hint: "The four weekly programme cards.", template: "card_grid", itemsLabel: "Manage programme cards", itemNoun: "programme card" },
    { key: "ministries", label: "Grow. Serve. Belong.", hint: "The six ministry cards — radio, business, youth, men, women and the Couples Retreat.", template: "card_grid", itemsLabel: "Manage cards and images", itemNoun: "card" },
    { key: "pastor", label: "Pastor’s Message", hint: "The pastor introduction and photograph.", template: "image_and_text" },
    { key: "community", label: "Community Spotlight", hint: "Manage the community card displayed on the homepage, including its image, title, description and external destination.", template: "card_grid", itemsLabel: "Manage community cards", itemNoun: "community card" },
    { key: "events", label: "Events heading", hint: "The heading above the events preview on the homepage. The event cards themselves come from Admin → Events (switch on “Show on Homepage”).", template: "event_list" },
    { key: "giving_cta", label: "Giving call to action", hint: "The pink giving banner near the bottom of the homepage.", template: "cta" },
  ],
  about: [
    { key: "hero", label: "Page banner", hint: "Heading, text and background image at the top of the About page.", template: "hero" },
    { key: "welcome", label: "Welcome block", hint: "The opening picture and paragraphs.", template: "image_and_text" },
    { key: "vision", label: "Our Vision card", hint: "", template: "card_grid" },
    { key: "mission", label: "Our Mission card", hint: "", template: "card_grid" },
    { key: "values", label: "Our Values card", hint: "", template: "card_grid" },
    {
      key: "pastor",
      label: "Our Pastor",
      hint: "The Our Pastor block on the About page. The small label, heading and introduction are set here; the pastor’s name, role, biography, photograph and button are edited on the pastor card below. Switch this section off to hide the whole block.",
      template: "image_and_text",
      itemsLabel: "Manage pastor details",
      itemNoun: "pastor",
      sectionFields: {
        subheading: "Small label (e.g. Leadership)",
        headline: "Section heading (e.g. Our Pastor)",
        body: "Short introductory text",
      },
      itemFields: {
        title: "Pastor name",
        subtitle: "Role / title",
        body: "Biography",
        image: "Pastor photograph",
        cta_label: "Button wording",
        cta_href: "Button destination",
      },
    },
    { key: "life_gallery", label: "Life at Praise Palace", hint: "Upload, replace and arrange the photographs displayed in the Life at Praise Palace section of the About page.", template: "image_grid", itemsLabel: "Manage photos", itemNoun: "photo" },
    { key: "cta", label: "Closing call to action", hint: "", template: "cta" },
  ],
  media: [
    { key: "hero", label: "Media Page Hero", hint: "Heading, text and background image at the top of the Media page.", template: "hero" },
    { key: "live_video", label: "Watch Live Video", hint: "Change the YouTube video and large poster image displayed in the Watch Live area of the Media page.", template: "video" },
    {
      key: "cards",
      label: "Media Cards",
      hint: "The three large cards near the bottom of the Media page — Church Albums, Praise Talks Podcast and Praise Palace Radio. Edit the picture, wording, button and destination of each, hide any you do not need, or drag them into a different order.",
      template: "card_grid",
      itemsLabel: "Manage media cards",
      itemNoun: "media card",
      itemFields: {
        title: "Card title",
        body: "Short description",
        image: "Card image",
        cta_label: "Button wording",
        cta_href: "Destination link",
      },
    },
  ],
  "couples-retreat": [
    { key: "hero", label: "1. Page Header", hint: "The main heading, introductory text and background image at the very top of the page. The two buttons are always “Register Your Interest” and “View Previous Couples Retreats”.", template: "hero" },
    { key: "intro", label: "2. Introduction", hint: "The heading and paragraph that open the page, plus the supporting picture.", template: "image_and_text" },
    {
      key: "expect",
      label: "3. What to Expect",
      hint: "The heading and introduction, plus the list of areas explored at the retreat. Add, edit, reorder or hide list items as you wish.",
      template: "card_grid",
      itemsLabel: "Manage the list",
      itemNoun: "list item",
      sectionFields: { headline: "Section heading", body: "Introduction text", cta_label: "Closing sentence (optional)" },
      itemFields: { title: "List item", body: "Short description (optional)" },
    },
    { key: "time_away", label: "4. Time Away for the Two of You", hint: "The heading, paragraph and supporting picture of the “Time Away” block.", template: "image_and_text" },
    {
      key: "christ_centred",
      label: "5. A Christ-Centred Experience",
      hint: "The heading, paragraph and the Scripture displayed prominently. Put the Scripture and its reference in the Scripture field, separated by a vertical bar, e.g. “…text…| Ecclesiastes 4:12”.",
      template: "rich_text",
      sectionFields: { headline: "Section heading", body: "Paragraphs", subheading: "Scripture | Reference" },
    },
    { key: "who", label: "6. Who Should Attend?", hint: "The heading and paragraphs describing who the retreat is for.", template: "rich_text" },
    { key: "upcoming", label: "7. Upcoming Retreat wording", hint: "The supporting heading and introduction above the next Couples Retreat. The retreat title, date, time, venue, picture and registration status all come from Admin → Events.", template: "event_list" },
    { key: "why", label: "8. Why Attend?", hint: "The heading and paragraphs of the “Why Attend?” block.", template: "rich_text" },
    {
      key: "annual",
      label: "9. Our Annual Retreats",
      hint: "The cards describing the retreats held each year. Add, edit, reorder or remove them freely.",
      template: "card_grid",
      itemsLabel: "Manage retreat cards",
      itemNoun: "retreat card",
      sectionFields: { headline: "Section heading", body: "Closing sentence" },
      itemFields: { title: "Retreat name", body: "Description" },
    },
    { key: "closing", label: "10. Come and Grow Together", hint: "The closing invitation, its highlighted line and the final call to action.", template: "cta", sectionFields: { headline: "Heading", subheading: "Highlighted line", body: "Closing words" } },
    { key: "register", label: "11. Registration Section", hint: "The heading, introduction and help text shown above the registration form. Submitted registrations appear in Admin → Event Registrations.", template: "form_section" },
    { key: "contact", label: "12. Contact / Help", hint: "The help banner at the bottom of the page for couples with questions.", template: "cta" },
    { key: "details", label: "Supporting picture (Introduction)", hint: "An additional photograph used beside the retreat information.", template: "image_and_text" },
    { key: "albums", label: "Albums Link wording", hint: "The wording of the section that points visitors to the Couples Retreat albums.", template: "album_list" },
  ],

};

/** Plain-English names for common section keys used across the remaining pages. */
const GENERIC_SECTION_LABELS: Record<string, string> = {
  hero: "Page banner (heading, text and background image)",
  intro: "Introduction block",
  welcome: "Welcome section",
  welcome_highlights: "Welcome Home Highlights",
  tagline: "Homepage Tagline",
  vision: "Our Vision card",
  mission: "Our Mission card",
  values: "Our Values card",
  pastor: "Pastor section",
  life_gallery: "Life at Praise Palace photos",
  cta: "Closing call to action",
  contact_info: "Contact details block",
  form: "Form section",
  what_to_expect: "What to expect",
  confidential: "Reassurance block",
  why_share: "Why share your story",
  ways_to_give: "Ways to give",
  bank_details: "Bank details",
  details: "Details block",
  register: "Registration block",
  albums: "Photo albums block",
  contact: "Contact block",
  community: "Community section",
  events: "Events heading",
  programs: "Weekly Rhythms heading",
  ministries: "Grow. Serve. Belong. heading",
  giving_cta: "Giving call to action",
};

/** The blocks the website reads on a page (used to offer any that are missing). */
export function sectionSpecs(pageSlug: string): SectionSpec[] {
  return SECTION_LIBRARY[pageSlug] ?? [];
}

export function sectionSpec(pageSlug: string, key: string): SectionSpec | undefined {
  return sectionSpecs(pageSlug).find((s) => s.key === key);
}

/** Friendly, non-technical name for a section so administrators know what they are editing. */
export function sectionLabel(pageSlug: string, key: string): string {
  const spec = sectionSpec(pageSlug, key);
  if (spec) return spec.label;
  if (GENERIC_SECTION_LABELS[key]) return GENERIC_SECTION_LABELS[key];
  return key.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function sectionHint(pageSlug: string, key: string): string {
  return sectionSpec(pageSlug, key)?.hint ?? "";
}

/** The layout the website uses for a section — assigned automatically, never chosen by hand. */
export function autoTemplate(pageSlug: string, key: string): string {
  return sectionSpec(pageSlug, key)?.template ?? "custom";
}

/** Older one-card-per-record blocks that were merged into grouped sections. */
export function isRetiredSection(row: { section_template?: string | null }): boolean {
  return row.section_template === "retired";
}



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
  group_key?: string | null;
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
  badge_label?: string | null;
  show_on_homepage?: boolean;
  /** "general" for ordinary events, "couples-retreat" for a Couples Retreat. */
  event_type?: string | null;
  /** True when couples may register their interest in this event. */
  registration_open?: boolean | null;
};

/** The event types an administrator may choose in Admin → Events. */
export const EVENT_TYPES = [
  { value: "general", label: "General event" },
  { value: "couples-retreat", label: "Couples Retreat" },
] as const;

export const COUPLES_RETREAT_TYPE = "couples-retreat";

/** True when an event record is one of the Couples Retreats. */
export function isCouplesRetreatEvent(ev: Partial<ChurchEvent> & { slug?: string | null }): boolean {
  return (ev.event_type ?? "general") === COUPLES_RETREAT_TYPE || ev.slug === COUPLES_RETREAT_TYPE;
}


/** An event is "upcoming" until its end date (or start date) has passed. */
export function eventEndsAt(ev: { start_at: string; end_at?: string | null }): number {
  return new Date(ev.end_at ?? ev.start_at).getTime();
}

export function isUpcomingEvent(ev: { start_at: string; end_at?: string | null }): boolean {
  return eventEndsAt(ev) >= Date.now();
}

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
  image_url: string | null;
  caption: string | null;
  alt_text: string | null;
  sort_order: number;
  is_visible?: boolean;
  media_type?: "image" | "video";
  video_url?: string | null;
  video_thumbnail_url?: string | null;
};

/** One item inside a website album — either a photograph or a video. */
export type AlbumMediaItem = GalleryImage & { media_type: "image" | "video" };


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

/** Published events, soonest first — filtered to upcoming ones by the caller. */
export function usePublishedEvents() {
  return useCmsList<ChurchEvent>(() =>
    supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("start_at", { ascending: true }),
  );
}

/**
 * Active ministries, optionally limited to one group:
 * "church" = internal church ministries, "outreach" = outreach & initiatives.
 */
export function useActiveMinistries(group?: "church" | "outreach") {
  return useCmsList<Ministry>(() => {
    let q = supabase.from("ministries").select("*").eq("is_active", true);
    if (group) q = q.eq("group_key", group);
    return q.order("sort_order").order("name");
  }, [group]);
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
  /** Optional short label shown at the top-left of the card image. */
  badge_label: string | null;
};

/** Suggested card badges — administrators may also type their own wording. */
export const BADGE_SUGGESTIONS = [
  "Couples",
  "Family",
  "Worship",
  "Community",
  "Business",
  "Conference",
  "Celebration",
  "Outreach",
  "Youth",
  "Men",
  "Women",
  "Event",
];

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

/**
 * Remembers the cards already loaded for a section so navigating back to a page
 * never flashes the built-in wording before the saved content arrives.
 */
const itemCache = new Map<string, SectionItem[]>();

/** Visible items for one section of one page, ordered as the administrator arranged them. */
export function useSectionItems(pageSlug: string, sectionKey: string) {
  const cacheKey = `${pageSlug}::${sectionKey}`;
  const [rows, setRows] = useState<SectionItem[]>(() => itemCache.get(cacheKey) ?? []);
  const [loading, setLoading] = useState(!itemCache.has(cacheKey));

  useEffect(() => {
    let active = true;
    const cached = itemCache.get(cacheKey);
    if (cached) {
      setRows(cached);
      setLoading(false);
    }
    (async () => {
      const { data: section } = await supabase
        .from("page_sections")
        .select("id")
        .eq("page_slug", pageSlug)
        .eq("section_key", sectionKey)
        .maybeSingle();
      if (!active) return;
      if (!section) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("page_section_items" as any)
        .select("*")
        .eq("section_id", (section as any).id)
        .eq("is_visible", true)
        .order("sort_order");
      if (!active || !data) {
        if (active) setLoading(false);
        return;
      }
      const list = (data as any[]) as SectionItem[];
      itemCache.set(cacheKey, list);
      setRows(list);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [pageSlug, sectionKey, cacheKey]);

  return { rows, loading };
}

/** Clears the remembered copy of a section's cards after an administrator saves. */
export function invalidateSectionItems(pageSlug?: string, sectionKey?: string) {
  if (pageSlug && sectionKey) itemCache.delete(`${pageSlug}::${sectionKey}`);
  else itemCache.clear();
}

/** Clears the remembered copy of a page's sections after an administrator saves. */
export function invalidatePageSections(pageSlug?: string) {
  if (pageSlug) sectionCache.delete(pageSlug);
  else sectionCache.clear();
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
    // A YouTube address pasted into the link box should still play as a video.
    const externalYouTubeId = youTubeId(ep.external_audio_url);
    if (externalYouTubeId) return { kind: "youtube", videoId: externalYouTubeId, url: ep.external_audio_url };
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
  badge_label: string | null;
  show_in_main_gallery: boolean;
  album_source: "website" | "fliphtml5";
  fliphtml5_url: string | null;
};

/** Hosts we are willing to embed a flip-book publication from. */
const FLIPHTML5_HOSTS = ["online.fliphtml5.com", "fliphtml5.com", "www.fliphtml5.com"];

/**
 * Returns a safe FlipHTML5 publication address, or null when the value is not
 * a plain HTTPS FlipHTML5 link. Only the address is ever stored or embedded —
 * pasted HTML is always rejected.
 */
export function safeFlipHtml5Url(value: string | null | undefined): string | null {
  const raw = (value ?? "").trim();
  if (!raw || /[<>]/.test(raw)) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (!FLIPHTML5_HOSTS.includes(url.hostname.toLowerCase())) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** True when this album's photographs live in FlipHTML5 rather than on the website. */
export function isFlipAlbum(a: Partial<GalleryAlbumRow>): boolean {
  return a.album_source === "fliphtml5" && Boolean(safeFlipHtml5Url(a.fliphtml5_url));
}


/* --------------------------------------------------------------------
 * Album categories
 *
 * gallery_albums.category keeps whatever wording was typed originally
 * ("Couples Retreat", "couples retreat", "gallery" …). Nothing in the
 * database was rewritten. Matching is done on a simplified form of the
 * wording, so albums created before categories existed keep working.
 * ------------------------------------------------------------------ */

export type AlbumCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};

export const COUPLES_CATEGORY_SLUG = "couples-retreat";

/** The simplified form of a category name, used for matching only. */
export function categoryKey(value: string | null | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The category an album belongs to, in simplified form ("" when it has none). */
export function albumCategoryKey(a: Partial<GalleryAlbumRow>): string {
  if (a.event_slug === COUPLES_CATEGORY_SLUG) return COUPLES_CATEGORY_SLUG;
  return categoryKey(a.category);
}

/** Album categories managed in Admin → Albums. */
export function useAlbumCategories(includeHidden = false) {
  return useCmsList<AlbumCategory>(() => {
    let q = supabase.from("album_categories" as any).select("*");
    if (!includeHidden) q = q.eq("is_active", true);
    return q.order("sort_order").order("name");
  }, [includeHidden]);
}

/** Short label shown at the top-left of an album cover — blank means no label. */
export function albumBadge(album: Partial<GalleryAlbumRow>): string | null {
  const value = (album.badge_label ?? "").trim();
  if (value) return value;
  const category = (album.category ?? "").trim();
  if (!category || categoryKey(category) === COUPLES_CATEGORY_SLUG) return null;
  return category;
}

/** True when an album belongs to the Couples Retreat series. */
export function isCouplesAlbum(a: Partial<GalleryAlbumRow>): boolean {
  return albumCategoryKey(a) === COUPLES_CATEGORY_SLUG;
}


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

/**
 * Couples Retreat albums, identified by their linked event or category so
 * albums created either way are found.
 */
export function useCouplesRetreatAlbums() {
  const { rows, loading } = usePublishedAlbums();
  return { rows: rows.filter(isCouplesAlbum), loading };
}

/** Ordinary church albums — Couples Retreat albums stay out unless explicitly included. */
export function useMainGalleryAlbums() {
  const { rows, loading } = usePublishedAlbums();
  return { rows: rows.filter((a) => !isCouplesAlbum(a) || a.show_in_main_gallery), loading };
}

/** Every published album — photograph albums and FlipHTML5 albums together. */
export function useAllAlbums() {
  return usePublishedAlbums();
}

export function useAlbumImages(albumId: string | null) {
  return useCmsList<GalleryImage>(() => {
    if (!albumId) return Promise.resolve({ data: [], error: null }) as any;
    return supabase
      .from("gallery_images")
      .select("*")
      .eq("album_id", albumId)
      .eq("is_visible", true)
      .order("sort_order");
  }, [albumId ?? ""]);
}

/** The playable address of one album item, or null when it is not set up yet. */
export function albumItemSrc(item: GalleryImage): string | null {
  if ((item.media_type ?? "image") === "video") return mediaUrl(item.video_url) ?? null;
  return mediaUrl(item.image_url) ?? null;
}

/** The still picture used for an album item in thumbnails and covers. */
export function albumItemPoster(item: GalleryImage): string | null {
  if ((item.media_type ?? "image") === "video") {
    return mediaUrl(item.video_thumbnail_url) ?? mediaUrl(item.image_url) ?? null;
  }
  return mediaUrl(item.image_url) ?? null;
}


