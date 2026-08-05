"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

// Links always visible to everyone
const publicLinks = [
  { label: "Home", href: "/" },
  { label: "Hall of Fame", href: "/results" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Links only visible when logged in
const authLinks = [
  { label: "Our Team", href: "/team" },
  { label: "Register", href: "/register" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const isAdmin = user?.role === "superadmin" || user?.role === "head";

  const visibleLinks = user
    ? [
        ...publicLinks.slice(0, 1),
        ...authLinks,
        ...publicLinks.slice(1),
        ...(isAdmin ? [{ label: "Dashboard", href: "/admin" }] : []),
      ]
    : publicLinks;

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
      {/* Logo */}
      <Link href="/" className="navbar__logo">
        <div className="navbar__logo-icon">SGS</div>
        <div className="navbar__logo-text">
          SPORTS GUILD
          <span>Society</span>
        </div>
      </Link>

      {/* Desktop Links */}
      <ul className="navbar__links">
        {visibleLinks.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="navbar__link">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Auth Buttons */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {loading ? null : user ? (
          <>
            <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="navbar__cta"
              style={{ cursor: "pointer", border: "none", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="navbar__link" style={{ fontWeight: 600 }}>
              Login
            </Link>
            <Link href="/signup" className="navbar__cta">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
