import type { Metadata } from "next";
import Image from "next/image";
import { PublicNav } from "@/components/public/Nav";
import { PageBannerCopy } from "@/components/public/PageBannerCopy";
import { SpeakerArchive } from "@/components/public/SpeakerFilters";
import { getLivePageBlocks, getSpeakers } from "@/lib/queries";

export const metadata: Metadata = { title: "Speakers" };
export const revalidate = 60;

export default async function SpeakersPage() {
  const [speakers, blocks] = await Promise.all([getSpeakers(), getLivePageBlocks("speakers")]);

  return (
    <>
      <PublicNav />
      <header className="page-banner">
        <Image className="pb-img" src="/photos/session-05.jpg" alt="Chaminade Investment Club meeting" fill priority sizes="100vw" />
        <div className="pb-overlay" />
        <div className="wrap pb-content">
          <PageBannerCopy
            blocks={blocks}
            crumbs="Speakers · Present & Past"
            lede="Guests are the core of the club. Professionals who've shaped careers in equities, banking, venture, and macro — and who answer real questions from students who've done the reading."
          >
            The people <span className="serif">in the room.</span>
          </PageBannerCopy>
        </div>
        <div className="pb-caption">Past session · Members &amp; guest</div>
      </header>
      <section className="section">
        <div className="wrap">
          <SpeakerArchive
            speakers={speakers.map((speaker) => ({
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
            }))}
          />
        </div>
      </section>
    </>
  );
}
