# Keeping the club site running after you graduate

The site is built so that officers can run it without a developer: every page, photo, speaker, meeting, member, menu link and officer account is managed from **/admin**. This guide covers the few things that are not in the admin: accounts, yearly rollover and what to do if something breaks.

## 1. Before the outgoing tech lead leaves (checklist)

- [ ] Make your successor a **super admin** (Officers, Manage, tick Super admin). Then they can invite and remove everyone else.
- [ ] Add a second super admin as a backup (a faculty advisor works well: give them the Co-President role or tick Super admin).
- [ ] **GitHub** (code): transfer the repository to a club or school account, or add the successor as an owner.
- [ ] **Vercel** (hosting): add the successor to the team as an owner, or move the project to their account.
- [ ] **Supabase** (database): add the successor as an owner of the project.
- [ ] **GoDaddy** (the ccpinvestmentclub.com domain): make the club or school the account holder, turn on auto-renew, and put a club email on the account.
- [ ] If used: **Resend** (sending email) account and the school's IT contact for the school-server copy of the site.
- [ ] Put every login in a shared password manager that more than one adult can open.
- [ ] Last step: the successor deletes your officer account (Officers, Manage, Delete). You cannot delete yourself.

## 2. Every year (late summer)

1. **Officers**: invite the new officers (Officers, Invitations). Delete or deactivate the ones who graduated.
2. **Members**: set graduated students to **Alum**. Add or approve new members.
3. **Settings**: update the season label (for example "Fall 2027") and the class years offered on the join form (move the first year up).
4. **Speakers and meetings**: add the new schedule, publish it, update the numbers on the home page (Settings, Home page & contact).
5. **Team page**: add new member photos; officer bios and photos are on their accounts.
6. **Dates to check**: the domain renewal, and that the database is awake (see section 4).

## 3. Everyday tasks

See `docs/ADMIN.md` (also in the admin under Help & handoff). Short version:

| Task | Where in /admin |
|---|---|
| Answer student and speaker forms | Inquiries |
| Add a speaker, photo, career story | Speakers |
| Schedule and publish a meeting | Meetings |
| Edit any page, including Home, Meetings, Speakers, Team and Get involved, or build a new one (no code) | Pages |
| Change the top menu | Navigation |
| Replace the big photos | Site images |
| Club name, season, home numbers, class years | Settings |
| Invite or remove officers | Officers |

## 4. If something goes wrong

- **Someone is locked out.** Five wrong passwords lock an account for 15 minutes. A super admin can also set a temporary password (Officers, Manage).
- **Nobody can sign in at all.** In Supabase open the SQL editor and run `update "Officer" set "failedLogins" = 0, "lockedUntil" = null;`. If every account is lost, delete the Officer rows, set `ADMIN_SETUP_TOKEN` in Vercel, redeploy, and use `/admin/setup` to create a fresh super admin.
- **The site shows an error or old content.** Content changes take up to a minute to appear. If the whole site errors, the database may be asleep: free Supabase projects pause after about a week without use. Open the project in Supabase and press **Restore project**. Upgrading the plan stops this.
- **A photo will not upload.** Use a JPG or PNG under 8 MB; phone photos are fine.
- **The site is behind the school filter.** That is a school IT setting, not a site fault. Ask IT to allow the domain.

## 5. Costs and renewals

- Domain (ccpinvestmentclub.com): yearly renewal at GoDaddy.
- Vercel and Supabase: free tiers are enough for this site. The database pauses after a week of no use on the free tier.
- Sending invitation emails from the site (optional): a Resend account and a verified domain.

## 6. Backups

Use **Export CSV** on Members, Inquiries and Speakers a few times a year and keep the files somewhere shared. Photos live in the database, so they are covered by database backups (paid Supabase plans include daily backups).

## 7. For a developer picking this up

- Stack and decisions: `AGENTS.md`. Hosting on the school server: `deploy/iis/README.md`.
- The club's own pages are defined in `lib/default-pages.ts` (also the "reset to original" source) and drawn by `components/public/PageBlocks.tsx` with the live-data sections in `components/public/sections/`. `npx tsx scripts/print-system-seed.ts` prints SQL that stores them in the database.
- Database changes live in `prisma/migrations`. Page-builder blocks are defined in `lib/page-blocks.ts` (add one definition, one renderer case in `components/public/PageBlocks.tsx`).
- Content never needs a deploy. Code changes do: `vercel deploy --prod`, and `scripts\update-iis.cmd` on the school server.
