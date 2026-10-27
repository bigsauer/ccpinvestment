import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SYSTEM_SLUGS } from "@/lib/default-pages";
import { absoluteUrl, speakerSlug } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [speakers, nextMeeting, builtPages] = await Promise.all([
    prisma.speaker.findMany({ select: { firstName: true, lastName: true, updatedAt: true } }),
    prisma.meeting.findFirst({
      where: { published: true },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
    prisma.customPage.findMany({ where: { status: "LIVE", slug: { notIn: SYSTEM_SLUGS } }, select: { slug: true, updatedAt: true } }),
  ]);

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/meetings"), lastModified: nextMeeting?.updatedAt ?? now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/speakers"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/get-involved"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/team"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const profiles: MetadataRoute.Sitemap = speakers.map((s) => ({
    url: absoluteUrl(`/speakers/${speakerSlug(s.firstName, s.lastName)}`),
    lastModified: s.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const custom: MetadataRoute.Sitemap = builtPages.map((p) => ({
    url: absoluteUrl(`/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...pages, ...profiles, ...custom];
}
