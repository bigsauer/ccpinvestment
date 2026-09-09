"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { initials } from "@/lib/utils";

const NAV = [
  {
    section: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: "grid" },
      { href: "/admin/applications", label: "Applications", icon: "inbox", badgeKey: "apps" as const },
    ],
  },
  {
    section: "Content",
    items: [
      { href: "/admin/meetings", label: "Meetings", icon: "cal" },
      { href: "/admin/speakers", label: "Speakers", icon: "user" },
      { href: "/admin/members", label: "Members", icon: "users" },
      { href: "/admin/content", label: "Site content", icon: "file" },
    ],
  },
  {
    section: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: "gear" }],
  },
];

function Icon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6 } as const;
  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "inbox":
      return (
        <svg {...common}>
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
        </svg>
      );
    case "cal":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a7 7 0 0 1 14 0v1" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar({
  collapsed,
  openApps,
  user,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  openApps: number;
  user: { name: string; role: string; classYear?: string | null };
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();

  function toggle() {
    const next = collapsed ? "0" : "1";
    document.cookie = `admin-sidebar=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return (
    <>
      {mobileOpen ? <button type="button" className="side-backdrop" aria-label="Close menu" onClick={onCloseMobile} /> : null}
      <aside className={`side${mobileOpen ? " mobile-open" : ""}`}>
        <div className="side-head">
          <div className="side-brand">
            <div className="side-mark">CIC</div>
            <div className="nm">
              CCP Investment Club <span className="mut">— admin</span>
            </div>
          </div>
          <div className="side-mode">
            <span>Local · v1.0</span>
            <span className="dot" />
          </div>
          <button className="side-toggle" type="button" onClick={toggle} aria-label="Collapse sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </div>
        <nav className="side-nav">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="side-section">{group.section}</div>
              {group.items.map((item) => {
                const on = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={on ? "side-link on" : "side-link"}
                    data-label={item.label}
                    onClick={onCloseMobile}
                  >
                    <span className="ico">
                      <Icon name={item.icon} />
                    </span>
                    <span className="lbl">{item.label}</span>
                    {item.badgeKey === "apps" && openApps > 0 ? <span className="badge">{openApps}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="side-foot">
          <div className="side-user">
            <div className="av">{initials(user.name)}</div>
            <div className="info">
              <div className="name">{user.name}</div>
              <div className="role">
                {user.role}
                {user.classYear ? ` · '${user.classYear}` : ""}
              </div>
            </div>
            <form action={logout}>
              <button type="submit" className="more" aria-label="Sign out">
                ···
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
