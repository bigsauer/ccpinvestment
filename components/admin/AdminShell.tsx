"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { WriteProvider } from "@/components/admin/WriteGate";

export function AdminShell({
  collapsed,
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
  user: { name: string; role: string; classYear?: string | null };
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <WriteProvider writable={writable}>
      <div className={`shell${collapsed ? " collapsed" : ""}`}>
        <Sidebar
          collapsed={collapsed}
          openApps={openApps}
          pendingRequests={pendingRequests}
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
