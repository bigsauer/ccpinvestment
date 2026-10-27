import Image from "next/image";
import Link from "next/link";
import { RichHeadline } from "@/components/public/RichHeadline";
import { getPublicMembers, getPublicOfficers } from "@/lib/queries";
import { localPhoto } from "@/lib/speakers";
import { initials, roleLabel } from "@/lib/utils";

type Props = {
  label: string;
  heading: string;
  intro: string;
  showOfficers: boolean;
  values: { k: string; title: string; text: string }[];
};

/** Officers, members with photos and the faculty advisor, then the values. People come from the admin. */
export async function TeamSection({ label, heading, intro, showOfficers, values }: Props) {
  const [officers, members] = await Promise.all([getPublicOfficers(), getPublicMembers()]);
  const leadership = officers.filter((officer) => officer.role !== "ADVISOR");
  const advisor = officers.find((officer) => officer.role === "ADVISOR");

  return (
    <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">{label}</div>
              <h2>
                <RichHeadline text={heading} />
              </h2>
            </div>
            <p>{intro}</p>
          </div>
          {showOfficers && leadership.length > 0 ? (
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
          {values.length > 0 ? (
            <div className="values">
              {values.map((value, i) => (
                <div key={i} className="value">
                  <div className="k">{value.k}</div>
                  <h3>{value.title}</h3>
                  <p>{value.text}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
    </section>
  );
}
