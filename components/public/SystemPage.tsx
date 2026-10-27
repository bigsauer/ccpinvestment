import type { ReactNode } from "react";
import { PublicNav } from "@/components/public/Nav";
import { PageBlocks } from "@/components/public/PageBlocks";
import { JoinFormsSection } from "@/components/public/sections/JoinFormsSection";
import { MeetingsSection } from "@/components/public/sections/MeetingsSection";
import { SpeakerArchiveSection } from "@/components/public/sections/SpeakerArchiveSection";
import { TeamSection } from "@/components/public/sections/TeamSection";
import type { SystemSlug } from "@/lib/default-pages";
import type { Block } from "@/lib/page-blocks";
import { getPageContext, getSystemPage } from "@/lib/queries";

const str = (block: Block, key: string) => (typeof block[key] === "string" ? (block[key] as string) : "");

/** The sections that read live data. Everything else a page is made of is plain block content. */
function renderDynamic(block: Block): ReactNode {
  switch (block.type) {
    case "meetingsSchedule":
      return <MeetingsSection />;
    case "speakerArchive":
      return <SpeakerArchiveSection />;
    case "joinForms":
      return <JoinFormsSection />;
    case "teamPeople": {
      const values = (Array.isArray(block.values) ? (block.values as Record<string, unknown>[]) : []).map((v) => ({
        k: String(v.k ?? ""),
        title: String(v.title ?? ""),
        text: String(v.text ?? ""),
      }));
      return <TeamSection label={str(block, "label")} heading={str(block, "heading")} intro={str(block, "intro")} showOfficers={str(block, "showOfficers") === "show"} values={values} />;
    }
    default:
      return null;
  }
}

/** One of the club's own pages (home, meetings, speakers, team, get involved), drawn by the page-builder engine. */
export async function SystemPage({ slug, showNextMeeting = false }: { slug: SystemSlug; showNextMeeting?: boolean }) {
  const [page, ctx] = await Promise.all([getSystemPage(slug), getPageContext()]);
  return (
    <>
      <PublicNav showNextMeeting={showNextMeeting} />
      <main>
        <PageBlocks site blocks={page.blocks} ctx={ctx} renderDynamic={renderDynamic} />
      </main>
    </>
  );
}
