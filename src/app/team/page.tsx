"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import type { TeamMember } from "@/types";

const YEARS = [
  "2025-26", "2024-25", "2023-24", "2022-23", "2021-22",
  "2020-21", "2019-20", "2018-19", "2017-18", "2016-17",
];

const GROUP_COLORS: Record<string, string> = {
  "Mentor": "#a070ff",
  "Executive Body": "#6098ff",
  "Game Head": "#00c864",
  "Core Committee": "#ffc800",
};

const GROUP_GRADIENTS: Record<string, string> = {
  "Mentor": "linear-gradient(135deg, rgba(140,80,255,0.2), rgba(140,80,255,0.05))",
  "Executive Body": "linear-gradient(135deg, rgba(30,86,255,0.2), rgba(30,86,255,0.05))",
  "Game Head": "linear-gradient(135deg, rgba(0,200,100,0.2), rgba(0,200,100,0.05))",
  "Core Committee": "linear-gradient(135deg, rgba(255,200,0,0.2), rgba(255,200,0,0.05))",
};

export default function PublicTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(YEARS[0]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setExpandedId(null);
    fetch(`/api/team?year=${encodeURIComponent(selectedYear)}`)
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  const groups = ["Mentor", "Executive Body", "Game Head", "Core Committee"];
  const grouped = groups
    .map((group) => ({
      group,
      members: members.filter((m) => m.roleGroup === group),
    }))
    .filter((g) => g.members.length > 0);

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

          {/* Year Selector */}
          <div className="team-year-selector">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`team-year-btn ${selectedYear === y ? "team-year-btn--active" : ""}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-muted)" }}>
              <div style={{
                width: "48px", height: "48px", border: "3px solid rgba(255,255,255,0.1)",
                borderTopColor: "var(--color-primary)", borderRadius: "50%",
                animation: "spin 0.8s linear infinite", margin: "0 auto 1rem",
              }} />
              Loading team...
            </div>
          ) : grouped.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "4rem 2rem",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <p style={{ fontSize: "1.1rem", color: "var(--color-text-muted)" }}>
                No team data available for {selectedYear} yet.
              </p>
            </div>
          ) : (
            grouped.map(({ group, members: groupMembers }) => (
              <div key={group} style={{ marginBottom: "3.5rem" }}>
                {/* Group Header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}>
                  <div style={{
                    width: "4px",
                    height: "28px",
                    borderRadius: "2px",
                    background: GROUP_COLORS[group],
                  }} />
                  <h2 style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.5rem",
                    color: "white",
                    letterSpacing: "-0.01em",
                  }}>
                    {group}
                  </h2>
                  <span style={{
                    fontSize: "0.8rem",
                    color: GROUP_COLORS[group],
                    fontWeight: 600,
                    background: `${GROUP_COLORS[group]}22`,
                    padding: "0.2rem 0.75rem",
                    borderRadius: "20px",
                  }}>
                    {groupMembers.length}
                  </span>
                </div>

                {/* Cards Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "1.5rem",
                }}>
                  {groupMembers.map((member) => {
                    const isExpanded = expandedId === member.id;
                    return (
                      <div
                        key={member.id}
                        onClick={() => setExpandedId(isExpanded ? null : member.id)}
                        className="glass-card"
                        style={{
                          background: isExpanded ? GROUP_GRADIENTS[group] : "var(--color-glass-bg)",
                          border: `1px solid ${isExpanded ? GROUP_COLORS[group] + "66" : "var(--color-glass-border)"}`,
                          padding: "2rem",
                          boxShadow: isExpanded ? `0 10px 30px ${GROUP_COLORS[group]}1a` : "none",
                        }}
                      >
                        {/* Top part */}
                        <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", marginBottom: isExpanded ? "1.25rem" : 0 }}>
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              style={{
                                width: 64,
                                height: 64,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: `3px solid ${GROUP_COLORS[group]}`,
                                boxShadow: `0 0 15px ${GROUP_COLORS[group]}40`,
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div style={{
                              width: 64,
                              height: 64,
                              borderRadius: "50%",
                              background: `${GROUP_COLORS[group]}15`,
                              border: `2px solid ${GROUP_COLORS[group]}44`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                              fontWeight: 800,
                              color: GROUP_COLORS[group],
                              flexShrink: 0,
                              boxShadow: `0 0 15px ${GROUP_COLORS[group]}15`,
                            }}>
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: "white", fontSize: "1.1rem" }}>
                              {member.name}
                            </div>
                            <div style={{
                              fontSize: "0.85rem",
                              color: GROUP_COLORS[group],
                              fontWeight: 600,
                              marginTop: "0.2rem",
                              letterSpacing: "0.02em",
                            }}>
                              {member.designation}
                            </div>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div style={{
                            borderTop: `1px solid ${GROUP_COLORS[group]}25`,
                            paddingTop: "1.25rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.25rem",
                            animation: "fadeIn 0.3s ease",
                          }}>
                            {member.successStory && (
                              <div>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: GROUP_COLORS[group], marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                  Success Story
                                </div>
                                <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.65 }}>
                                  {member.successStory}
                                </p>
                              </div>
                            )}
                            {member.importance && (
                              <div>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: GROUP_COLORS[group], marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                  Importance to SGS
                                </div>
                                <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.65 }}>
                                  {member.importance}
                                </p>
                              </div>
                            )}
                            {member.feedback && (
                              <div style={{
                                background: "rgba(255,255,255,0.02)",
                                borderRadius: "12px",
                                padding: "1.25rem",
                                borderLeft: `4px solid ${GROUP_COLORS[group]}`,
                                border: `1px solid ${GROUP_COLORS[group]}15`,
                                borderLeftWidth: "4px",
                              }}>
                                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: GROUP_COLORS[group], marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                  SGS Feedback
                                </div>
                                <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.65, fontStyle: "italic" }}>
                                  &ldquo;{member.feedback}&rdquo;
                                </p>
                              </div>
                            )}
                            {!member.successStory && !member.importance && !member.feedback && (
                              <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                                No additional details available.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Click hint */}
                        {!isExpanded && (member.successStory || member.importance || member.feedback) && (
                          <div style={{
                            marginTop: "1rem",
                            fontSize: "0.75rem",
                            color: "var(--color-text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            transition: "color 0.2s ease",
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                            Click to view full profile
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
