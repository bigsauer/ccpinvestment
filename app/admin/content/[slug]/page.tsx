import { redirect } from "next/navigation";

export default async function ContentSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/admin/pages/${slug}`);
}
