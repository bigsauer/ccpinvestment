# Running the club site (officer guide)

Everything on the public site is managed from the admin portal. Nobody needs a database editor or a developer.

Sign in at **/admin** (for example `www.ccpinvestmentclub.com/admin`). Officers only.

## Who can do what

| Role | Can do |
|---|---|
| Super admin / President | Everything, plus invite, edit, deactivate and delete officers |
| Vice President, Secretary, Treasurer | Edit all site content, handle inquiries, manage members and speakers |
| Faculty advisor | View only |

## Getting started (first time only)

1. In Vercel (Settings, Environment Variables) add `ADMIN_SETUP_TOKEN` with any long phrase you choose, then redeploy.
2. Open `/admin/setup`, enter that phrase plus your name, email and a password. That makes the first super admin.
3. Everyone else joins by invitation (below). The setup page stops working once an officer exists.

## Adding and removing officers (Officers page)

- **Invite**: Officers, Invitations, enter their email and role. You get a one-time link (7 days). Send it by email or message. They choose their own password.
- **Sign-up requests**: people can ask for access at `/admin/signup`. Approve it under Officers, Access requests, pick a role, and send them the link.
- **Change a role, switch an account off, or set a temporary password**: Officers, Manage. A temporary password forces them to pick their own at sign-in.
- **Delete**: Officers, Manage, Delete. Their notes stay, signed with their name. The last super admin cannot be removed.
- Five wrong passwords lock an account for 15 minutes.

## Day to day

| Task | Where |
|---|---|
| Answer student and speaker forms | Inquiries (reply by email, add notes, approve or decline) |
| Approve a student | Inquiries, Approve. They land in Members; open the record to add a photo |
| Approve a speaker | Inquiries, Approve. They land in Speakers; open the profile to finish it |
| Add or edit a speaker, photo, bio, career story | Speakers |
| Add members, upload photos (shown on the Team page) | Members |
| Schedule a meeting, publish it, add RSVPs | Meetings (only Published ones show publicly) |
| Change page headlines and intro text | Site content |
| Swap the big photos (home page, page banners), set the crop, preview on computer and phone | Site images |
| Change home page numbers, season, location, contact, and the class years on the join form | Settings |
| See who changed what | Activity log |
| Download the roster or inquiries | Members / Inquiries, Export CSV |

## Good to know

- Times are St. Louis time.
- Changes show on the public site within about a minute.
- Photos are uploaded straight from the form and stored in the database, so they work on every host.
- Email notifications are not set up. New inquiries show on the Dashboard and as a number on the Inquiries menu item, and "Reply by email" opens your mail app.
