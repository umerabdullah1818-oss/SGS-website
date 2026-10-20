"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import type { TeamMember, RoleGroup } from "@/types";

const CATEGORIES: RoleGroup[] = ["Core Committee", "Game Heads", "Co-Heads"];

const CATEGORY_COLORS: Record<RoleGroup, string> = {
  "Core Committee": "#ffc800",
  "Game Heads": "#00c864",
  "Co-Heads": "#8a2be2",
};

export default function PublicTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch team members based on selected year (or empty for initial load)
  useEffect(() => {
    setLoading(true);
    const url = selectedYear ? `/api/team?year=${encodeURIComponent(selectedYear)}` : "/api/team";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members || []);
        if (d.years) setYears(d.years);
        if (d.selectedYear && !selectedYear) {
          setSelectedYear(d.selectedYear);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedYear]);

  // Group active members by category
  const grouped = CATEGORIES.map((category) => ({
    category,
    members: members.filter((m) => m.roleGroup === category),
  })).filter((g) => g.members.length > 0);

  return (
    <>
      <Navbar />
      <div className="public-page-layout">
        {/* Hero Header */}
        <div className="public-page-header">
          <h1 className="public-page-title">
            Our <span>Team</span>
          </h1>
          <p className="public-page-subtitle">
            The passionate individuals who make the Sports Guild Society thrive. Meet our team across the years.
          </p>

          {/* Year Dropdown Selector */}
          {years.length > 0 && (
            <div className="select-container">
              <select
                className="custom-dropdown"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    SGS Team {y}
                  </option>
                ))}
              </select>
              <div className="select-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "6rem", color: "var(--color-text-muted)" }}>
              <div className="loading-spinner" />
              <p style={{ marginTop: "1rem" }}>Loading team members...</p>
            </div>
          ) : grouped.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "var(--color-glass-bg)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-glass-border)",
            }}>
              <p style={{ fontSize: "1.1rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                No team data available for {selectedYear} yet.
              </p>
            </div>
          ) : (
            grouped.map(({ category, members: categoryMembers }) => (
              <div key={category} style={{ marginBottom: "5rem" }}>
                {/* Section Header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "2.5rem",
                }}>
                  <div style={{
                    width: "4px",
                    height: "28px",
                    borderRadius: "2px",
                    background: CATEGORY_COLORS[category],
                  }} />
                  <h2 style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.6rem",
                    color: "var(--color-text)",
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                  }}>
                    {category}
                  </h2>
                  <span style={{
                    fontSize: "0.8rem",
                    color: CATEGORY_COLORS[category],
                    fontWeight: 700,
                    background: `${CATEGORY_COLORS[category]}1a`,
                    padding: "0.25rem 0.85rem",
                    borderRadius: "20px",
                  }}>
                    {categoryMembers.length}
                  </span>
                </div>

                {/* Cards Grid: 4 columns on desktop, responsive below */}
                <div className="members-grid">
                  {categoryMembers.map((member) => (
                    <div key={member.id} className="member-card">
                      <div className="category-accent-bar" style={{ background: CATEGORY_COLORS[category] }} />
                      
                      {/* Photo Container */}
                      <div className="photo-wrapper">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} className="member-photo" />
                        ) : (
                          <div className="member-photo-placeholder" style={{ background: `${CATEGORY_COLORS[category]}15`, color: CATEGORY_COLORS[category] }}>
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info Badge Card Overlay */}
                      <div className="info-box">
                        <h3 className="member-name">{member.name}</h3>
                        <p className="member-batch">Batch {member.batch}</p>
                        <p className="member-designation" style={{ color: CATEGORY_COLORS[category] }}>
                          {member.designation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />

      {/* Styled JSX for Responsive Layout and Animations */}
      <style jsx>{`
        .select-container {
          position: relative;
          min-width: 220px;
          display: inline-block;
          margin-top: 2rem;
        }

        .custom-dropdown {
          width: 100%;
          padding: 0.85rem 3rem 0.85rem 1.5rem;
          background: var(--color-glass-bg);
          border: 1px solid var(--color-glass-border);
          border-radius: 50px;
          color: var(--color-text);
          font-family: var(--font-ui);
          font-size: 0.95rem;
          font-weight: 700;
          appearance: none;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
          transition: all 0.3s var(--transition-smooth);
          outline: none;
        }

        .custom-dropdown:hover {
          border-color: rgba(138, 43, 226, 0.3);
          box-shadow: 0 8px 25px rgba(138, 43, 226, 0.08);
          transform: translateY(-1px);
        }

        .custom-dropdown:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(138, 43, 226, 0.15);
        }

        .select-arrow {
          position: absolute;
          right: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--color-text-muted);
          display: flex;
          align-items: center;
        }

        .members-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 3.5rem 1.5rem;
        }

        .member-card {
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--color-glass-border);
          border-radius: var(--radius-lg);
          padding: 0.85rem;
          position: relative;
          overflow: visible;
          transition: all 0.3s var(--transition-smooth);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-bottom: 1rem;
        }

        .member-card:hover {
          transform: translateY(-4px);
          border-color: rgba(138, 43, 226, 0.2);
          box-shadow: 0 12px 30px rgba(138, 43, 226, 0.08);
        }

        .category-accent-bar {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 4px;
        }

        .photo-wrapper {
          width: 100%;
          aspect-ratio: 1 / 1.1;
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .member-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s var(--transition-smooth);
        }

        .member-card:hover .member-photo {
          transform: scale(1.03);
        }

        .member-photo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 800;
          font-family: var(--font-heading);
        }

        .info-box {
          width: 90%;
          background: var(--color-glass-bg);
          border: 1px solid var(--color-glass-border);
          border-radius: var(--radius-md);
          padding: 1rem 0.5rem;
          text-align: center;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
          margin-top: -2.25rem;
          position: relative;
          z-index: 2;
          transition: all 0.3s var(--transition-smooth);
        }

        .member-card:hover .info-box {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(138, 43, 226, 0.12);
          border-color: rgba(138, 43, 226, 0.25);
        }

        .member-name {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 800;
          color: var(--color-text);
          margin-bottom: 0.15rem;
          line-height: 1.3;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .member-batch {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .member-designation {
          font-size: 0.82rem;
          font-weight: 700;
          font-style: italic;
          line-height: 1.4;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .members-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .members-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 3rem 1.25rem;
          }
        }

        @media (max-width: 480px) {
          .members-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
