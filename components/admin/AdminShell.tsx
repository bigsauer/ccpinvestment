"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { WriteProvider } from "@/components/admin/WriteGate";

export function AdminShell({
  collapsed: initialCollapsed,
  openApps,
  pendingRequests,
  writable,
  user,
  children,
}: {
  collapsed: boolean;
  openApps: number;
  pendingRequests: number;
  writable: boolean;
  user: { name: string; role: string; classYear?: string | null; badge?: string };
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      try {
        document.cookie = `admin-sidebar=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`;
      } catch {
        /* the sidebar still works without remembering the choice */
      }
      return next;
    });
  }

  // "[" collapses or expands the sidebar, unless you are typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.key !== "[" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      toggleCollapsed();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <WriteProvider writable={writable}>
      <div className={`shell${collapsed ? " collapsed" : ""}`}>
        <Sidebar
          collapsed={collapsed}
          openApps={openApps}
          pendingRequests={pendingRequests}
          onToggleCollapsed={toggleCollapsed}
          user={user}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className="main">
          <button type="button" className="btn mobile-nav-toggle" style={{ margin: 12 }} onClick={() => setMobileOpen(true)}>
            Menu
          </button>
          {writable ? null : (
            <div className="info-note" style={{ margin: "0 20px 0" }}>
              Advisor session — view only. Changes are blocked on the server.
            </div>
          )}
          {children}
        </div>
      </div>
    </WriteProvider>
  );
}
