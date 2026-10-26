import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicNav } from "@/components/public/Nav";
import { PageBannerCopy } from "@/components/public/PageBannerCopy";
import { getLivePageBlocks, getPublicMembers, getPublicOfficers, getSiteImages } from "@/lib/queries";
import { localPhoto } from "@/lib/speakers";
import { pageMeta } from "@/lib/site";
import { initials, roleLabel } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "The Team: Student Members & Faculty Advisor",
  description:
    "Meet the students who run the Chaminade Investment Club together, and the faculty advisor who supports them, at Chaminade College Preparatory School in St. Louis.",
  path: "/team",
});
export const revalidate = 60;

export default async function TeamPage() {
  const [officers, blocks, members, images] = await Promise.all([
    getPublicOfficers(),
    getLivePageBlocks("team"),
    getPublicMembers(),
    getSiteImages(),
  ]);
  const leadership = officers.filter((officer) => officer.role !== "ADVISOR");
  const advisor = officers.find((officer) => officer.role === "ADVISOR");

  return (
    <>
      <PublicNav />
      <main>
      <header className="page-banner">
        <Image className="pb-img" src={images["team-banner"].src} alt={images["team-banner"].alt} style={images["team-banner"].style} fill priority sizes="100vw" />
        <div className="pb-overlay" />
        <div className="wrap pb-content">
          <PageBannerCopy
            blocks={blocks}
            crumbs="Team · Members & Advisor"
            lede="Members run the club together: speaker outreach, programming, the paper portfolio, and everything in between. No faculty ghost-writer, no pre-made script."
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
              <div className="section-label">The team</div>
              <h2>
                The people <span className="serif">behind it.</span>
              </h2>
            </div>
            <p>Student-run end to end. The work is shared, with a faculty advisor behind us.</p>
          </div>
          {leadership.length > 0 ? (
          <div className="officers">
            {leadership.map((officer) => (
              <div key={officer.id} className="officer">
                {localPhoto(officer.photoUrl) ? (
                  <div className="av av-photo">
                    <Image src={localPhoto(officer.photoUrl)!} alt={officer.name} fill sizes="64px" />
                  </div>
                ) : (
                  <div className="av">{initials(officer.name)}</div>
                )}
                <div className="name">
                  {officer.name}
                  {officer.classYear ? `, '${officer.classYear}` : ""}
                </div>
                <div className="role">{roleLabel(officer.role)}</div>
                <div className="bio">{officer.bio ?? ""}</div>
              </div>
            ))}
          </div>
          ) : null}
          {members.length > 0 ? (
            <div className="members-block">
              <div className="members-grid">
                {members.map((member) => {
                  const photo = localPhoto(member.photoUrl);
                  const fullName = `${member.firstName} ${member.lastName}`;
                  return (
                    <div key={member.id} className="member-card">
                      <div className="member-photo">
                        {photo ? (
                          <Image src={photo} alt={fullName} fill sizes="(max-width: 600px) 50vw, (max-width: 960px) 33vw, 20vw" />
                        ) : (
                          <div className="spkr-fallback">{initials(fullName)}</div>
                        )}
                      </div>
                      <div className="member-name">{fullName}</div>
                      <div className="member-class">Class of {member.gradYear}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
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
              <h3>Members do the work.</h3>
              <p>Every event, contact, and meeting agenda is owned by students working together. No hand-holding.</p>
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
