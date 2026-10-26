/** Shrinks a big phone photo in the browser first, so uploads stay quick and under host body limits. */
async function downscale(file: File, maxEdge: number): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_800_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    return blob ?? file;
  } catch {
    return file; // e.g. HEIC the browser cannot decode: the server converts it
  }
}

/** Uploads an image and returns its /api/photo/<id> address. `large` keeps more resolution (website banners). */
export async function uploadPhoto(file: File, opts: { large?: boolean } = {}): Promise<string> {
  const blob = await downscale(file, opts.large ? 2600 : 1600);
  const body = new FormData();
  body.set("file", blob, file.name.replace(/\.[^.]+$/, "") + ".jpg");
  const res = await fetch(`/api/admin/photo${opts.large ? "?size=large" : ""}`, { method: "POST", body });
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed. Try again.");
  return json.url;
}
