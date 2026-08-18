import { SETTINGS_FALLBACK, type SiteSettings } from "@/lib/cms";

export const SITE_ORIGIN = "https://praisepalace.org.uk";

/**
 * Single, consistent JSON-LD identity for the church.
 * Everything comes from Site Settings (Admin), so nothing is hardcoded apart
 * from the fixed street address of the worship venue. Blank fields are omitted.
 */
export function buildChurchSchema(settings: SiteSettings = SETTINGS_FALLBACK) {
  const sameAs = [settings.facebook_url, settings.instagram_url, settings.youtube_url]
    .filter((u): u is string => typeof u === "string" && u.trim().length > 0);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Church",
    "@id": `${SITE_ORIGIN}/#church`,
    name: settings.church_name || "RCCG Praise Palace Northampton",
    url: `${SITE_ORIGIN}/`,
    logo: `${SITE_ORIGIN}/site-images/logo.png`,
    image: `${SITE_ORIGIN}/site-images/logo.png`,
    address: {
      "@type": "PostalAddress",
      name: "Briar Hill Community Centre",
      streetAddress: "Briar Hill Community Centre, The Springs Walk",
      addressLocality: "Northampton",
      postalCode: "NN4 8SX",
      addressCountry: "GB",
    },
    parentOrganization: {
      "@type": "Organization",
      name: "The Redeemed Christian Church of God",
    },
  };

  if (settings.short_description?.trim()) schema.description = settings.short_description.trim();
  if (settings.email?.trim()) schema.email = settings.email.trim();
  // Telephone is optional in Site Settings: omit entirely when blank.
  if (settings.phone?.trim()) schema.telephone = settings.phone.trim();
  if (settings.map_url?.trim()) schema.hasMap = settings.map_url.trim();
  if (settings.service_times?.trim()) schema.slogan = undefined;
  if (sameAs.length) schema.sameAs = sameAs;

  delete schema.slogan;
  return schema;
}
