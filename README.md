# Chaminade Investment Club

Next.js public site + officer admin CMS. Design source: `design_handoff_ccp_investment_club/`.

## Local (LOCAL)

```bash
cp .env.example .env.local
# set AUTH_SECRET and SEED_ADMIN_PASSWORD
docker compose up -d
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed   # LOCAL only — never against prod
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin/login
- Health: http://localhost:3000/api/health

Postgres is on **localhost:5436**. Officer email is `SEED_ADMIN_EMAIL` in `.env.local`.

**Vercel:** set `DATABASE_URL`, `AUTH_SECRET`, and `AUTH_URL` before the first deploy. Apply schema with `prisma migrate deploy`, not `db push`. Do not run seed in production.
