"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import "./admin.css";

const sidebarLinks = [
  {
    section: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Management",
    items: [
      {
        label: "Games",
        href: "/admin/games",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 12h4m4 0h4M6 12a6 6 0 1 0 12 0a6 6 0 0 0-12 0" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        ),
      },
      {
        label: "Registrations",
        href: "/admin/registrations",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        ),
      },
      {
        label: "Results",
        href: "/admin/results",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          </svg>
        ),
      },
      {
        label: "Our Team",
        href: "/admin/team",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Settings",
    items: [
      {
        label: "Payment Config",
        href: "/admin/config",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
        ),
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ],
  },
];

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't redirect on login page
  const isLoginPage = pathname === "/admin/login";

  if (loading) {
    return (
      <div className="admin-login" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          <div className="admin-login__logo" style={{ margin: "0 auto 1rem" }}>SGS</div>
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (!user && !isLoginPage) {
    router.push("/admin/login");
    return null;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
  };

  return (
    <div className="admin-layout">
      {/* Mobile toggle */}
      <button
        className="admin-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "admin-sidebar--open" : ""}`}>
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__logo">SGS</div>
          <div>
            <div className="admin-sidebar__title">
              {user?.role === "superadmin" ? "Admin Panel" : "Head Panel"}
            </div>
            <div className="admin-sidebar__subtitle">Sports Guild Society</div>
          </div>
        </div>

        <nav className="admin-sidebar__nav">
          {sidebarLinks.map((section) => {
            const items = section.items.filter(item => {
              if (item.label === "Payment Config") {
                return user?.role === "superadmin" || user?.permissions?.includes("manage_config");
              }
              if (item.label === "Users") {
                return user?.role === "superadmin" || user?.permissions?.includes("manage_users");
              }
              if (item.label === "Our Team") {
                return user?.role === "superadmin" || user?.permissions?.includes("manage_team");
              }
              return true;
            });
            
            if (items.length === 0) return null;

            return (
              <div key={section.section}>
                <div className="admin-sidebar__section-label">{section.section}</div>
                {items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <button className="admin-sidebar__logout" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">{children}</main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}
