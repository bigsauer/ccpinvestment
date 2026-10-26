import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Public: photos are shown on the public site. Ids are unguessable and a replaced photo gets a new id,
// so responses can be cached forever.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await prisma.photo.findUnique({ where: { id }, select: { mime: true, data: true } });
  if (!photo) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
