"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { NavLink } from "@/lib/nav";

export function NavClient({ links, showNextMeeting = false }: { links: NavLink[]; showNextMeeting?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // While open: Escape closes, and the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <nav className="nav">
      <div className="wrap nav-row">
        <Link href="/" className="brand">
          <Image
            className="brand-mark"
            src="/brand/club-badge.png"
            alt="Chaminade Investment Club"
            width={38}
            height={38}
            priority
          />
          <div className="brand-name">
            Chaminade Investment Club <span className="muted">— est. 2024</span>
          </div>
        </Link>
        <div className="nav-links">
          {links.map((link) => (
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
            <Link className="btn nav-next" href="/meetings">
              Next meeting
            </Link>
          ) : null}
          <Link className="btn red" href="/get-involved?tab=students">
            Apply <span className="arrow">→</span>
          </Link>
          <button
            type="button"
            className={open ? "nav-burger is-open" : "nav-burger"}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div id="mobile-nav" className={open ? "mobile-nav open" : "mobile-nav"}>
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />
        <div className="mobile-nav-panel">
          <ul className="mobile-nav-links">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={active ? "on" : undefined}
                    aria-current={active ? "page" : undefined}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpen(false)}
                  >
                    <span className="lbl">
                      {active ? <i className="dot" /> : null}
                      {link.label}
                    </span>
                    <span className="chev" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mobile-nav-cta">
            <Link
              className="btn red"
              href="/get-involved?tab=students"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
            >
              Apply to join <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
