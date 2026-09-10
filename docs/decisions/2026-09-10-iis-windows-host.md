# IIS as an optional Windows host

- **Decision:** Ship a Next.js `standalone` build plus IIS `HttpPlatformHandler` config so the club site can run on a Windows/IIS box.
- **Was:** Vercel-only documented production path.
- **Why:** The school server already has IIS; IIS cannot execute TypeScript or Next.js by itself.
- **Cost:** Extra `build:iis` script and `web.config`. Vercel remains valid. Prisma engines must be built on Windows, not copied from a Mac.
- **Constraint going forward:** IIS is a reverse proxy to Node. Never treat `.ts` files as the IIS site content.
