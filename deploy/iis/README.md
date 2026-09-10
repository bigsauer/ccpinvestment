# IIS host (Windows)

IIS does **not** run TypeScript or Next.js. This package compiles the app to JavaScript and lets IIS reverse-proxy to Node.

Vercel remains the cloud path. Use this only when the site must live on the school Windows server.

## Server prerequisites

1. IIS with an application pool (**64-bit** — disable “Enable 32-Bit Applications”).
2. [HttpPlatformHandler 1.2](https://www.iis.net/downloads/microsoft/httpplatformhandler) installed.
3. [Node.js LTS](https://nodejs.org/) at `%ProgramFiles%\nodejs\node.exe`.
4. Postgres the box can reach (local or hosted). Do not run `db:seed` against that database.

## Build on the Windows machine

Prisma ships a native engine. A Mac/Linux build will not start on Windows.

```bat
git pull
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build:iis
```

`dist\iis\` is the site root (`server.js` + `web.config` + `.next` + `public`). The build deletes any copied `.env*` so local secrets are not packed.

## Site setup

1. In IIS Manager, point the site physical path at `dist\iis` (or a copied folder).
2. Next to `server.js`, create `.env` (never commit this file):

```
DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_URL=https://your-iis-hostname
```

`AUTH_URL` must be the public origin visitors use.

3. Recycle the app pool. Browse `/` and `/api/health` (`{"ok":true,"db":"up"}`).
4. Officer login is `/admin/login`.

Stdout from Node lands in `logs\`. If the site 502s, read that log first — usually missing env, wrong Node path, or a Mac-built Prisma engine.

## What IIS is doing

`web.config` starts `node server.js` and forwards every request to the port HttpPlatformHandler assigns. TypeScript never hits IIS.
