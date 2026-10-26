# CCP Investment Club

Public site + officer admin CMS for the Chaminade College Preparatory Investment Club (St. Louis).

## Decisions (v1)

| Decision | Choice |
|---|---|
| Stack | Next.js 15 App Router + TypeScript + Tailwind 4 |
| Data | Postgres via Prisma, local Docker on **port 5436** (5433 is Aeris) |
| Auth | Auth.js (NextAuth v5) credentials — **officer login only**, no public accounts |
| Roles | President, VP, Secretary, Treasurer (write); Advisor (read-only) |
| Content | `PageContent` JSON blocks — simple field editor, not a freeform CMS |
| RSVPs | Officer-entered count on meetings (no public RSVP form) |
| Email | Stub — confirmations log to `ActivityLog` only |
| Deploy | Default: Vercel. Optional: Windows IIS reverse-proxies a Next `standalone` Node process (`npm run build:iis`). Do not assume AWS/Cognito. |
| Tracking | **Do not create Linear issues for this repo.** Personal/school project, not RP Exotics. |

## Non-goals (v1)

Google/Cognito OAuth, SES/Resend, DynamoDB, public RSVP, billing, real deploy-from-settings, shipping placeholder speaker names/photos as if they were real guests.

## Local

```
cp .env.example .env.local   # then set AUTH_SECRET + SEED_ADMIN_PASSWORD
docker compose up -d
npm install
npx prisma migrate deploy    # or `npx prisma db push` for throwaway local schema
npm run db:seed              # LOCAL only — never against a shared/prod database
npm run dev
```

Admin: `/admin/login` — email from `SEED_ADMIN_EMAIL`. Password lives in `.env.local` only.

## Production (Vercel)

Set these before the first deploy. The app throws on boot if any required value is missing.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Vercel Postgres / Neon connection string |
| `AUTH_SECRET` | yes | `openssl rand -base64 32` |
| `AUTH_URL` | yes in production | Public origin, e.g. `https://ccpinvestment.vercel.app` |
| `ADMIN_SETUP_TOKEN` | first run only | Any long phrase. Lets you create the first super admin at `/admin/setup` (works only while there are no officers). |
| `SEED_ADMIN_*` | no | Do **not** set or run seed in production |

Apply schema with `npx prisma migrate deploy` (CI or one-off), not `db push`.

## Production (IIS / Windows)

IIS cannot execute TypeScript. Build on the **Windows** box (`npm run build:iis`) so Prisma engines match the OS, point the IIS site at `dist/iis`, and put `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` in a `.env` next to `server.js`. Details: `deploy/iis/README.md`.

## Site content blocks

LIVE `PageContent.blocks` string keys that public pages read: `crumbs`, `headline`, `serif`, `lede`. Empty `headline` keeps the designed title.
