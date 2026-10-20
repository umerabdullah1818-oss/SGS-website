"use client";

import { useEffect, useState } from "react";
import type { TeamMember, RoleGroup } from "@/types";

const CATEGORIES: RoleGroup[] = ["Core Committee", "Game Heads", "Co-Heads"];

const CATEGORY_COLORS: Record<RoleGroup, string> = {
  "Core Committee": "rgba(255, 200, 0, 0.15)",
  "Game Heads": "rgba(0, 200, 100, 0.15)",
  "Co-Heads": "rgba(140, 80, 255, 0.15)",
};

const CATEGORY_TEXT_COLORS: Record<RoleGroup, string> = {
  "Core Committee": "#d4a017",
  "Game Heads": "#009e4f",
  "Co-Heads": "#8a2be2",
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [showYearModal, setShowYearModal] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberCategory, setMemberCategory] = useState<RoleGroup>("Core Committee");
  const [memberName, setMemberName] = useState("");
  const [memberDesignation, setMemberDesignation] = useState("");
  const [memberBatch, setMemberBatch] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Initial load
  useEffect(() => {
    fetchTeamData();
  }, []);

  // Load members when selected year changes
  useEffect(() => {
    if (!selectedYear) return;
    setLoading(true);
    fetch(`/api/team?year=${encodeURIComponent(selectedYear)}`)
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members || []);
        if (d.years) setYears(d.years);
      })
      .catch(() => setError("Failed to load members"))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  const fetchTeamData = (targetYear?: string) => {
    setLoading(true);
    const url = targetYear ? `/api/team?year=${encodeURIComponent(targetYear)}` : "/api/team";
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setMembers(d.members || []);
        if (d.years) setYears(d.years);
        if (d.selectedYear) setSelectedYear(d.selectedYear);
      })
      .catch(() => setError("Failed to fetch team data"))
      .finally(() => setLoading(false));
  };

  const handleAddYear = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = newYearInput.trim();
    if (!formatted) return;

    // Simple format check (e.g. 2026-27 or similar)
    if (!/^\d{4}-\d{2}$/.test(formatted)) {
      alert("Please enter year in format 'YYYY-YY' (e.g., 2026-27)");
      return;
    }

    if (years.includes(formatted)) {
      alert("This year already exists!");
      return;
    }

    const updatedYears = [formatted, ...years].sort((a, b) => b.localeCompare(a));
    setYears(updatedYears);
    setSelectedYear(formatted);
    setMembers([]);
    setNewYearInput("");
    setShowYearModal(false);
  };

  const handleOpenAddMember = (category: RoleGroup) => {
    setEditingMember(null);
    setMemberCategory(category);
    setMemberName("");
    setMemberDesignation("");
    setMemberBatch("");
    setPhotoUrl("");
    setError(null);
    setShowMemberModal(true);
  };

  const handleOpenEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setMemberCategory(member.roleGroup);
    setMemberName(member.name);
    setMemberDesignation(member.designation);
    setMemberBatch(member.batch);
    setPhotoUrl(member.photoUrl || "");
    setError(null);
    setShowMemberModal(true);
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("Failed to delete member");
    } finally {
      setDeleting(null);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setPhotoUrl(data.url);
    } catch {
      setError("Failed to upload photo");
    }
    setUploading(false);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: memberName.trim(),
      designation: memberDesignation.trim(),
      batch: memberBatch.trim(),
      roleGroup: memberCategory,
      year: selectedYear,
      photoUrl: photoUrl || undefined,
    };

    try {
      const url = editingMember ? `/api/team?id=${editingMember.id}` : "/api/team";
      const method = editingMember ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
      }

      // Reload team data for current year to sync with server
      fetchTeamData(selectedYear);
      setShowMemberModal(false);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1>SGS Team Management</h1>
          <p>Manage society committee, game heads, and co-heads year-wise</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {years.length > 0 && (
            <select
              className="admin-form-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ minWidth: "160px" }}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowYearModal(true)}
            className="admin-btn admin-btn--secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Team Year
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--color-text-muted)" }}>
          Loading team data…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {CATEGORIES.map((category) => {
            const categoryMembers = members.filter((m) => m.roleGroup === category);
            return (
              <div key={category} className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{
                      padding: "0.35rem 1rem",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      background: CATEGORY_COLORS[category],
                      color: CATEGORY_TEXT_COLORS[category],
                      letterSpacing: "0.03em",
                    }}>
                      {category}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                      ({categoryMembers.length} member{categoryMembers.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenAddMember(category)}
                    className="admin-btn admin-btn--primary admin-btn--sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Member
                  </button>
                </div>

                {categoryMembers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-text-muted)", fontStyle: "italic", fontSize: "0.9rem" }}>
                    No members added to this category yet for {selectedYear}.
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "3.5rem 1.25rem",
                  }}>
                    {categoryMembers.map((member) => (
                      <div
                        key={member.id}
                        style={{
                          background: "rgba(0, 0, 0, 0.02)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "var(--radius-lg)",
                          padding: "0.85rem",
                          position: "relative",
                          overflow: "visible",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          paddingBottom: "1rem",
                        }}
                      >
                        <div style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: 0,
                          height: "4px",
                          background: CATEGORY_TEXT_COLORS[category],
                        }} />
                        
                        {/* Photo Wrapper */}
                        <div style={{
                          width: "100%",
                          aspectRatio: "1 / 1.1",
                          borderRadius: "var(--radius-md)",
                          overflow: "hidden",
                          position: "relative",
                          background: "rgba(0, 0, 0, 0.03)",
                          border: "1px solid rgba(0, 0, 0, 0.04)",
                        }}>
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={member.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "2.5rem",
                              fontWeight: 800,
                              color: CATEGORY_TEXT_COLORS[category],
                              background: CATEGORY_COLORS[category],
                            }}>
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Info Box */}
                        <div style={{
                          width: "90%",
                          background: "var(--glass-bg)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "var(--radius-md)",
                          padding: "1rem 0.5rem",
                          textAlign: "center",
                          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
                          marginTop: "-2.25rem",
                          position: "relative",
                          zIndex: 2,
                        }}>
                          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--color-text)", marginBottom: "0.15rem", textTransform: "uppercase", letterSpacing: "0.03em", lineHeight: "1.3" }}>
                            {member.name}
                          </h3>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 600, marginBottom: "0.25rem" }}>
                            Batch {member.batch}
                          </div>
                          <div style={{ fontSize: "0.82rem", fontWeight: 700, fontStyle: "italic", color: CATEGORY_TEXT_COLORS[category], lineHeight: "1.4" }}>
                            {member.designation}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "0.5rem", width: "90%", marginTop: "1rem", zIndex: 3 }}>
                          <button
                            onClick={() => handleOpenEditMember(member)}
                            className="admin-btn admin-btn--secondary admin-btn--sm"
                            style={{ flex: 1 }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="admin-btn admin-btn--danger admin-btn--sm"
                            disabled={deleting === member.id}
                            style={{ flex: 1 }}
                          >
                            {deleting === member.id ? "…" : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Year Modal */}
      {showYearModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div className="admin-card" style={{ width: "100%", maxWidth: "400px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 800, marginBottom: "1.25rem" }}>
              Add Team Year
            </h2>
            <form onSubmit={handleAddYear} className="admin-form">
              <div className="admin-form-group">
                <label className="admin-form-label">Team Year *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. 2026-27"
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(e.target.value)}
                  required
                  autoFocus
                />
                <span className="admin-form-hint">Must be formatted as YYYY-YY (e.g. 2026-27)</span>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={() => {
                    setNewYearInput("");
                    setShowYearModal(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary">
                  Create Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div className="admin-card" style={{ width: "100%", maxWidth: "480px" }}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", fontWeight: 800, marginBottom: "1.25rem" }}>
              {editingMember ? "Edit Member" : `Add Member to ${memberCategory}`}
            </h2>
            {error && (
              <div className="admin-login__error" style={{ marginBottom: "1rem" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSaveMember} className="admin-form">
              {/* Photo Upload Section */}
              <div className="admin-form-group" style={{ marginBottom: "0.5rem" }}>
                <label className="admin-form-label">Profile Photo</label>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Photo preview"
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid rgba(138,43,226,0.3)",
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.05)",
                      border: "2px dashed rgba(0,0,0,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text-muted)",
                      fontSize: "0.8rem",
                    }}>
                      No Photo
                    </div>
                  )}
                  <div>
                    <label className="admin-btn admin-btn--secondary admin-btn--sm" style={{ cursor: "pointer" }}>
                      {uploading ? "Uploading…" : "Upload Photo"}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
                    </label>
                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl("")}
                        className="admin-btn admin-btn--danger admin-btn--sm"
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Full Name *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Bilal Khan"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Designation *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder='e.g. "President", "Cricket Head", "Media Co-Head"'
                  value={memberDesignation}
                  onChange={(e) => setMemberDesignation(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Batch *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. 2022"
                  value={memberBatch}
                  onChange={(e) => setMemberBatch(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  disabled={saving}
                  onClick={() => setShowMemberModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                  {saving ? "Saving…" : editingMember ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
