import type { Metadata } from "next";

/**
 * Single source of truth for SEO: canonical origin, names, and school details.
 * Every host that serves this app (vercel.app, the school server, www/apex) points its
 * canonical tags at SITE.url so search engines index one address.
 */
export const SITE = {
  name: "Chaminade Investment Club",
  shortName: "CIC",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ccpinvestmentclub.com").replace(/\/+$/, ""),
  tagline: "Student finance club · St. Louis",
  description:
    "Student-run finance club at Chaminade College Preparatory School in St. Louis. Hear from working professionals, pitch stocks, and learn how investing really works.",
  foundedYear: "2024",
  locale: "en_US",
  school: {
    name: "Chaminade College Preparatory School",
    url: "https://www.chaminade-stl.org",
    street: "425 S Lindbergh Blvd",
    city: "St. Louis",
    region: "MO",
    country: "US",
  },
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE.url}/`).toString();
}

/** "Kevin Travers" -> "kevin-travers" */
export function speakerSlug(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Consistent per-page metadata: title, description, canonical, Open Graph, Twitter. */
export function pageMeta({
  title,
  description,
  path,
  image,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  image?: { url: string; alt: string; width?: number; height?: number };
  type?: "website" | "profile" | "article";
}): Metadata {
  const fullTitle = `${title} | ${SITE.name}`;
  const shareImage = image ?? {
    url: "/brand/share.jpg",
    width: 1200,
    height: 630,
    alt: `${SITE.name}: student-run finance club at ${SITE.school.name}`,
  };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: SITE.name,
      locale: SITE.locale,
      url: path,
      title: fullTitle,
      description,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [shareImage.url],
    },
  };
}

export const SCHOOL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: SITE.school.street,
  addressLocality: SITE.school.city,
  addressRegion: SITE.school.region,
  addressCountry: SITE.school.country,
} as const;
