"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/meetings", label: "Meetings" },
  { href: "/speakers", label: "Speakers" },
  { href: "/get-involved", label: "Get involved" },
  { href: "/team", label: "Team" },
];

export function PublicNav({ showNextMeeting = false }: { showNextMeeting?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="wrap nav-row">
        <Link href="/" className="brand">
          <span className="brand-mark cic-mark">CIC</span>
          <div className="brand-name">
            Chaminade Investment Club <span className="muted">— est. 2024</span>
          </div>
        </Link>
        <div className="nav-links">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "on" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="nav-cta">
          {showNextMeeting ? (
            <Link className="btn" href="/meetings">
              Next meeting
            </Link>
          ) : null}
          <Link className="btn red" href="/get-involved?tab=students">
            Apply <span className="arrow">→</span>
          </Link>
          <button
            type="button"
            className="btn mobile-nav-toggle"
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
        </div>
      </div>
      {open ? (
        <div className="mobile-nav-drawer wrap">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "on" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
