import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { prisma } from "@/lib/db";
import { displayName } from "@/lib/utils";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const term = q.trim();
  const ci = (field: string) => ({ [field]: { contains: term, mode: "insensitive" as const } });

  const [speakers, members, meetings, officers, applications] = term
    ? await Promise.all([
        prisma.speaker.findMany({ where: { OR: [ci("firstName"), ci("lastName"), ci("firm"), ci("title"), ci("topic")] }, take: 20 }),
        prisma.member.findMany({ where: { OR: [ci("firstName"), ci("lastName"), ci("email")] }, take: 20 }),
        prisma.meeting.findMany({ where: { OR: [ci("topic"), ci("location"), ci("format")] }, include: { speaker: true }, take: 20, orderBy: { date: "desc" } }),
        prisma.officer.findMany({ where: { OR: [ci("name"), ci("email")] }, take: 20 }),
        prisma.application.findMany({ orderBy: { submittedAt: "desc" }, take: 500 }),
      ])
    : [[], [], [], [], []];

  const needle = term.toLowerCase();
  const matchedApps = applications
    .filter((app) => JSON.stringify(app.payload ?? {}).toLowerCase().includes(needle))
    .slice(0, 20);
  const total = speakers.length + members.length + meetings.length + officers.length + matchedApps.length;

  return (
    <>
      <Topbar crumbs={["Admin", "Search"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              {term ? (
                <>
                  Results for <span className="serif">“{term}”</span>
                </>
              ) : (
                <>
                  Search <span className="serif">everything.</span>
                </>
              )}
            </h1>
            <p className="sub">{term ? `${total} match${total === 1 ? "" : "es"}` : "Type in the search box at the top: speakers, members, inquiries, meetings and officers."}</p>
          </div>
        </div>

        {speakers.length > 0 ? (
          <Section title="Speakers">
            {speakers.map((s) => (
              <Hit key={s.id} href={`/admin/speakers/${s.id}`} title={displayName(s.firstName, s.lastName)} sub={[s.title, s.firm].filter(Boolean).join(", ")} />
            ))}
          </Section>
        ) : null}
        {members.length > 0 ? (
          <Section title="Members">
            {members.map((m) => (
              <Hit key={m.id} href={`/admin/members/${m.id}`} title={`${m.firstName} ${m.lastName}`} sub={`${m.email} · Class of ${m.gradYear}`} />
            ))}
          </Section>
        ) : null}
        {matchedApps.length > 0 ? (
          <Section title="Inquiries">
            {matchedApps.map((a) => {
              const p = (a.payload ?? {}) as Record<string, string>;
              return <Hit key={a.id} href={`/admin/applications?id=${a.id}`} title={`${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "Inquiry"} sub={`${a.type === "SPEAKER" ? "Speaker" : "Student"} · ${a.status}`} />;
            })}
          </Section>
        ) : null}
        {meetings.length > 0 ? (
          <Section title="Meetings">
            {meetings.map((m) => (
              <Hit
                key={m.id}
                href={`/admin/meetings/${m.id}`}
                title={m.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" })}
                sub={m.speaker ? displayName(m.speaker.firstName, m.speaker.lastName) : m.topic || m.format}
              />
            ))}
          </Section>
        ) : null}
        {officers.length > 0 ? (
          <Section title="Officers">
            {officers.map((o) => (
              <Hit key={o.id} href={`/admin/officers/${o.id}`} title={o.name} sub={o.email} />
            ))}
          </Section>
        ) : null}
        {term && total === 0 ? <div className="card" style={{ padding: 24 }}>Nothing matches “{term}”.</div> : null}
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div className="card-head">
        <h3>{title}</h3>
      </div>
      <div className="card-body" style={{ padding: "6px 20px 12px" }}>
        {children}
      </div>
    </div>
  );
}

function Hit({ href, title, sub }: { href: string; title: string; sub: string }) {
  return (
    <Link href={href} className="admin-hit" style={{ display: "block", padding: "10px 0", borderBottom: "1px solid var(--line)", textDecoration: "none", color: "inherit" }}>
      <div className="strong">{title}</div>
      <div className="row-sub">{sub}</div>
    </Link>
  );
}
