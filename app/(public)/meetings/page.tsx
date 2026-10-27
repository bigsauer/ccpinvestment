import type { Metadata } from "next";
import { SystemPage } from "@/components/public/SystemPage";
import { getSystemPage } from "@/lib/queries";
import { pageMeta } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getSystemPage("meetings");
  return pageMeta({ title: page.title, description: page.description, path: "/meetings" });
}

export default function Page() {
  return <SystemPage slug="meetings" />;
}
