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
  { slug: "contact", label: "Contact" },
  { slug: "plan-a-visit", label: "Plan a Visit" },
  { slug: "prayer-request", label: "Prayer Request" },
  { slug: "share-testimony", label: "Share a Testimony" },
  { slug: "give", label: "Giving" },
] as const;

/** Sections the website looks for on each page. Admins can also add their own keys. */
export const DEFAULT_SECTION_KEYS = ["hero", "intro", "cta"];

export function usePageSections(pageSlug: string) {
  const [sections, setSections] = useState<Record<string, PageSection>>({});

  useEffect(() => {
    let active = true;
    supabase
      .from("page_sections")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("is_visible", true)
      .order("sort_order")
      .then(({ data }) => {
        if (!active || !data) return;
        setSections(Object.fromEntries((data as any[]).map((s) => [s.section_key, s as PageSection])));
      });
    return () => {
      active = false;
    };
  }, [pageSlug]);

  return sections;
}

/** Returns the CMS section if one exists and is visible, otherwise null (page keeps its built-in content). */
export function usePageSection(pageSlug: string, sectionKey: string): PageSection | null {
  const sections = usePageSections(pageSlug);
  return sections[sectionKey] ?? null;
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
  updated_at?: string | null;
};

/** Generic read hook with a safe fallback so the public site never renders blank. */
export function useCmsList<T>(
  loader: () => PromiseLike<{ data: any; error: any }>,
  deps: unknown[] = [],
): { rows: T[]; loading: boolean } {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, deps);

  return { rows, loading };
}

export function usePublishedEvents() {
  return useCmsList<ChurchEvent>(() =>
    supabase.from("events").select("*").eq("is_published", true).order("start_at", { ascending: true }),
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
