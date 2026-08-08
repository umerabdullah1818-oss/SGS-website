"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const isAdmin = user?.role === "admin" || user?.role === "superadmin" || user?.role === "head";

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
        <Image src="/logo.png" alt="SGS Logo" width={420} height={180} className="navbar__logo-img" />
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
            <span className="navbar__user-email">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="navbar__logout-btn"
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
        <button
          className={`navbar__menu-btn ${mobileOpen ? "active" : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`navbar__mobile-menu ${mobileOpen ? "open" : ""}`}>
        {visibleLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="navbar__link"
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {!user && (
          <Link href="/login" className="navbar__cta" onClick={() => setMobileOpen(false)}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
