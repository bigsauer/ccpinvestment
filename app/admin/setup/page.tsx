import { BrandMark } from "@/components/admin/BrandMark";
import Link from "next/link";
import { SetupForm } from "@/components/admin/AccessForms";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const enabled = Boolean(process.env.ADMIN_SETUP_TOKEN?.trim());
  const hasOfficers = (await prisma.officer.count()) > 0;

  if (hasOfficers || !enabled) {
    return (
      <div className="login-wrap">
        <div className="form login-card">
          <BrandMark />
          <div className="form-head">
            <div className="t">{hasOfficers ? "Setup is finished" : "Setup is turned off"}</div>
            <div className="s">cic / setup</div>
          </div>
          <p className="admin-note">
            {hasOfficers
              ? "An admin account already exists. Sign in, or ask a super admin for an invitation."
              : "To create the first admin, add an ADMIN_SETUP_TOKEN setting to the server, then reload this page."}
          </p>
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
  return <SetupForm />;
}
