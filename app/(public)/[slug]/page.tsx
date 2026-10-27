import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PublicNav } from "@/components/public/Nav";
import { PageBlocks, type BlockSpeaker } from "@/components/public/PageBlocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCustomPage, getSpeakers } from "@/lib/queries";
import { SITE, absoluteUrl, pageMeta, speakerSlug } from "@/lib/site";
import { cleanImagePath } from "@/lib/page-blocks";
import { localPhoto } from "@/lib/speakers";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCustomPage(slug);
  if (!page) return { title: "Page not found", robots: { index: false } };
  const banner = cleanImagePath(page.bannerUrl ?? "");
  return pageMeta({
    title: page.title,
    description: page.description || SITE.description,
    path: `/${page.slug}`,
    ...(banner ? { image: { url: banner, alt: page.title, width: 1600, height: 900 } } : {}),
  });
}

export default async function BuiltPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getCustomPage(slug);
  if (!page) notFound();

  // Only load the speakers list when a Speakers block needs it.
  let speakers: BlockSpeaker[] = [];
  if (page.blocks.some((block) => block.type === "speakers")) {
    speakers = (await getSpeakers()).map((s) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      role: [s.title, s.firm].filter(Boolean).join(", "),
      photoUrl: localPhoto(s.photoUrl),
      slug: speakerSlug(s.firstName, s.lastName),
      status: s.status,
      season: s.season,
    }));
  }

  const banner = cleanImagePath(page.bannerUrl ?? "");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          description: page.description || SITE.description,
          url: absoluteUrl(`/${page.slug}`),
          isPartOf: { "@type": "WebSite", name: SITE.name, url: absoluteUrl("/") },
          dateModified: page.updatedAt.toISOString(),
        }}
      />
      <PublicNav />
      <main>
        {banner ? (
          <header className="page-banner" style={{ minHeight: 420 }}>
            <Image className="pb-img" src={banner} alt="" fill priority sizes="100vw" style={{ objectPosition: `${page.bannerX}% ${page.bannerY}%` }} />
            <div className="pb-overlay" />
            <div className="wrap pb-content">
              <div className="crumbs">{SITE.name}</div>
              <h1>{page.title}</h1>
              {page.description ? <p className="lede">{page.description}</p> : null}
            </div>
          </header>
        ) : (
          <header className="blk-pagehead">
            <div className="wrap">
              <div className="section-label">{SITE.name}</div>
              <h1>{page.title}</h1>
              {page.description ? <p className="lede">{page.description}</p> : null}
            </div>
          </header>
        )}
        <div style={{ paddingTop: banner ? 56 : 8 }}>
          <PageBlocks blocks={page.blocks} speakers={speakers} />
        </div>
      </main>
    </>
  );
}
