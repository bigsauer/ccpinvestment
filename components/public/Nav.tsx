import { NavClient } from "@/components/public/NavClient";
import { getNavLinks } from "@/lib/queries";

/** The site menu. Reads the officers' menu from the database (or the original menu) on the server. */
export async function PublicNav({ showNextMeeting = false }: { showNextMeeting?: boolean }) {
  const links = await getNavLinks();
  return <NavClient links={links} showNextMeeting={showNextMeeting} />;
}
