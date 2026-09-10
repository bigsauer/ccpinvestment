import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { OfficerRole } from "@prisma/client";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
});

export function canWrite(role: OfficerRole) {
  return role !== "ADVISOR";
}
