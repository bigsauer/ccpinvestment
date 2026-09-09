"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

function safeCallback(raw: string) {
  if (!raw.startsWith("/admin")) return "/admin";
  if (raw.startsWith("//") || raw.includes("://") || raw.includes("\\")) return "/admin";
  return raw;
}

export async function login(_prev: { error?: string }, formData: FormData) {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: safeCallback(String(formData.get("callbackUrl") ?? "/admin")),
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
