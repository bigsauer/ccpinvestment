import type { Metadata } from "next";
import { Suspense } from "react";
import { GetInvolved } from "@/components/public/GetInvolved";
import { PageBannerCopy } from "@/components/public/PageBannerCopy";
import { PublicNav } from "@/components/public/Nav";
import { classYearList } from "@/lib/class-years";
import { getClubSettings, getLivePageBlocks } from "@/lib/queries";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Join the Club or Speak to Students",
  description:
    "Chaminade students can apply to join the investment club, and working professionals can apply to speak. Free to join, no experience needed. St. Louis.",
  path: "/get-involved",
});

export default async function GetInvolvedPage() {
  const [blocks, settings] = await Promise.all([getLivePageBlocks("get-involved"), getClubSettings()]);

  return (
    <>
      <PublicNav />
      <main>
      <header className="page-banner gi-banner">
        <div className="wrap pb-content">
          <PageBannerCopy
            blocks={blocks}
            crumbs="Get involved · Two ways in"
            lede="If you're a student at Chaminade, apply to join — it's free, no experience needed, and meetings start at 6:45 AM on Wednesday mornings. If you're a working professional, come tell our students what you actually do — 35 minutes, real questions, no pitching."
          >
            Pick the door <span className="serif">that&apos;s yours.</span>
          </PageBannerCopy>
        </div>
      </header>
      <Suspense fallback={<div className="wrap" style={{ padding: "48px 0", minHeight: 1400 }}>Loading forms…</div>}>
        <GetInvolved classYears={classYearList(settings.classYearFrom, settings.classYearTo)} />
      </Suspense>
      </main>
    </>
  );
}
