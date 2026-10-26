import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isLogin = path === "/admin/login";
  const isAdmin = path.startsWith("/admin");
  // Pages an officer can reach before they have an account or a session.
  const isOpen =
    isLogin ||
    path === "/admin/setup" ||
    path === "/admin/signup" ||
    path === "/admin/session-ended" ||
    path.startsWith("/admin/invite/");

  if (isAdmin && !isOpen && !req.auth) {
    const login = new URL("/admin/login", req.nextUrl);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  }

  if (isLogin && req.auth) {
    const next = req.nextUrl.searchParams.get("callbackUrl") ?? "/admin";
    const dest = next.startsWith("/admin") && !next.startsWith("//") && !next.includes("://") ? next : "/admin";
    return NextResponse.redirect(new URL(dest, req.nextUrl));
  }

  // Let server components know which admin page they are rendering (used for the forced password change).
  const headers = new Headers(req.headers);
  headers.set("x-admin-path", path);
  return NextResponse.next({ request: { headers } });
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
