"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [eventsDropdownOpen, setEventsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const eventsRef = useRef<HTMLLIElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (eventsRef.current && !eventsRef.current.contains(event.target as Node)) {
        setEventsDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const isAdmin = user?.role === "admin" || user?.role === "superadmin" || user?.role === "head";

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`} id="navbar">
      {/* Logo */}
      <Link href="/" className="navbar__logo">
        <Image src="/logo.png" alt="SGS Logo" width={420} height={180} className="navbar__logo-img" />
      </Link>

      {/* Desktop Links */}
      <ul className="navbar__links">
        <li><Link href="/" className={`navbar__link ${pathname === "/" ? "active" : ""}`}>Home</Link></li>
        <li><Link href="/team" className={`navbar__link ${pathname === "/team" ? "active" : ""}`}>SGS Team</Link></li>
        
        {/* Events Dropdown */}
        <li className="navbar__dropdown-wrapper" ref={eventsRef}>
          <button 
            className={`navbar__link navbar__dropdown-btn ${(pathname === "/register" || pathname === "/tournaments") ? "active" : ""}`}
            onClick={() => setEventsDropdownOpen(!eventsDropdownOpen)}
          >
            Events
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "6px", transition: "transform 0.2s", transform: eventsDropdownOpen ? "rotate(180deg)" : "rotate(0)" }}>
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {eventsDropdownOpen && (
            <div className="navbar__dropdown-menu">
              <Link href="/register" className="navbar__dropdown-item" onClick={() => setEventsDropdownOpen(false)}>Registration</Link>
              <Link href="/tournaments" className="navbar__dropdown-item" onClick={() => setEventsDropdownOpen(false)}>Tournaments</Link>
            </div>
          )}
        </li>

        <li><Link href="/about" className={`navbar__link ${pathname === "/about" ? "active" : ""}`}>About</Link></li>
        <li><Link href="/contact" className={`navbar__link ${pathname === "/contact" ? "active" : ""}`}>Contact</Link></li>
      </ul>

      {/* Auth Buttons */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {loading ? null : user ? (
          <div className="navbar__dropdown-wrapper" ref={profileRef}>
            <button 
              className="navbar__profile-btn"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className="navbar__profile-avatar">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transition: "transform 0.2s", transform: profileDropdownOpen ? "rotate(180deg)" : "rotate(0)" }}>
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {profileDropdownOpen && (
              <div className="navbar__dropdown-menu navbar__dropdown-menu--right">
                <div className="navbar__dropdown-header">
                  <div className="navbar__dropdown-email">{user.email}</div>
                </div>
                {isAdmin && (
                  <Link href="/admin" className="navbar__dropdown-item" onClick={() => setProfileDropdownOpen(false)}>Dashboard</Link>
                )}
                <Link href="/register" className="navbar__dropdown-item" onClick={() => setProfileDropdownOpen(false)}>My Registrations</Link>
                <div className="navbar__dropdown-divider"></div>
                <button onClick={handleLogout} className="navbar__dropdown-item navbar__dropdown-item--danger">Logout</button>
              </div>
            )}
          </div>
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
        <Link href="/" className={`navbar__link ${pathname === "/" ? "active" : ""}`} onClick={() => setMobileOpen(false)}>Home</Link>
        <Link href="/team" className={`navbar__link ${pathname === "/team" ? "active" : ""}`} onClick={() => setMobileOpen(false)}>SGS Team</Link>
        
        <div className="navbar__mobile-section">
          <div className="navbar__mobile-section-title">Events</div>
          <Link href="/register" className={`navbar__link navbar__link--sub ${pathname === "/register" ? "active" : ""}`} onClick={() => setMobileOpen(false)}>Registration</Link>
          <Link href="/tournaments" className={`navbar__link navbar__link--sub ${pathname === "/tournaments" ? "active" : ""}`} onClick={() => setMobileOpen(false)}>Tournaments</Link>
        </div>

        <Link href="/about" className={`navbar__link ${pathname === "/about" ? "active" : ""}`} onClick={() => setMobileOpen(false)}>About</Link>
        <Link href="/contact" className={`navbar__link ${pathname === "/contact" ? "active" : ""}`} onClick={() => setMobileOpen(false)}>Contact</Link>
        
        {!user ? (
          <Link href="/login" className="navbar__cta" onClick={() => setMobileOpen(false)}>
            Sign In
          </Link>
        ) : (
          <div className="navbar__mobile-section">
             <div className="navbar__mobile-section-title">Account</div>
             <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>{user.email}</div>
             {isAdmin && <Link href="/admin" className="navbar__link navbar__link--sub" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
             <Link href="/register" className="navbar__link navbar__link--sub" onClick={() => setMobileOpen(false)}>My Registrations</Link>
             <button onClick={handleLogout} className="navbar__link navbar__link--sub navbar__link--danger">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
