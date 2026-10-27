import { Suspense } from "react";
import { GetInvolved } from "@/components/public/GetInvolved";
import { classYearList } from "@/lib/class-years";
import { getClubSettings } from "@/lib/queries";

/** The two doors (join the club, speak to students) and their forms. Class years come from Settings. */
export async function JoinFormsSection() {
  const settings = await getClubSettings();
  return (
    <Suspense fallback={<div className="wrap" style={{ padding: "48px 0", minHeight: 1400 }}>Loading forms…</div>}>
      <GetInvolved classYears={classYearList(settings.classYearFrom, settings.classYearTo)} />
    </Suspense>
  );
}
