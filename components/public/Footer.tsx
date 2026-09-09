import Link from "next/link";

export function PublicFooter() {
  return (
    <footer>
      <div className="wrap foot-row">
        <div className="brand">
          <span className="brand-mark cic-mark">CIC</span>
          <div className="brand-name">Chaminade Investment Club</div>
        </div>
        <div className="foot-links">
          <Link href="/meetings">Meetings</Link>
          <Link href="/speakers">Speakers</Link>
          <Link href="/get-involved">Get involved</Link>
          <Link href="/team">Team</Link>
        </div>
        <div className="note mono">© 2026 · Chaminade College Prep · St. Louis, MO</div>
      </div>
    </footer>
  );
}
