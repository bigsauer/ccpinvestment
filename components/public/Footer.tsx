import Image from "next/image";
import Link from "next/link";
import { getNavLinks } from "@/lib/queries";

export async function PublicFooter() {
  const links = (await getNavLinks()).filter((link) => link.href !== "/");
  return (
    <footer>
      <div className="wrap foot-row">
        <div className="brand">
          <Image className="brand-mark" src="/brand/club-badge.png" alt="Chaminade Investment Club" width={38} height={38} />
          <div className="brand-name">Chaminade Investment Club</div>
        </div>
        <div className="foot-links">
          {links.map((link) => (
            <Link key={link.href + link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="note mono">© {new Date().getFullYear()} · Chaminade College Prep · St. Louis, MO</div>
      </div>
    </footer>
  );
}
