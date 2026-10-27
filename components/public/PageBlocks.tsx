import Image from "next/image";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { CountUp } from "@/components/public/CountUp";
import { RichHeadline } from "@/components/public/RichHeadline";
import { DYNAMIC_SECTION_TYPES, SITE_SECTION_TYPES, blockDef, cleanHref, cleanImagePath, videoEmbedUrl, type Block } from "@/lib/page-blocks";
import { previewCtx, type PageCtx } from "@/lib/page-context";
import type { SiteImageSlot } from "@/lib/site-images";

/** A speaker as the Speakers block shows them. Passed in by the page, so this file never touches the database. */
export type BlockSpeaker = { id: string; name: string; role: string; photoUrl: string | null; slug: string; status: string; season: string | null };

const str = (block: Block, key: string) => (typeof block[key] === "string" ? (block[key] as string) : "");
const list = (block: Block, key: string) =>
  (Array.isArray(block[key]) ? (block[key] as Record<string, unknown>[]) : []).map((item) => Object.fromEntries(Object.entries(item).map(([k, v]) => [k, typeof v === "string" ? v : String(v ?? "")])));

function SmartLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const safe = cleanHref(href);
  if (!safe) return <span className={className}>{children}</span>;
  if (safe.startsWith("/") || safe.startsWith("#")) {
    return (
      <Link href={safe} className={className}>
        {children}
      </Link>
    );
  }
  const external = /^https?:/i.test(safe);
  return (
    <a href={safe} className={className} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

/* Inline formatting: **bold**, *italic*, [text](link). Everything else is plain text, so nothing can inject HTML. */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let n = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const key = `${keyBase}-${n++}`;
    if (match[1] !== undefined) out.push(<strong key={key}>{match[1]}</strong>);
    else if (match[2] !== undefined) out.push(<em key={key}>{match[2]}</em>);
    else out.push(<SmartLink key={key} href={match[4]!}>{match[3]}</SmartLink>);
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function RichText({ body }: { body: string }) {
  const groups = body.split(/\n{2,}/).map((g) => g.trim()).filter(Boolean);
  return (
    <>
      {groups.map((group, gi) => {
        const lines = group.split("\n");
        if (lines.every((l) => /^\s*[-•]\s+/.test(l))) {
          return (
            <ul key={gi}>
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*[-•]\s+/, ""), `${gi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={gi}>
            {lines.map((l, li) => (
              <span key={li}>
                {li > 0 ? <br /> : null}
                {inline(l, `${gi}-${li}`)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

function Picture({ src, alt, className, sizes }: { src: string; alt: string; className?: string; sizes: string }) {
  const safe = cleanImagePath(src);
  if (!safe) return <div className={`blk-ph ${className ?? ""}`}>No photo yet</div>;
  return <Image className={className} src={safe} alt={alt} width={1600} height={1000} sizes={sizes} style={{ width: "100%", height: "auto" }} />;
}

function Button({ label, href, kind = "red" }: { label: string; href: string; kind?: string }) {
  if (!label || !cleanHref(href)) return null;
  return (
    <SmartLink href={href} className={kind === "outline" ? "btn lg" : "btn red lg"}>
      {label} <span className="arrow">→</span>
    </SmartLink>
  );
}

function SiteSection({ block, ctx }: { block: Block; ctx: PageCtx }) {
  const { settings, images } = ctx;
  switch (block.type) {
    case "pageBanner": {
      const custom = cleanImagePath(str(block, "image"));
      const slot = str(block, "imageSlot") as SiteImageSlot;
      const photo = custom ? { src: custom, alt: "", style: { objectPosition: "50% 30%" } } : slot && images[slot] ? images[slot] : null;
      const crumbs = str(block, "crumbs").replace(/\{season\}/g, settings.seasonLabel);
      return (
        <header className={photo ? "page-banner" : "page-banner gi-banner"}>
          {photo ? (
            <>
              <Image className="pb-img" src={photo.src} alt={photo.alt} style={photo.style} fill priority sizes="100vw" />
              <div className="pb-overlay" />
            </>
          ) : null}
          <div className="wrap pb-content">
            {crumbs ? <div className="crumbs">{crumbs}</div> : null}
            <h1>
              <RichHeadline text={str(block, "headline")} />
            </h1>
            {str(block, "lede") ? <p className="lede">{str(block, "lede")}</p> : null}
          </div>
          {photo && str(block, "caption") ? <div className="pb-caption">{str(block, "caption")}</div> : null}
        </header>
      );
    }
    case "homeHero": {
      const photo = images["home-hero"];
      return (
        <header className="hero-photo">
          <div className="hero-photo-inner">
            <Image className="hero-bg" src={photo.src} alt={photo.alt} style={photo.style} fill priority sizes="100vw" />
            <div className="hero-overlay" />
            <div className="hero-content wrap">
              <div className="eyebrow light">
                <span className="dot" />
                <span>{settings.seasonLabel.toUpperCase()}</span>
                <span className="div" />
                <span>{ctx.nextLabel}</span>
              </div>
              <h1 className="display light">
                <RichHeadline text={str(block, "headline")} />
              </h1>
              <p className="lede light">{str(block, "lede")}</p>
              <div className="hero-ctas">
                {str(block, "primaryLabel") && cleanHref(str(block, "primaryHref")) ? (
                  <SmartLink href={str(block, "primaryHref")} className="btn red lg">
                    {str(block, "primaryLabel")} <span className="arrow">→</span>
                  </SmartLink>
                ) : null}
                {str(block, "secondaryLabel") && cleanHref(str(block, "secondaryHref")) ? (
                  <SmartLink href={str(block, "secondaryHref")} className="btn ghost lg">
                    {str(block, "secondaryLabel")}
                  </SmartLink>
                ) : null}
              </div>
            </div>
            {settings.heroCaption ? (
              <div className="hero-caption">
                <span className="mono">{settings.heroCaption}</span>
              </div>
            ) : null}
          </div>
        </header>
      );
    }
    case "logoBand":
      return (
        <section className="logo-band">
          <div className="wrap logo-band-inner">
            <div className="logo-band-item">
              <Image src="/brand/club-mark.png" alt="Chaminade Investment Club" width={44} height={44} />
              <div>
                <div className="t">Chaminade Investment Club</div>
                <div className="s">Est. {settings.foundedYear} · Student-led</div>
              </div>
            </div>
            <div className="logo-band-sep" />
            <div className="logo-band-item">
              <Image className="seal" src="/brand/school-seal.png" alt="Chaminade College Preparatory School" width={44} height={44} />
              <div>
                <div className="t">Chaminade College Preparatory</div>
                <div className="s">St. Louis, Missouri · Since 1910</div>
              </div>
            </div>
          </div>
        </section>
      );
    case "homeStats":
      return (
        <section className="stats">
          <div className="wrap stats-inner">
            <div className="stat">
              <div className="k">Members</div>
              <div className="v mono">
                <CountUp value={settings.statMembers} />
              </div>
              <div className="d">Across all grades</div>
            </div>
            <div className="stat">
              <div className="k">Guest speakers</div>
              <div className="v mono">
                <CountUp value={settings.statSpeakers} delay={140} />
              </div>
              <div className="d">Since founding</div>
            </div>
            <div className="stat">
              <div className="k">Sessions held</div>
              <div className="v mono">
                <CountUp value={settings.statSessions} delay={280} />
              </div>
              <div className="d">2024 → present</div>
            </div>
            <div className="stat">
              <div className="k">Estab.</div>
              <div className="v">
                <CountUp value={settings.foundedYear} from={2000} delay={420} />
              </div>
              <div className="d">Fully student-run</div>
            </div>
          </div>
        </section>
      );
    case "featureGrid":
      return (
        <section className="section">
          <div className="wrap">
            <div className="section-head">
              <div>
                {str(block, "label") ? <div className="section-label">{str(block, "label")}</div> : null}
                <h2>
                  <RichHeadline text={str(block, "heading")} />
                </h2>
              </div>
              <p>{str(block, "intro")}</p>
            </div>
            <div className="features">
              {list(block, "items").map((item, i) => (
                <div key={i} className="feature">
                  <div className="num">{item.num}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case "pitch": {
      const photo = images["home-inside"];
      return (
        <section className="section">
          <div className="wrap pitch">
            <div className="ph">
              <Image src={photo.src} alt={photo.alt} style={photo.style} fill sizes="(max-width: 900px) 100vw, 50vw" />
            </div>
            <div>
              {str(block, "label") ? <div className="section-label">{str(block, "label")}</div> : null}
              <h2>
                <RichHeadline text={str(block, "heading")} />
              </h2>
              {str(block, "body1") ? <p>{str(block, "body1")}</p> : null}
              {str(block, "body2") ? <p>{str(block, "body2")}</p> : null}
              {str(block, "buttonLabel") && cleanHref(str(block, "buttonHref")) ? (
                <div style={{ marginTop: 24 }}>
                  <SmartLink href={str(block, "buttonHref")} className="btn">
                    {str(block, "buttonLabel")} <span className="arrow">→</span>
                  </SmartLink>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      );
    }
    case "ctaBand":
      return (
        <section className="cta-band">
          <div className="wrap">
            <h2>{str(block, "heading")}</h2>
            <div style={{ display: "flex", gap: 10 }}>
              {str(block, "primaryLabel") && cleanHref(str(block, "primaryHref")) ? (
                <SmartLink href={str(block, "primaryHref")} className="btn red lg">
                  {str(block, "primaryLabel")} <span className="arrow">→</span>
                </SmartLink>
              ) : null}
              {str(block, "secondaryLabel") && cleanHref(str(block, "secondaryHref")) ? (
                <SmartLink href={str(block, "secondaryHref")} className="btn lg">
                  {str(block, "secondaryLabel")}
                </SmartLink>
              ) : null}
            </div>
          </div>
        </section>
      );
    default:
      return null;
  }
}

function BlockView({ block, speakers, preview }: { block: Block; speakers: BlockSpeaker[]; preview: boolean }) {
  switch (block.type) {
    case "hero": {
      const image = cleanImagePath(str(block, "image"));
      return (
        <div className="blk-hero">
          {image ? <Image className="blk-hero-img" src={image} alt="" fill sizes="100vw" /> : null}
          <div className="blk-hero-overlay" />
          <div className="wrap blk-hero-in">
            {str(block, "eyebrow") ? <div className="blk-eyebrow">{str(block, "eyebrow")}</div> : null}
            <h2>{str(block, "title")}</h2>
            {str(block, "text") ? <p>{str(block, "text")}</p> : null}
            <Button label={str(block, "buttonLabel")} href={str(block, "buttonHref")} />
          </div>
        </div>
      );
    }
    case "heading": {
      const Tag = str(block, "level") === "3" ? "h3" : "h2";
      return (
        <div className={`wrap blk-narrow blk-align-${str(block, "align") || "left"}`}>
          <Tag className="blk-heading">{str(block, "text")}</Tag>
        </div>
      );
    }
    case "text":
      return (
        <div className={`wrap blk-narrow blk-text blk-align-${str(block, "align") || "left"}`}>
          <RichText body={str(block, "body")} />
        </div>
      );
    case "image": {
      const size = str(block, "size") || "wide";
      return (
        <figure className={`wrap blk-figure blk-${size}`}>
          <Picture src={str(block, "src")} alt={str(block, "alt")} className="blk-img" sizes={size === "narrow" ? "(max-width: 800px) 100vw, 640px" : "(max-width: 1280px) 100vw, 1180px"} />
          {str(block, "caption") ? <figcaption>{str(block, "caption")}</figcaption> : null}
        </figure>
      );
    }
    case "imageText":
      return (
        <div className={`wrap blk-split ${str(block, "side") === "right" ? "is-right" : ""}`}>
          <div className="blk-split-img">
            <Picture src={str(block, "image")} alt={str(block, "alt")} className="blk-img" sizes="(max-width: 900px) 100vw, 560px" />
          </div>
          <div className="blk-split-copy">
            {str(block, "heading") ? <h2 className="blk-heading">{str(block, "heading")}</h2> : null}
            <div className="blk-text">
              <RichText body={str(block, "body")} />
            </div>
            <Button label={str(block, "buttonLabel")} href={str(block, "buttonHref")} />
          </div>
        </div>
      );
    case "button":
      return (
        <div className={`wrap blk-narrow blk-align-${str(block, "align") || "left"}`}>
          <Button label={str(block, "label")} href={str(block, "href")} kind={str(block, "style")} />
        </div>
      );
    case "callout":
      return (
        <div className="wrap">
          <div className="blk-callout">
            <div>
              <h2>{str(block, "heading")}</h2>
              {str(block, "body") ? <p>{str(block, "body")}</p> : null}
            </div>
            {str(block, "buttonLabel") && cleanHref(str(block, "buttonHref")) ? (
              <SmartLink href={str(block, "buttonHref")} className="btn lg blk-callout-btn">
                {str(block, "buttonLabel")} <span className="arrow">→</span>
              </SmartLink>
            ) : null}
          </div>
        </div>
      );
    case "cards": {
      const cols = ["2", "3", "4"].includes(str(block, "columns")) ? str(block, "columns") : "3";
      return (
        <div className="wrap">
          {str(block, "heading") ? <h2 className="blk-heading blk-cards-h">{str(block, "heading")}</h2> : null}
          <div className={`blk-cards cols-${cols}`}>
            {list(block, "items").map((item, i) => {
              const body = (
                <>
                  {cleanImagePath(item.image ?? "") ? (
                    <div className="blk-card-img">
                      <Picture src={item.image ?? ""} alt="" sizes="(max-width: 700px) 100vw, 400px" />
                    </div>
                  ) : null}
                  <div className="blk-card-body">
                    <h3>{item.title}</h3>
                    {item.text ? <p>{item.text}</p> : null}
                  </div>
                </>
              );
              return cleanHref(item.href ?? "") ? (
                <SmartLink key={i} href={item.href ?? ""} className="blk-card is-link">
                  {body}
                </SmartLink>
              ) : (
                <div key={i} className="blk-card">
                  {body}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    case "faq":
      return (
        <div className="wrap blk-narrow">
          {str(block, "heading") ? <h2 className="blk-heading">{str(block, "heading")}</h2> : null}
          <div className="blk-faq">
            {list(block, "items").map((item, i) => (
              <details key={i}>
                <summary>{item.q}</summary>
                <div className="blk-text">
                  <RichText body={item.a ?? ""} />
                </div>
              </details>
            ))}
          </div>
        </div>
      );
    case "stats":
      return (
        <div className="wrap">
          <div className="blk-stats">
            {list(block, "items").map((item, i) => (
              <div key={i} className="blk-stat">
                <div className="v">
                  <CountUp value={item.value ?? ""} delay={i * 120} />
                </div>
                <div className="k">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    case "quote":
      return (
        <div className="wrap blk-narrow">
          <blockquote className="blk-quote">
            <p>{str(block, "text")}</p>
            {str(block, "by") ? <cite>— {str(block, "by")}</cite> : null}
          </blockquote>
        </div>
      );
    case "video": {
      const embed = videoEmbedUrl(str(block, "url"));
      return (
        <figure className="wrap blk-figure blk-wide">
          {embed ? (
            <div className="blk-video">
              <iframe src={embed} title={str(block, "caption") || "Video"} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            </div>
          ) : (
            <div className="blk-ph">Paste a YouTube or Vimeo link</div>
          )}
          {str(block, "caption") ? <figcaption>{str(block, "caption")}</figcaption> : null}
        </figure>
      );
    }
    case "speakers": {
      const which = str(block, "which") || "all";
      const limit = Number(block.limit) || 6;
      const shown = speakers.filter((s) => which === "all" || s.status.toLowerCase() === which).slice(0, limit);
      return (
        <div className="wrap">
          {str(block, "heading") ? <h2 className="blk-heading blk-cards-h">{str(block, "heading")}</h2> : null}
          {shown.length === 0 ? (
            <div className="blk-ph">{preview ? "Speakers from your Speakers list appear here on the live page." : "Speakers will be announced soon."}</div>
          ) : (
            <div className="blk-cards cols-3">
              {shown.map((s) => (
                <Link key={s.id} href={`/speakers/${s.slug}`} className="blk-card is-link">
                  {cleanImagePath(s.photoUrl ?? "") ? (
                    <div className="blk-card-img tall">
                      <Image src={cleanImagePath(s.photoUrl ?? "")} alt={s.name} fill sizes="(max-width: 700px) 100vw, 360px" />
                    </div>
                  ) : null}
                  <div className="blk-card-body">
                    <div className="blk-eyebrow dark">{s.status === "UPCOMING" ? "Upcoming" : s.season ?? "Past speaker"}</div>
                    <h3>{s.name}</h3>
                    <p>{s.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    case "divider":
      return (
        <div className="wrap blk-narrow">
          <hr className="blk-divider" />
        </div>
      );
    case "spacer":
      return <div className={`blk-spacer s-${str(block, "size") || "medium"}`} aria-hidden="true" />;
    default:
      return null;
  }
}

/**
 * The body of a page: the club's own pages and pages officers build. Used on the live site and, with preview, inside the editor.
 * `renderDynamic` supplies the sections that read live data (meetings, speakers, people); the editor preview shows a placeholder.
 */
export function PageBlocks({
  blocks,
  speakers = [],
  preview = false,
  ctx,
  renderDynamic,
  site = false,
}: {
  blocks: Block[];
  speakers?: BlockSpeaker[];
  preview?: boolean;
  ctx?: PageCtx;
  renderDynamic?: (block: Block) => ReactNode;
  /** The club's own pages: no extra spacing, since their sections bring their own. */
  site?: boolean;
}) {
  const context = ctx ?? previewCtx();
  return (
    <div className={site ? "blocks sys" : "blocks"}>
      {blocks.map((block) => {
        if (SITE_SECTION_TYPES.has(block.type)) {
          if (DYNAMIC_SECTION_TYPES.has(block.type)) {
            return (
              <Fragment key={block.id}>
                {renderDynamic ? (
                  renderDynamic(block)
                ) : (
                  <div className="wrap" style={{ padding: "28px 0" }}>
                    <div className="blk-ph">{blockDef(block.type)?.label}: the live content appears here on the real page.</div>
                  </div>
                )}
              </Fragment>
            );
          }
          return (
            <Fragment key={block.id}>
              <SiteSection block={block} ctx={context} />
            </Fragment>
          );
        }
        return (
          <section key={block.id} className={`blk blk-${block.type}`}>
            <BlockView block={block} speakers={speakers} preview={preview} />
          </section>
        );
      })}
    </div>
  );
}
