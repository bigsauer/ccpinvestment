import type { OfficerRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      officerId: string;
      role: OfficerRole;
      classYear?: string | null;
    };
  }

  interface User {
    officerId: string;
    role: OfficerRole;
    classYear?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    officerId: string;
    role: OfficerRole;
    classYear?: string | null;
  }
}
