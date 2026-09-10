import type { NextAuthConfig } from "next-auth";

type OfficerRole = "PRESIDENT" | "VP" | "SECRETARY" | "TREASURER" | "ADVISOR";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.officerId = user.officerId;
        token.role = user.role;
        token.classYear = user.classYear ?? null;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.officerId = String(token.officerId ?? "");
      session.user.role = token.role as OfficerRole;
      session.user.classYear = typeof token.classYear === "string" ? token.classYear : null;
      session.user.name = typeof token.name === "string" ? token.name : session.user.name;
      session.user.email = typeof token.email === "string" ? token.email : session.user.email;
      return session;
    },
  },
} satisfies NextAuthConfig;
