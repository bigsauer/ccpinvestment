import { BrandMark } from "@/components/admin/BrandMark";
import Link from "next/link";
import { AcceptInviteForm } from "@/components/admin/AccessForms";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/guard";
import { roleLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await prisma.invitation.findUnique({ where: { tokenHash: hashToken(token) } });
  const valid = invite && !invite.acceptedAt && !invite.revokedAt && invite.expiresAt > new Date();

  if (!invite || !valid) {
    return (
      <div className="login-wrap">
        <div className="form login-card">
          <BrandMark />
          <div className="form-head">
            <div className="t">This invitation is no longer valid</div>
            <div className="s">cic / invite</div>
          </div>
          <p className="admin-note">It may have expired, been cancelled, or already been used. Ask a club administrator to send a new one.</p>
          <div className="form-foot">
            <div className="note" />
            <Link className="btn red" href="/admin/login">
              Go to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AcceptInviteForm token={token} email={invite.email} name={invite.name} roleLabel={roleLabel(invite.role)} classYear={invite.classYear ?? ""} />;
}
