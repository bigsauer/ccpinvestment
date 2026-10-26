import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { FormState } from "@/lib/form-state";

export function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function done(message: string, extra: Partial<FormState> = {}): FormState {
  return { ok: true, message, ...extra };
}

/** Turns a thrown error into form feedback. Redirects (thrown by redirect()) must keep flowing. */
export function fail(error: unknown): FormState {
  if (isRedirectError(error)) throw error;
  if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "P2002") {
    return { ok: false, error: "That value is already in use (for example, an email that belongs to someone else)." };
  }
  return { ok: false, error: error instanceof Error ? error.message : "Something went wrong" };
}

/** Public pages that show database content. */
export function revalidatePublic() {
  for (const path of ["/", "/meetings", "/speakers", "/team", "/get-involved", "/sitemap.xml"]) revalidatePath(path);
  revalidatePath("/speakers/[slug]", "page");
}

export function revalidateAdmin() {
  revalidatePath("/admin", "layout");
}

export function checkPassword(password: string, email?: string) {
  if (password.length < 10) throw new Error("Use a password of at least 10 characters.");
  if (email && password.toLowerCase() === email.toLowerCase()) throw new Error("The password cannot be the email address.");
  if (/^(.)\1+$/.test(password)) throw new Error("Choose a less repetitive password.");
}

export function localPhotoPath(raw: string) {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) throw new Error("Photos must be uploaded through the photo button.");
  return raw;
}
