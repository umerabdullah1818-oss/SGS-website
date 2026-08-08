"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Logo & Description */}
          <div className="footer__brand">
            <Link href="/" className="footer__logo">
              <div className="footer__logo-icon">SGS</div>
              <div className="footer__logo-text">
                SPORTS GUILD
                <span>Society</span>
              </div>
            </Link>
            <p className="footer__desc">
              Fostering sportsmanship, brotherhood, and excellence at FAST NUCES Chiniot-Faisalabad Campus. Pop Up. Step In. Play.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer__links-section">
            <h4 className="footer__title">Navigation</h4>
            <ul className="footer__links">
              <li><Link href="/" className="footer__link">Home</Link></li>
              <li><Link href="/about" className="footer__link">About Us</Link></li>
              <li><Link href="/team" className="footer__link">Our Team</Link></li>
              <li><Link href="/results" className="footer__link">Hall of Fame</Link></li>
              <li><Link href="/register" className="footer__link">Register</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer__contact-section">
            <h4 className="footer__title">Contact Us</h4>
            <ul className="footer__contact-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href="mailto:sgs@cfd.nu.edu.pk">sgs@cfd.nu.edu.pk</a>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>FAST NUCES, CFD Campus</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 Sports Guild Society. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
