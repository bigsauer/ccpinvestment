# Handoff: CCP Investment Club — Public Site + Admin CMS (Next.js)

## Overview

Two products, one design language:

1. **Public marketing site** — 5 routes. Tells students and finance professionals what the club is, shows the meeting schedule and speaker archive, and captures two kinds of applications (student membership, guest speaker).
2. **Admin CMS** — 7 screens behind officer login. Officers triage the applications that come in from the public site, schedule meetings, manage the speaker archive and member roster, edit page content, and configure the club.

Target stack for the rebuild: **Next.js (App Router) + TypeScript**. Static/ISR for the public site, server components + route handlers for the admin.

## About the Design Files

The files in `design-references/` are **design references created in HTML** — high-fidelity prototypes showing intended look and behavior. They are **not production code to port**. Rebuild them as real Next.js routes and React components using idiomatic patterns (App Router, server components, Tailwind or CSS Modules, a real form library, a real database).

Notably, the HTML prototypes fake things that must become real:
- All five public "pages" live in a single `index.html` behind `.view[data-view]` divs and a hash router → these become **five real routes**.
- Admin "pages" are `.page[data-page]` divs toggled by JS → these become **real routes under `/admin`**.
- Speaker photos are inlined base64 JPEGs (the file is ~1.4 MB of data URIs) → replace with real image assets in `/public` or a CDN/S3 bucket, rendered via `next/image`.
- Form submits are simulated with `setTimeout` → replace with real server actions.
- All names, bios, firms, and topics are **placeholder copy** (`Guest speaker name`, `[Firm]`). Do not ship them.

## Fidelity

**High-fidelity.** Colors, type, spacing, radii, and hover states are final. Recreate pixel-close. The one exception is the imagery — photos are stand-ins.

## Screenshots

All in `screenshots/`. Each is the full page at desktop width.

| # | File | Screen |
|---|---|---|
| 01 | `01-public-home.png` | Home |
| 02 | `02-public-meetings.png` | Meetings |
| 03 | `03-public-speakers.png` | Speakers archive |
| 04 | `04-public-team.png` | Team |
| 05 | `05-public-getinvolved-students.png` | Get involved — two doors + student tab |
| 06 | `06-public-getinvolved-speakers.png` | Get involved — speaker application form |
| 07 | `07-admin-dashboard.png` | Admin dashboard |
| 08 | `08-admin-applications.png` | Admin applications inbox |
| 09 | `09-admin-meetings.png` | Admin meetings |
| 10 | `10-admin-speakers.png` | Admin speakers |
| 11 | `11-admin-members.png` | Admin members |
| 12 | `12-admin-site-content.png` | Admin site content |
| 13 | `13-admin-settings.png` | Admin settings |
| 14 | `14-admin-sidebar-collapsed.png` | Admin with sidebar collapsed (64px rail) |

## Routes

### Public

| Route | Screen | Rendering |
|---|---|---|
| `/` | Home — hero with next meeting, stats band, "not a finance class" features, CTA | Static / ISR |
| `/meetings` | Next-session hero card + full upcoming table + past-session photo grid | ISR (revalidate on CMS write) |
| `/speakers` | Filterable speaker archive (All / Upcoming / Past) | ISR |
| `/team` | Officer cards, faculty advisor, club values | Static |
| `/get-involved` | Two doors → tabbed panels: student application, speaker application | Static shell + server actions |

`/get-involved` needs a deep-linkable tab: `?tab=students` / `?tab=speakers` (the prototype already reads a tab param).

### Admin (auth required)

| Route | Screen |
|---|---|
| `/admin` | Dashboard — 4 stat cards, next-meeting card, activity feed, 3-up preview cards |
| `/admin/applications` | Inbox — master/detail. List rail (360px) + full submission detail, notes thread, approve/reject |
| `/admin/meetings` | Meeting table + scheduling |
| `/admin/speakers` | Speaker card gallery + add tile |
| `/admin/members` | Member roster table |
| `/admin/content` | Page cards → per-page block editor (fields left, publish/meta rail right) |
| `/admin/settings` | Sub-nav (General, Officers & roles, Integrations, Email templates, Forms, Deploy, Billing, Danger zone) |

## Data Model (suggested)

Prototype implies these entities. The existing `backend-architecture.html` reference specs a DynamoDB single-table design; Postgres + Prisma is the simpler choice for a Next.js app — either is fine, pick one and be consistent.

```
Member        id, firstName, lastName, email, gradYear, status(active|alum|pending), joinedAt, role
Speaker       id, firstName, lastName, firm, title, bio, photoUrl, linkedinUrl?, industry, status(upcoming|past)
Meeting       id, date, time, location, speakerId?, topic, status(confirmed|tentative|open), published, rsvpCount
Application   id, type(student|speaker), payload(json), status(new|reviewing|approved|rejected|archived),
              flagged, submittedAt, reviewedBy
Note          id, applicationId, authorId, body, createdAt
Officer       id, name, email, role, classYear, permissions
ActivityLog   id, actor, action, targetType, targetId, createdAt
PageContent   slug, blocks(json), status(live|draft), updatedAt, updatedBy
```

**Application → Speaker/Member promotion** is the core admin flow: approving a speaker application creates a `Speaker` record; approving a student application creates a `Member`.

## Key Interactions & Behavior

**Public**
- Speaker archive filter chips — client-side filter on `type`, `.filter.on` gets `background: var(--ink); color: #fff`.
- Get-involved two doors — clicking a door reveals the matching tab panel; tabs stay switchable afterward.
- Both forms: required-field validation, disabled submit while pending, then a green success message and all inputs disabled. Speaker form has multi-select topic chips, a single-select format chip row, and multi-select date pills (all writing into hidden inputs — in React these become plain state).
- **LinkedIn URL on the speaker form is optional.** Past speaker cards render it as a pill with an "in" mark and `linkedin.com/in/handle`; hover turns `#0a66c2`. Cards without a URL simply omit the pill.
- Card hovers: `translateY(-2px)`, border to `--line-2`, `box-shadow: 0 8px 24px rgba(0,0,0,0.04)`.

**Admin**
- **Collapsible sidebar** — 240px ↔ 64px, `transition: grid-template-columns .22s cubic-bezier(.4,0,.2,1)`. Circular chevron toggle on the sidebar's right edge (24px, offset `right: -12px`), chevron rotates 180°. Collapsed: labels/badges/section headers hide, nav items center, unread badge floats top-right over the icon, hover shows a tooltip to the right. State persists (prototype uses `localStorage`; in Next.js prefer a cookie so the server render matches).
- Topbar is sticky, 56px, `backdrop-filter: blur(14px) saturate(140%)` over `rgba(250,250,247,0.82)`.
- Applications inbox: selecting a row sets `.on` (red-soft background + 2px red left border) and loads the detail pane. Tab strip and filter row are independent selection groups.
- Every destructive action lives in Settings → Danger zone.

## Design Tokens

Lift verbatim into `globals.css` / Tailwind theme.

```css
--bg: #fafaf7;      --bg-2: #ffffff;   --bg-3: #f3f2ee;
--line: #e7e6e1;    --line-2: #d4d3cd;
--ink: #0f0f10;     --ink-2: #3a3a3d;  --ink-3: #6a6a6e;  --ink-4: #9b9ba0;
--red: #c41e28;     --red-2: #a21820;  --red-soft: #fde8ea;
--green: #1fa56a;   --amber: #c8881f;  --blue: #2a6fdb;

/* admin sidebar only */
--side: #16161a;    --side-2: #1f1f24;
--side-line: rgba(255,255,255,0.08);
--side-ink: rgba(255,255,255,0.95);
--side-ink-2: rgba(255,255,255,0.62);
--side-ink-3: rgba(255,255,255,0.4);

/* avatar gradients */
b1 #c41e28→#6a1018   b2 #2a6fdb→#1c4a96   b3 #1fa56a→#117548
b4 #c8881f→#8c5d11   b5 #6e3aaf→#4a2480   b6 #3a3a3d→#16161a
```

**Type** — three families, loaded from Google Fonts (use `next/font`):
- `Geist` 400/500/600/700 — everything by default. `font-feature-settings: 'ss01','cv11'`. Body 14px/1.5.
- `Geist Mono` 400/500 — labels, eyebrows, counts, dates, keys. Always uppercase with `letter-spacing: 0.06–0.16em`, sizes 9.5–13px.
- `Instrument Serif` italic 400 — the accent phrase inside headlines only (`<span class="serif">`). Never body copy.

**Scale** — page h1 32px/-0.025em/500 · section h2 ~28px · card title 14.5–18px/500 · body 13.5–14px · mono label 10.5px.

**Radii** — 6px chips/small · 7px buttons + inputs · 10–12px inner cards · 12px admin cards · 14px public cards · 999px pills.

**Spacing** — 4px base. Card padding 18–24px, page padding 28px, section gaps 14–16px, max content width 1300px (admin) / 1200px (public wrap).

**Shadows** — only two: `0 8px 24px rgba(0,0,0,0.04)` on card hover, `0 2px 6px rgba(0,0,0,0.18)` on the sidebar toggle.

**Focus ring** — `border-color: var(--ink); box-shadow: 0 0 0 3px rgba(15,15,16,0.06)`.

## Responsive

Breakpoints in the prototype: **900px** (admin sidebar hides entirely, all multi-column grids collapse to 1fr, inbox master/detail stacks; public grids go 3→2 col) and **600px** (everything 1fr). The public site is the one that actually needs mobile polish — students will open it on phones. Admin can stay desktop-first, but the sidebar needs a real mobile drawer rather than `display: none`.

## Suggested Next.js Structure

```
app/
  (public)/
    layout.tsx            # nav + footer
    page.tsx              # home
    meetings/page.tsx
    speakers/page.tsx
    team/page.tsx
    get-involved/page.tsx
  admin/
    layout.tsx            # <Sidebar/> + <Topbar/>, reads collapsed cookie
    page.tsx
    applications/page.tsx
    meetings/page.tsx
    speakers/page.tsx
    members/page.tsx
    content/page.tsx
    settings/[section]/page.tsx
  api/                    # or server actions
components/
  ui/                     # Button, Pill, Card, Field, Table, Avatar, TabStrip
  public/                 # SpeakerCard, MeetingRow, JoinForm, SpeakForm
  admin/                  # Sidebar, StatCard, ActivityFeed, InboxList, InboxDetail
lib/
  db.ts, auth.ts, tokens.ts
```

Six primitives cover almost everything: **Button** (`default` / `red` / `ghost`, plus `lg`), **Pill** (`green|red|amber|blue|gray`), **Card** (+ head/body), **Field** (label + optional hint + input/select/textarea), **Table**, **Avatar** (initials over one of six gradients).

## Auth

Officer login only — no public accounts. Roles: President, VP, Secretary, Treasurer, Advisor (read-only on most, receives copies of speaker applications). NextAuth with email magic links or Google (school Workspace) is the low-friction pick; the architecture doc assumes Cognito if you stay on AWS.

## Assets

- **Fonts** — Geist, Geist Mono, Instrument Serif (Google Fonts).
- **Icons** — inline 24×24 stroke SVGs, `stroke-width: 1.6`, drawn from the Lucide/Feather set. Swap for `lucide-react`.
- **Photos** — all speaker/session photos in the prototype are base64 placeholders. They must be replaced with real, cleared photos before launch.
- **Brand mark** — "CIC" monogram: black circle, white Geist Mono 10.5px, `letter-spacing: 0.04em`.

## Files in This Bundle

```
design-references/
  public-site.html            # all 5 public routes (hash-routed views)
  admin-cms.html              # all 7 admin screens
  backend-architecture.html   # AWS architecture + cost model reference
screenshots/                  # 14 PNGs, see table above
README.md
```

## Open Questions for the Team

1. Database: Postgres/Prisma (recommended for Next.js) or the DynamoDB single-table design in the architecture doc?
2. Does the site content editor need to be real, or is content in the repo acceptable for v1? (It's the single biggest scope item in the admin.)
3. Are RSVPs public-facing (students RSVP on `/meetings`) or officer-entered only? The dashboard shows a count either way.
4. Email: SES, Resend, or Postmark for application confirmations and meeting reminders?
