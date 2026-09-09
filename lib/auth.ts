import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { OfficerRole } from "@prisma/client";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const officer = await prisma.officer.findUnique({ where: { email } });
        if (!officer) return null;

        const ok = await compare(password, officer.passwordHash);
        if (!ok) return null;

        return {
          id: officer.id,
          email: officer.email,
          name: officer.name,
          officerId: officer.id,
          role: officer.role,
          classYear: officer.classYear,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.officerId = user.officerId;
        token.role = user.role;
        token.classYear = user.classYear ?? null;
        token.name = user.name;
        token.email = user.email;
      } else if (typeof token.officerId === "string") {
        const officer = await prisma.officer.findUnique({
          where: { id: token.officerId },
          select: { role: true, classYear: true, name: true, email: true },
        });
        if (officer) {
          token.role = officer.role;
          token.classYear = officer.classYear;
          token.name = officer.name;
          token.email = officer.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.officerId = String(token.officerId);
      session.user.role = token.role as OfficerRole;
      session.user.classYear = typeof token.classYear === "string" ? token.classYear : null;
      session.user.name = typeof token.name === "string" ? token.name : session.user.name;
      session.user.email = typeof token.email === "string" ? token.email : session.user.email;
      return session;
    },
  },
});

export function canWrite(role: OfficerRole) {
  return role !== "ADVISOR";
}
