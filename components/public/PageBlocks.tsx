import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CountUp } from "@/components/public/CountUp";
import { cleanHref, cleanImagePath, videoEmbedUrl, type Block } from "@/lib/page-blocks";

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

/** The body of a built page. Used on the live site and, with preview, inside the editor. */
export function PageBlocks({ blocks, speakers = [], preview = false }: { blocks: Block[]; speakers?: BlockSpeaker[]; preview?: boolean }) {
  return (
    <div className="blocks">
      {blocks.map((block) => (
        <section key={block.id} className={`blk blk-${block.type}`}>
          <BlockView block={block} speakers={speakers} preview={preview} />
        </section>
      ))}
    </div>
  );
}
