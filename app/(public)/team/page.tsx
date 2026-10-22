import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicNav } from "@/components/public/Nav";
import { PageBannerCopy } from "@/components/public/PageBannerCopy";
import { getLivePageBlocks, getPublicOfficers } from "@/lib/queries";
import { pageMeta } from "@/lib/site";
import { initials, roleLabel } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "Student Officers & Faculty Advisor",
  description:
    "Meet the student officers who run the Chaminade Investment Club, and the faculty advisor who supports them, at Chaminade College Preparatory School in St. Louis.",
  path: "/team",
});
export const revalidate = 60;

export default async function TeamPage() {
  const [officers, blocks] = await Promise.all([getPublicOfficers(), getLivePageBlocks("team")]);
  const leadership = officers.filter((officer) => officer.role !== "ADVISOR");
  const advisor = officers.find((officer) => officer.role === "ADVISOR");

  return (
    <>
      <PublicNav />
      <main>
      <header className="page-banner">
        <Image className="pb-img" src="/photos/session-06.jpg" alt="Chaminade Investment Club meeting" fill priority sizes="100vw" />
        <div className="pb-overlay" />
        <div className="wrap pb-content">
          <PageBannerCopy
            blocks={blocks}
            crumbs="Team · Officers & Advisor"
            lede="Officers handle everything: speaker outreach, programming, the paper portfolio, and operations. No faculty ghost-writer, no pre-made script."
          >
            Student-run, <span className="serif">end to end.</span>
          </PageBannerCopy>
        </div>
        <div className="pb-caption">Networking · Post-session</div>
      </header>
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">Officers · Spring 2026</div>
              <h2>The leadership team.</h2>
            </div>
            <p>Elected each year. Officer names populate here from the admin roster.</p>
          </div>
          <div className="officers">
            {leadership.map((officer) => (
              <div key={officer.id} className="officer">
                <div className="av">{initials(officer.name)}</div>
                <div className="name">
                  {officer.name}
                  {officer.classYear ? `, '${officer.classYear}` : ""}
                </div>
                <div className="role">{roleLabel(officer.role)}</div>
                <div className="bio">{officer.bio ?? ""}</div>
              </div>
            ))}
          </div>
          {advisor ? (
            <div className="advisor">
              <div className="av">{initials(advisor.name)}</div>
              <div>
                <div className="kn">Faculty advisor</div>
                <div className="nm">{advisor.name}</div>
                <div className="rl">{advisor.bio ?? "Faculty, Chaminade College Preparatory School"}</div>
              </div>
              <Link href="/get-involved?tab=students" className="btn">
                Contact advisor
              </Link>
            </div>
          ) : null}
          <div className="values">
            <div className="value">
              <div className="k">01 / CULTURE</div>
              <h3>Preparation matters.</h3>
              <p>Members show up having read the brief, with questions. Guests notice.</p>
            </div>
            <div className="value">
              <div className="k">02 / OWNERSHIP</div>
              <h3>Officers do the work.</h3>
              <p>Every event, contact, and meeting agenda is owned by a student. No hand-holding.</p>
            </div>
            <div className="value">
              <div className="k">03 / STANDARD</div>
              <h3>Professional bar.</h3>
              <p>What&apos;s good enough for finance professionals is what&apos;s good enough for us.</p>
            </div>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
