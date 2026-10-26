import Image from "next/image";

/** Club logo and name at the top of the sign-in, setup, invitation and sign-up cards. */
export function BrandMark() {
  return (
    <div className="login-brand">
      <Image src="/brand/club-badge.png" alt="" width={52} height={52} priority />
      <div>
        <div className="n">Chaminade Investment Club</div>
        <div className="s">Officer admin</div>
      </div>
    </div>
  );
}
