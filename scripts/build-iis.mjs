import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dest = join(root, "dist", "iis");

process.env.IIS_DEPLOY = "1";

const build = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
  cwd: root,
});
if (build.status) process.exit(build.status ?? 1);

const standalone = join(root, ".next", "standalone");
if (!existsSync(join(standalone, "server.js"))) {
  console.error("Standalone server.js was not produced. Check next.config output: 'standalone'.");
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
cpSync(standalone, dest, { recursive: true });
cpSync(join(root, "public"), join(dest, "public"), { recursive: true });
mkdirSync(join(dest, ".next"), { recursive: true });
cpSync(join(root, ".next", "static"), join(dest, ".next", "static"), { recursive: true });
cpSync(join(root, "deploy", "iis", "web.config"), join(dest, "web.config"));
for (const name of [".env", ".env.local", ".env.production", ".env.development"]) {
  rmSync(join(dest, name), { force: true });
}
mkdirSync(join(dest, "logs"), { recursive: true });
writeFileSync(join(dest, "logs", ".gitkeep"), "");

const prismaEngine = join(root, "node_modules", ".prisma");
if (existsSync(prismaEngine)) {
  cpSync(prismaEngine, join(dest, "node_modules", ".prisma"), { recursive: true });
}

const prismaClient = join(root, "node_modules", "@prisma", "client");
if (existsSync(prismaClient)) {
  mkdirSync(join(dest, "node_modules", "@prisma"), { recursive: true });
  cpSync(prismaClient, join(dest, "node_modules", "@prisma", "client"), { recursive: true });
}

console.log(`IIS package ready: ${dest}`);
console.log("Copy that folder to the IIS site. Add a .env next to server.js (see deploy/iis/README.md).");
console.log("Build this package on Windows if the IIS box is Windows — Prisma engines are OS-specific.");
