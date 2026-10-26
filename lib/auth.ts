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
        if (!officer || !officer.active) return null;
        if (officer.lockedUntil && officer.lockedUntil > new Date()) return null;

        const ok = await compare(password, officer.passwordHash);
        if (!ok) {
          // Five wrong passwords in a row lock the account for 15 minutes.
          const failed = officer.failedLogins + 1;
          await prisma.officer.update({
            where: { id: officer.id },
            data: failed >= 5
              ? { failedLogins: 0, lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }
              : { failedLogins: failed },
          });
          return null;
        }
        await prisma.officer.update({
          where: { id: officer.id },
          data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
        });

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
