import { SITE } from "@/lib/site";

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type InviteEmailInput = {
  name: string;
  roleLabel: string;
  link: string;
  inviterName: string;
  days: number;
};

/** The branded officer-invitation email: club logo, red button, plain-text twin. Inline styles only, for mail apps. */
export function inviteEmail({ name, roleLabel, link, inviterName, days }: InviteEmailInput) {
  const first = name.trim().split(/\s+/)[0] ?? "";
  const hi = first ? `Hi ${first},` : "Hi,";
  const logo = `${SITE.url}/brand/club-badge.png`;
  const adminUrl = `${SITE.url}/admin`;
  const subject = `You're invited to the ${SITE.name} admin site`;

  const text = [
    SITE.name,
    "",
    "You're invited to the admin site",
    "",
    hi,
    "",
    `${inviterName} invited you to help run the club website as ${roleLabel}. From the admin site you can manage speakers, meetings, members and photos, answer inquiries, and invite other officers.`,
    "",
    "Create your account:",
    link,
    "",
    `You'll confirm your name and choose your own password (at least 10 characters). The link works once and expires in ${days} days. After that, sign in any time at ${adminUrl}`,
    "",
    "If you weren't expecting this, you can ignore it. The link stops working on its own.",
    "",
    `${SITE.name}, student-run at ${SITE.school.name}, ${SITE.school.city}. Est. ${SITE.foundedYear}.`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f0eb;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f1f0eb;">Create your officer account for the ${esc(SITE.name)} site. The link works once and expires in ${days} days.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f0eb;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e3e1d9;">
        <tr>
          <td align="center" style="background-color:#0f0f10;padding:34px 24px 28px 24px;">
            <img src="${logo}" width="88" height="88" alt="${esc(SITE.name)}" style="display:block;border:0;outline:none;text-decoration:none;margin:0 auto 14px auto;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:28px;color:#ffffff;letter-spacing:0.2px;">${esc(SITE.name)}</div>
            <div style="font-family:Menlo,Consolas,'Courier New',monospace;font-size:11px;line-height:16px;letter-spacing:2px;color:#ff8088;text-transform:uppercase;margin-top:6px;">Officer admin &middot; Est. ${esc(SITE.foundedYear)}</div>
          </td>
        </tr>
        <tr><td style="background-color:#c41e28;height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>
        <tr>
          <td style="padding:36px 36px 8px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#18181a;">
            <div style="font-size:26px;line-height:32px;font-weight:600;letter-spacing:-0.4px;color:#0f0f10;">You're invited to the admin site.</div>
            <p style="margin:16px 0 0 0;font-size:16px;line-height:25px;color:#3a3a3e;">${esc(hi)}</p>
            <p style="margin:12px 0 0 0;font-size:16px;line-height:25px;color:#3a3a3e;">${esc(inviterName)} invited you to help run the club website as <strong style="color:#0f0f10;">${esc(roleLabel)}</strong>. From the admin site you can manage speakers, meetings, members and photos, answer inquiries, and invite other officers.</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:26px 36px 10px 36px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" bgcolor="#c41e28" style="border-radius:10px;">
                  <a href="${esc(link)}" target="_blank" style="display:inline-block;padding:15px 34px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;line-height:20px;color:#ffffff;text-decoration:none;border-radius:10px;">Create my account &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:14px 36px 6px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#faf9f6;border:1px solid #ecebe4;border-radius:12px;">
              <tr>
                <td style="padding:16px 18px;font-size:14px;line-height:22px;color:#55555a;">
                  <strong style="color:#0f0f10;">What happens next</strong><br>
                  1. Confirm your name and choose your own password (at least 10 characters).<br>
                  2. Sign in any time at <a href="${esc(adminUrl)}" style="color:#c41e28;text-decoration:underline;">${esc(adminUrl.replace(/^https?:\/\//, ""))}</a>.
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0 0;font-size:13px;line-height:20px;color:#6b6b70;">This link works once and expires in ${days} days. If the button doesn't work, paste this address into your browser:<br><span style="word-break:break-all;color:#3a3a3e;">${esc(link)}</span></p>
          </td>
        </tr>
        <tr>
          <td style="padding:26px 36px 32px 36px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
            <div style="border-top:1px solid #ecebe4;padding-top:18px;font-size:12px;line-height:19px;color:#8a8a8f;">
              Didn't expect this? You can ignore it &mdash; the link stops working on its own.<br>
              ${esc(SITE.name)} &middot; student-run at ${esc(SITE.school.name)} &middot; ${esc(SITE.school.city)}, Missouri
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}
