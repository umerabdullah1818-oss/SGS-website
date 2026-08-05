"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { TeamMember } from "@/types";

const YEARS = [
  "2025-26", "2024-25", "2023-24", "2022-23", "2021-22",
  "2020-21", "2019-20", "2018-19", "2017-18", "2016-17",
];

const GROUP_COLORS: Record<string, string> = {
  "Mentor": "rgba(140, 80, 255, 0.15)",
  "Executive Body": "rgba(30, 86, 255, 0.15)",
  "Game Head": "rgba(0, 200, 100, 0.15)",
  "Core Committee": "rgba(255, 200, 0, 0.15)",
};

const GROUP_TEXT: Record<string, string> = {
  "Mentor": "#a070ff",
  "Executive Body": "#6098ff",
  "Game Head": "#00c864",
  "Core Committee": "#ffc800",
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(YEARS[0]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/team?year=${encodeURIComponent(selectedYear)}`)
      .then((r) => r.json())
      .then((d) => setMembers(d.members || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team member?")) return;
    setDeleting(id);
    try {
      await fetch(`/api/team?id=${id}`, { method: "DELETE" });
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("Failed to delete");
    }
    setDeleting(null);
  };

  // Group members by roleGroup
  const groups = ["Mentor", "Executive Body", "Game Head", "Core Committee"];
  const grouped = groups
    .map((group) => ({
      group,
      members: members.filter((m) => m.roleGroup === group),
    }))
    .filter((g) => g.members.length > 0);

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Our Team</h1>
          <p>Manage SGS team members across years</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <select
            className="admin-form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{ minWidth: "160px" }}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Link href="/admin/team/new" className="admin-btn admin-btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Member
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-muted)" }}>
          Loading…
        </div>
      ) : grouped.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 style={{ marginBottom: "0.5rem" }}>No Team Members for {selectedYear}</h3>
          <p>Click &quot;Add Member&quot; to start building this year&apos;s team.</p>
        </div>
      ) : (
        grouped.map(({ group, members: groupMembers }) => (
          <div key={group} style={{ marginBottom: "2rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
            }}>
              <span style={{
                display: "inline-block",
                padding: "0.35rem 1rem",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: 700,
                background: GROUP_COLORS[group],
                color: GROUP_TEXT[group],
                letterSpacing: "0.03em",
              }}>
                {group}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                {groupMembers.length} member{groupMembers.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}>
              {groupMembers.map((member) => (
                <div
                  key={member.id}
                  className="admin-card"
                  style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
                >
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {member.photoUrl ? (
                      <img
                        src={member.photoUrl}
                        alt={member.name}
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: `2px solid ${GROUP_TEXT[group]}`,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        background: GROUP_COLORS[group],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: GROUP_TEXT[group],
                      }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, color: "white", fontSize: "1rem" }}>
                        {member.name}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: GROUP_TEXT[group], fontWeight: 600 }}>
                        {member.designation}
                      </div>
                    </div>
                  </div>

                  {member.successStory && (
                    <p style={{
                      fontSize: "0.82rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {member.successStory}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                    <Link
                      href={`/admin/team/${member.id}/edit`}
                      className="admin-btn admin-btn--secondary admin-btn--sm"
                      style={{ flex: 1 }}
                    >
                      Edit
                    </Link>
                    <button
                      className="admin-btn admin-btn--danger admin-btn--sm"
                      onClick={() => handleDelete(member.id)}
                      disabled={deleting === member.id}
                    >
                      {deleting === member.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}
