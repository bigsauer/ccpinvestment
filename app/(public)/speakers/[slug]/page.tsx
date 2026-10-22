import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicNav } from "@/components/public/Nav";
import { localPhoto, tagLabel } from "@/lib/speakers";
import { JsonLd } from "@/components/seo/JsonLd";
import { getMeetingForSpeaker, getSpeakerBySlug, getSpeakers } from "@/lib/queries";
import { safeHttpUrl } from "@/lib/safe-url";
import { SCHOOL_ADDRESS, SITE, absoluteUrl, pageMeta, speakerSlug } from "@/lib/site";
import { linkedinHandle, monthName, dayNumber, weekdayName } from "@/lib/utils";

export const revalidate = 60;

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const speakers = await getSpeakers();
  return speakers.map((s) => ({ slug: speakerSlug(s.firstName, s.lastName) }));
}

function roleOf(s: { title: string; firm: string }) {
  return [s.title, s.firm].filter(Boolean).join(", ");
}

function blurb(s: { firstName: string; lastName: string; title: string; firm: string; bio: string; topic: string; status: string }) {
  const name = `${s.firstName} ${s.lastName}`;
  const role = roleOf(s);
  const lead = role ? `${name} (${role})` : name;
  const detail = s.bio || s.topic;
  const verb = s.status === "UPCOMING" ? "is an upcoming guest speaker" : "spoke to";
  const tail = s.status === "UPCOMING" ? `at the ${SITE.name}.` : `students at the ${SITE.name} in St. Louis.`;
  const text = `${lead} ${verb} ${tail} ${detail}`.replace(/\s+/g, " ").trim();
  return text.length > 158 ? `${text.slice(0, 155).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const speaker = await getSpeakerBySlug(slug);
  if (!speaker) return { title: "Speaker not found", robots: { index: false } };
  const name = `${speaker.firstName} ${speaker.lastName}`;
  const photo = localPhoto(speaker.photoUrl);
  return pageMeta({
    title: `${name}${speaker.title ? `, ${speaker.title}` : ""}`,
    description: blurb(speaker),
    path: `/speakers/${slug}`,
    type: "profile",
    image: photo ? { url: absoluteUrl(photo), alt: name } : undefined,
  });
}

export default async function SpeakerPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const speaker = await getSpeakerBySlug(slug);
  if (!speaker) notFound();

  const meeting = await getMeetingForSpeaker(speaker.id);
  const name = `${speaker.firstName} ${speaker.lastName}`;
  const photo = localPhoto(speaker.photoUrl);
  const linkedin = safeHttpUrl(speaker.linkedinUrl);
  const upcoming = speaker.status === "UPCOMING";
  const role = roleOf(speaker);
  const when = speaker.sessionDate
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Chicago" }).format(new Date(speaker.sessionDate))
    : (speaker.season ?? "Date to be announced");
  const pageUrl = absoluteUrl(`/speakers/${slug}`);

  const listItem = (position: number, itemName: string, item: string) => ({ "@type": "ListItem", position, name: itemName, item });
  const eventStart = meeting?.date ?? (speaker.sessionDate ? new Date(speaker.sessionDate) : null);

  const person: Record<string, unknown> = {
    "@type": "Person",
    "@id": `${pageUrl}#person`,
    name,
    url: pageUrl,
    ...(speaker.title ? { jobTitle: speaker.title } : {}),
    ...(speaker.firm ? { worksFor: { "@type": "Organization", name: speaker.firm } } : {}),
    ...(photo ? { image: absoluteUrl(photo) } : {}),
    ...(speaker.bio ? { description: speaker.bio } : {}),
    ...(speaker.industry ? { knowsAbout: speaker.industry } : {}),
    ...(linkedin ? { sameAs: [linkedin] } : {}),
    ...(eventStart
      ? {
          performerIn: {
            "@type": "Event",
            name: `${name} at the ${SITE.name}`,
            startDate: eventStart.toISOString(),
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            location: { "@type": "Place", name: meeting?.location ?? SITE.school.name, address: SCHOOL_ADDRESS },
            organizer: { "@type": "Organization", name: SITE.name, url: absoluteUrl("/") },
          },
        }
      : {}),
  };

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "ProfilePage", "@id": `${pageUrl}#page`, url: pageUrl, name: `${name} | ${SITE.name}`, mainEntity: { "@id": `${pageUrl}#person` } },
            person,
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                listItem(1, "Home", absoluteUrl("/")),
                listItem(2, "Speakers", absoluteUrl("/speakers")),
                listItem(3, name, pageUrl),
              ],
            },
          ],
        }}
      />
      <PublicNav />
      <main className="section sp-page">
        <div className="wrap">
          <nav className="sp-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/speakers">Speakers</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{name}</span>
          </nav>

          <article className="sp-card">
            <div className="sp-photo">
              {photo ? (
                <Image src={photo} alt={name} fill priority sizes="(max-width: 860px) 100vw, 420px" />
              ) : (
                <div className="spkr-fallback">{`${speaker.firstName[0] ?? ""}${speaker.lastName[0] ?? ""}`}</div>
              )}
              <div className={upcoming ? "tag up" : "tag"}>{tagLabel({
                  id: speaker.id,
                  firstName: speaker.firstName,
                  lastName: speaker.lastName,
                  firm: speaker.firm,
                  title: speaker.title,
                  topic: speaker.topic,
                  season: speaker.season,
                  status: speaker.status,
                  sessionDate: speaker.sessionDate?.toISOString() ?? null,
                  linkedinUrl: speaker.linkedinUrl,
                })}</div>
            </div>

            <div className="spm-body sp-body">
              <div className="spm-eyebrow" style={{ "--d": 0 } as React.CSSProperties}>
                {speaker.season ?? (upcoming ? "Upcoming guest" : "Past guest")}
              </div>
              <h1 className="spm-name" style={{ "--d": 1 } as React.CSSProperties}>
                {name}
              </h1>
              {role ? (
                <p className="spm-role" style={{ "--d": 2 } as React.CSSProperties}>
                  {role}
                </p>
              ) : null}

              <dl className="spm-facts" style={{ "--d": 3 } as React.CSSProperties}>
                <div>
                  <dt>{upcoming ? "Speaking" : "Spoke at the club"}</dt>
                  <dd>{when}</dd>
                </div>
                {speaker.industry ? (
                  <div>
                    <dt>Industry</dt>
                    <dd>{speaker.industry}</dd>
                  </div>
                ) : null}
                {upcoming && meeting ? (
                  <div>
                    <dt>When &amp; where</dt>
                    <dd>
                      {weekdayName(meeting.date)}, {monthName(meeting.date)} {dayNumber(meeting.date)} · {meeting.time} · {meeting.location}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {speaker.topic ? (
                <div className="spm-block" style={{ "--d": 4 } as React.CSSProperties}>
                  <h2 className="spm-label">Topic</h2>
                  <p>{speaker.topic}</p>
                </div>
              ) : null}

              {speaker.bio ? (
                <div className="spm-block" style={{ "--d": 5 } as React.CSSProperties}>
                  <h2 className="spm-label">About</h2>
                  <p>{speaker.bio}</p>
                </div>
              ) : null}

              <div className="sp-actions" style={{ "--d": 6 } as React.CSSProperties}>
                {linkedin ? (
                  <a className="spm-li" href={linkedin} target="_blank" rel="noopener noreferrer">
                    <span className="li-ico">in</span>
                    <span className="handle">{linkedinHandle(linkedin)}</span>
                    <span className="arrow">↗</span>
                  </a>
                ) : null}
                {upcoming ? (
                  <Link href="/get-involved?tab=students" className="btn red">
                    RSVP as a guest <span className="arrow">→</span>
                  </Link>
                ) : null}
                <Link href="/speakers" className="btn">
                  ← All speakers
                </Link>
              </div>
            </div>
          </article>
        </div>
      </main>
    </>
  );
}
