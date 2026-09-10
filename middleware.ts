import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isLogin = path === "/admin/login";
  const isAdmin = path.startsWith("/admin");

  if (isAdmin && !isLogin && !req.auth) {
    const login = new URL("/admin/login", req.nextUrl);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  }

  if (isLogin && req.auth) {
    const next = req.nextUrl.searchParams.get("callbackUrl") ?? "/admin";
    const dest = next.startsWith("/admin") && !next.startsWith("//") && !next.includes("://") ? next : "/admin";
    return NextResponse.redirect(new URL(dest, req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
