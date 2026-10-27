"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { initials } from "@/lib/utils";

const NAV = [
  {
    section: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: "grid" },
      { href: "/admin/applications", label: "Inquiries", icon: "inbox", badgeKey: "apps" as const },
    ],
  },
  {
    section: "Content",
    items: [
      { href: "/admin/meetings", label: "Meetings", icon: "cal" },
      { href: "/admin/speakers", label: "Speakers", icon: "user" },
      { href: "/admin/members", label: "Members", icon: "users" },
      { href: "/admin/pages", label: "Pages", icon: "layers" },
      { href: "/admin/navigation", label: "Navigation", icon: "menu" },
      { href: "/admin/content", label: "Page wording", icon: "file" },
      { href: "/admin/images", label: "Site images", icon: "image" },
    ],
  },
  {
    section: "Team & system",
    items: [
      { href: "/admin/officers", label: "Officers", icon: "shield", badgeKey: "requests" as const },
      { href: "/admin/activity", label: "Activity log", icon: "clock" },
      { href: "/admin/settings", label: "Settings", icon: "gear" },
      { href: "/admin/help", label: "Help & handoff", icon: "help" },
    ],
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
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.6" />
          <path d="m21 16-5-5-8 8" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="m12 3 9 5-9 5-9-5z" />
          <path d="m3 13 9 5 9-5" />
        </svg>
      );
    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      );
    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4M12 16.5h.01" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
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
  onToggleCollapsed,
  openApps,
  pendingRequests,
  user,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  openApps: number;
  pendingRequests: number;
  user: { name: string; role: string; classYear?: string | null; badge?: string };
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen ? <button type="button" className="side-backdrop" aria-label="Close menu" onClick={onCloseMobile} /> : null}
      <aside className={`side${mobileOpen ? " mobile-open" : ""}`}>
        <div className="side-head">
          <div className="side-brand">
            <Image className="side-mark" src="/brand/club-badge.png" alt="Chaminade Investment Club" width={30} height={30} />
            <div className="nm">
              CCP Investment Club <span className="mut">— admin</span>
            </div>
          </div>
          <div className="side-mode">
            <span>Officer admin</span>
            <span className="dot" />
          </div>
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
                    {item.badgeKey === "requests" && pendingRequests > 0 ? <span className="badge">{pendingRequests}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <button
          type="button"
          className="side-collapse"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar  ( [ )" : "Collapse sidebar  ( [ )"}
          aria-expanded={!collapsed}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className="lbl">Collapse menu</span>
        </button>
        <div className="side-foot">
          <div className="side-user">
            <div className="av">{initials(user.name)}</div>
            <div className="info">
              <div className="name">{user.name}</div>
              <div className="role">
                {user.role}
                {user.classYear ? ` · '${user.classYear}` : ""}
              </div>
              {user.badge ? <div className="badge-super">{user.badge}</div> : null}
            </div>
            <Link href="/admin/account" className="more" aria-label="My account" title="My account" onClick={onCloseMobile}>
              ⚙
            </Link>
            <form action={logout}>
              <button type="submit" className="more" aria-label="Sign out" title="Sign out">
                ⎋
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
