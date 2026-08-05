"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { RoleGroup } from "@/types";

const YEARS = [
  "2025-26", "2024-25", "2023-24", "2022-23", "2021-22",
  "2020-21", "2019-20", "2018-19", "2017-18", "2016-17",
];

const ROLE_GROUPS: RoleGroup[] = ["Mentor", "Executive Body", "Game Head", "Core Committee"];

const CORE_COMMITTEE_DESIGNATIONS = ["Mentor", "Co Mentor", "Advisor", "President", "Vice President", "Graphics Head", "General Secretary", "Media Head", "Other"];
const GAME_HEAD_DESIGNATIONS = ["Head", "Co head", "Other"];

interface TeamMemberFormProps {
  initialData?: {
    id?: string;
    name: string;
    designation: string;
    roleGroup: RoleGroup;
    year: string;
    photoUrl?: string;
    successStory?: string;
    importance?: string;
    feedback?: string;
  };
  mode: "create" | "edit";
}

export default function TeamMemberForm({ initialData, mode }: TeamMemberFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [designation, setDesignation] = useState(initialData?.designation || "");
  const [roleGroup, setRoleGroup] = useState<RoleGroup>(initialData?.roleGroup || "Executive Body");
  const [year, setYear] = useState(initialData?.year || YEARS[0]);
  const [photoUrl, setPhotoUrl] = useState(initialData?.photoUrl || "");
  const [successStory, setSuccessStory] = useState(initialData?.successStory || "");
  const [importance, setImportance] = useState(initialData?.importance || "");
  const [feedback, setFeedback] = useState(initialData?.feedback || "");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const memberData = {
      name,
      designation,
      roleGroup,
      year,
      photoUrl: photoUrl || undefined,
      successStory: successStory || undefined,
      importance: importance || undefined,
      feedback: feedback || undefined,
    };

    try {
      const url = mode === "create"
        ? "/api/team"
        : `/api/team?id=${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/team");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="admin-login__error" style={{ marginBottom: "1.5rem" }}>
          {error}
        </div>
      )}

      <div className="admin-form">
        <div className="admin-card">
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--color-white)" }}>
            Member Information
          </h3>

          <div className="admin-form" style={{ gap: "1.25rem" }}>
            {/* Photo upload */}
            <div className="admin-form-group" style={{ alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Photo preview"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid rgba(30,86,255,0.3)",
                    }}
                  />
                ) : (
                  <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)",
                    border: "2px dashed rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-text-muted)",
                    fontSize: "0.8rem",
                  }}>
                    Photo
                  </div>
                )}
                <div>
                  <label className="admin-btn admin-btn--secondary admin-btn--sm" style={{ cursor: "pointer" }}>
                    {uploading ? "Uploading…" : "Upload Photo"}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} />
                  </label>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                    Recommended: square image, 300×300px
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Full Name *</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="e.g. Ali Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Year *</label>
                <select
                  className="admin-form-select"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Role Group *</label>
                <select
                  className="admin-form-select"
                  value={roleGroup}
                  onChange={(e) => {
                    const newGroup = e.target.value as RoleGroup;
                    setRoleGroup(newGroup);
                    if (newGroup === "Core Committee") setDesignation(CORE_COMMITTEE_DESIGNATIONS[0]);
                    else if (newGroup === "Game Head") setDesignation(GAME_HEAD_DESIGNATIONS[0]);
                    else setDesignation("");
                  }}
                >
                  {ROLE_GROUPS.map((rg) => (
                    <option key={rg} value={rg}>{rg}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Designation *</label>
                {roleGroup === "Core Committee" || roleGroup === "Game Head" ? (
                  <select
                    className="admin-form-select"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  >
                    {(roleGroup === "Core Committee" ? CORE_COMMITTEE_DESIGNATIONS : GAME_HEAD_DESIGNATIONS).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="admin-form-input"
                    placeholder='e.g. "President", "Cricket Head"'
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  />
                )}
                {designation === "Other" && (
                  <input
                    type="text"
                    className="admin-form-input"
                    style={{ marginTop: "0.5rem" }}
                    placeholder="Specify custom designation"
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "1.5rem", color: "var(--color-white)" }}>
            Profile Details
          </h3>

          <div className="admin-form" style={{ gap: "1.25rem" }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Success Story / Achievements</label>
              <textarea
                className="admin-form-textarea"
                placeholder="Describe their achievements, contributions, and success story during their tenure at SGS..."
                value={successStory}
                onChange={(e) => setSuccessStory(e.target.value)}
                rows={4}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Importance to SGS</label>
              <textarea
                className="admin-form-textarea"
                placeholder="Why is this person important to the society? What lasting impact did they have?"
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
                rows={3}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Feedback from SGS</label>
              <textarea
                className="admin-form-textarea"
                placeholder="Official feedback or commendation from the Sports Guild Society..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            onClick={() => router.push("/admin/team")}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            disabled={saving}
          >
            {saving
              ? mode === "create" ? "Adding…" : "Saving…"
              : mode === "create" ? "Add Member" : "Save Changes"
            }
          </button>
        </div>
      </div>
    </form>
  );
}
