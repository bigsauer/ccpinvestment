import { signOut } from "@/lib/auth";

// Reached when an officer's account was removed or deactivated while they were signed in.
export async function GET() {
  await signOut({ redirectTo: "/admin/login?reason=ended" });
}
