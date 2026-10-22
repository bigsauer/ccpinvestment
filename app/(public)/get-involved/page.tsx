import type { Metadata } from "next";
import { Suspense } from "react";
import { GetInvolved } from "@/components/public/GetInvolved";
import { PageBannerCopy } from "@/components/public/PageBannerCopy";
import { PublicNav } from "@/components/public/Nav";
import { getLivePageBlocks } from "@/lib/queries";

export const metadata: Metadata = { title: "Get involved" };

export default async function GetInvolvedPage() {
  const blocks = await getLivePageBlocks("get-involved");

  return (
    <>
      <PublicNav />
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
      <Suspense fallback={<div className="wrap" style={{ padding: "48px 0" }}>Loading forms…</div>}>
        <GetInvolved />
      </Suspense>
    </>
  );
}
