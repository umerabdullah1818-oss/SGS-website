"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    verifiedRegistrations: 0,
    totalRevenue: 0,
    activeGames: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const isSuperAdmin = user?.role === "superadmin";
  const isHead = user?.role === "head";

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>{isSuperAdmin ? "Admin Dashboard" : "Game Head Dashboard"}</h1>
          <p>
            {isSuperAdmin
              ? "Welcome, Super Admin. Here's a complete overview of the SGS platform."
              : `Welcome back${user?.assignedGame ? `, ${user.assignedGame} Head` : ""}. Here's your game overview.`}
          </p>
        </div>
      </div>

      {/* ─── Stats Cards ────────────────────────────────── */}
      <div className="admin-stats">
        <div className="admin-stat admin-stat--purple">
          <div className="admin-stat__header">
            <span className="admin-stat__title">
              {isSuperAdmin ? "Total Registrations" : "My Registrations"}
            </span>
            <div className="admin-stat__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
          </div>
          <div className="admin-stat__value">{loading ? "—" : stats.totalRegistrations}</div>
        </div>

        <div className="admin-stat admin-stat--green">
          <div className="admin-stat__header">
            <span className="admin-stat__title">Verified</span>
            <div className="admin-stat__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="admin-stat__value">{loading ? "—" : stats.verifiedRegistrations}</div>
        </div>

        {isSuperAdmin && (
          <div className="admin-stat admin-stat--yellow">
            <div className="admin-stat__header">
              <span className="admin-stat__title">Total Revenue</span>
              <div className="admin-stat__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
              </div>
            </div>
            <div className="admin-stat__value">{loading ? "—" : `Rs. ${stats.totalRevenue.toLocaleString()}`}</div>
          </div>
        )}

        <div className="admin-stat admin-stat--orange">
          <div className="admin-stat__header">
            <span className="admin-stat__title">Active Games</span>
            <div className="admin-stat__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 12h4m4 0h4M6 12a6 6 0 1 0 12 0a6 6 0 0 0-12 0" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
          </div>
          <div className="admin-stat__value">{loading ? "—" : stats.activeGames}</div>
        </div>
      </div>

      {/* ─── Quick Actions ──────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>

        {/* Quick Actions */}
        <div className="admin-card">
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--color-white)" }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Link href="/admin/games/new" className="admin-btn admin-btn--secondary" style={{ justifyContent: "flex-start" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {isSuperAdmin ? "Create a new game" : "Propose a new game"}
            </Link>
            <Link href="/admin/registrations" className="admin-btn admin-btn--secondary" style={{ justifyContent: "flex-start" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              {isSuperAdmin ? "Review all registrations" : "View my game registrations"}
            </Link>
            <Link href="/admin/results/new" className="admin-btn admin-btn--secondary" style={{ justifyContent: "flex-start" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7" />
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
              </svg>
              Add tournament results
            </Link>
          </div>
        </div>

        {/* Role Info */}
        <div className="admin-card">
          <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--color-white)" }}>Your Profile</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Email</span>
              <span style={{ color: "var(--color-text)", fontWeight: 500 }}>{user?.email}</span>
            </div>
            <div style={{ borderTop: "1px solid var(--glass-border)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Role</span>
              <span className={`admin-badge ${isSuperAdmin ? "admin-badge--active" : ""}`}>
                {isSuperAdmin ? "Super Admin" : isHead ? "Game Head" : user?.role}
              </span>
            </div>
            {isHead && user?.assignedGame && (
              <>
                <div style={{ borderTop: "1px solid var(--glass-border)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Assigned Game</span>
                  <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>{user.assignedGame}</span>
                </div>
              </>
            )}
            {user?.permissions && user.permissions.length > 0 && (
              <>
                <div style={{ borderTop: "1px solid var(--glass-border)" }} />
                <div>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", display: "block", marginBottom: "0.5rem" }}>
                    Delegated Permissions
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                    {user.permissions.map((p) => (
                      <span key={p} style={{
                        fontSize: "0.75rem", padding: "0.2rem 0.5rem",
                        background: "rgba(30,86,255,0.1)", borderRadius: "6px",
                        color: "var(--color-primary)",
                      }}>
                        {p.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Superadmin-only: Platform Management */}
        {isSuperAdmin && (
          <div className="admin-card">
            <h3 style={{ fontSize: "1rem", marginBottom: "1rem", color: "var(--color-white)" }}>Platform Management</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <Link href="/admin/users" className="admin-btn admin-btn--secondary" style={{ justifyContent: "flex-start" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Manage Users & Permissions
              </Link>
              <Link href="/admin/team" className="admin-btn admin-btn--secondary" style={{ justifyContent: "flex-start" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                Manage Team Profiles
              </Link>
              <Link href="/admin/config" className="admin-btn admin-btn--secondary" style={{ justifyContent: "flex-start" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Payment Configuration
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
