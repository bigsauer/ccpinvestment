import type { ReactNode } from "react";
import Link from "next/link";

export function Topbar({
  crumbs,
  searchPlaceholder = "Search applications, speakers, meetings…",
  actions,
}: {
  crumbs: string[];
  searchPlaceholder?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="topbar">
      <div className="crumbs">
        {crumbs.map((crumb, index) => (
          <span key={`${crumb}-${index}`}>
            {index > 0 ? <span className="sep">/</span> : null}
            <span className={index === crumbs.length - 1 ? "now" : undefined}>{crumb}</span>
          </span>
        ))}
      </div>
      <div className="search">
        <input type="search" placeholder={searchPlaceholder} />
        <span className="kbd">⌘K</span>
      </div>
      <div className="actions">
        {actions ?? (
          <>
            <Link href="/" className="btn ghost" target="_blank">
              View site
            </Link>
            <Link href="/admin/meetings" className="btn red">
              + New meeting
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
