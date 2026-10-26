import sharp from "sharp";
import { prisma } from "@/lib/db";
import { canWriteContent, getActor } from "@/lib/guard";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

// Officers upload a photo; it is normalised (rotated, resized, re-encoded as JPEG) and stored in the database.
export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor || !canWriteContent(actor)) {
    return Response.json({ error: "Sign in with an officer account to upload photos." }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const entry = form.get("file");
    file = entry instanceof File ? entry : null;
  } catch {
    return Response.json({ error: "Could not read the upload." }, { status: 400 });
  }
  if (!file || file.size === 0) return Response.json({ error: "Choose an image first." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "That image is over 8 MB. Try a smaller one." }, { status: 413 });

  try {
    const input = Buffer.from(await file.arrayBuffer());
    // Website photos (banners, hero) keep more resolution than portraits.
    const large = new URL(req.url).searchParams.get("size") === "large";
    const data = await sharp(input)
      .rotate()
      .resize(large ? { width: 2400, height: 1800, fit: "inside", withoutEnlargement: true } : { width: 1400, height: 1800, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: large ? 82 : 84, mozjpeg: true })
      .toBuffer();
    const photo = await prisma.photo.create({
      data: { mime: "image/jpeg", data: new Uint8Array(data), size: data.length, label: file.name.slice(0, 120) },
      select: { id: true },
    });
    return Response.json({ url: `/api/photo/${photo.id}` });
  } catch {
    return Response.json({ error: "That file is not a usable image. Use a JPG, PNG, WebP or HEIC photo." }, { status: 415 });
  }
}
