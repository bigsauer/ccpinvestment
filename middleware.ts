import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
