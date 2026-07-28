import type { ReactNode } from "react";
import { PageHero } from "@/components/section-ui";
import { usePageSection } from "@/lib/cms";

/**
 * Page hero that prefers admin-managed content for the given page slug
 * and falls back to the built-in copy when nothing is published.
 */
export function CmsPageHero({
  page,
  eyebrow,
  title,
  subtitle,
  image,
}: {
  page: string;
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  image?: string;
}) {
  const hero = usePageSection(page, "hero");
  return (
    <PageHero
      eyebrow={hero?.subheading ?? eyebrow}
      title={hero?.headline ?? title}
      subtitle={hero?.body ?? subtitle}
      image={hero?.image_url ?? image}
    />
  );
}
