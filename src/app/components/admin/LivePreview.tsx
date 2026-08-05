"use client";

import type { GameFormat, ExtraField } from "@/types";

interface LivePreviewProps {
  name: string;
  category: string;
  venue: string;
  description: string;
  eventDate: string;
  eventHeadName: string;
  eventHeadPhone: string;
  eventCoHeadName: string;
  eventCoHeadPhone: string;
  formats: GameFormat[];
  extraFields: ExtraField[];
  rules: string[];
}

export default function LivePreview({
  name,
  category,
  venue,
  description,
  eventDate,
  eventHeadName,
  eventHeadPhone,
  eventCoHeadName,
  eventCoHeadPhone,
  formats,
  extraFields,
  rules,
}: LivePreviewProps) {
  const feeRange =
    formats.length > 0
      ? formats.length === 1
        ? `Rs. ${formats[0].fee}`
        : `Rs. ${Math.min(...formats.map((f) => f.fee))} – ${Math.max(...formats.map((f) => f.fee))}`
      : "—";

  return (
    <div className="admin-preview">
      <div className="admin-preview__header">
        <span>Live Preview — How Students See It</span>
      </div>
      <div className="admin-preview__body">
        {/* Game Card Preview */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.25rem",
                  color: "var(--color-white)",
                  marginBottom: "0.25rem",
                }}
              >
                {name || "Game Name"}
              </h3>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {category && (
                  <span className="admin-badge admin-badge--active" style={{ fontSize: "0.68rem" }}>
                    {category}
                  </span>
                )}
                {venue && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--color-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    📍 {venue}
                  </span>
                )}
                {eventDate && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--color-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    📅 {new Date(eventDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--color-primary-light)",
              }}
            >
              {feeRange}
            </div>
          </div>

          {description && (
            <p style={{ fontSize: "0.82rem", color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: "0.75rem" }}>
              {description}
            </p>
          )}

          {(eventHeadName || eventCoHeadName) && (
            <div style={{ marginBottom: "1rem", background: "rgba(255,255,255,0.05)", padding: "0.75rem", borderRadius: "8px" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-primary-light)", marginBottom: "0.35rem", textTransform: "uppercase" }}>
                Event Contacts
              </div>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {eventHeadName && (
                  <div style={{ fontSize: "0.82rem", color: "var(--color-text)" }}>
                    <strong>Head:</strong> {eventHeadName} <span style={{ color: "var(--color-text-muted)" }}>({eventHeadPhone || "No phone"})</span>
                  </div>
                )}
                {eventCoHeadName && (
                  <div style={{ fontSize: "0.82rem", color: "var(--color-text)" }}>
                    <strong>Co-Head:</strong> {eventCoHeadName} <span style={{ color: "var(--color-text-muted)" }}>({eventCoHeadPhone || "No phone"})</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rules preview */}
          {rules.length > 0 && (
            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Rules
              </div>
              <ul style={{ paddingLeft: "1rem", listStyle: "disc" }}>
                {rules.filter(r => r.trim()).map((rule, i) => (
                  <li key={i} style={{ fontSize: "0.78rem", color: "var(--color-text)", marginBottom: "0.2rem" }}>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Format Cards Preview */}
        {formats.length > 1 && (
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Choose Format
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(formats.length, 3)}, 1fr)`, gap: "0.5rem" }}>
              {formats.map((fmt, i) => (
                <div
                  key={i}
                  style={{
                    padding: "0.75rem",
                    background: i === 0 ? "rgba(30,86,255,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${i === 0 ? "var(--color-primary)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "8px",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--color-white)", marginBottom: "0.15rem" }}>
                    {fmt.formatName || "—"}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-primary-light)" }}>Rs. {fmt.fee}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                    {fmt.rosterType === "individual" ? "Individual" : `${fmt.minPlayers}–${fmt.maxPlayers} players`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Roster preview */}
        {formats.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {formats[0].rosterType === "team" ? "Team Registration" : "Player Details"}
            </div>
            {formats[0].rosterType === "team" && (
              <div className="admin-form-group" style={{ marginBottom: "0.5rem" }}>
                <input type="text" className="admin-form-input" placeholder="Team Name" disabled style={{ opacity: 0.5 }} />
              </div>
            )}
            {formats[0].hasCaptain && (
              <div style={{ fontSize: "0.72rem", color: "var(--color-primary-light)", fontWeight: 600, marginBottom: "0.35rem" }}>
                Captain Details
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <input type="text" className="admin-form-input" placeholder="Name" disabled style={{ opacity: 0.5 }} />
              <input type="text" className="admin-form-input" placeholder="Roll Number" disabled style={{ opacity: 0.5 }} />
            </div>
          </div>
        )}

        {/* Extra fields preview */}
        {extraFields.length > 0 && (
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Additional Questions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {extraFields.map((field, i) => (
                <div key={i} className="admin-form-group">
                  <label className="admin-form-label" style={{ fontSize: "0.75rem" }}>
                    {field.label || "Question"}{field.required && " *"}
                  </label>
                  {field.fieldType === "text" && (
                    <input type="text" className="admin-form-input" placeholder={field.label} disabled style={{ opacity: 0.5 }} />
                  )}
                  {field.fieldType === "number" && (
                    <input type="number" className="admin-form-input" placeholder="0" disabled style={{ opacity: 0.5 }} />
                  )}
                  {field.fieldType === "select" && (
                    <select className="admin-form-select" disabled style={{ opacity: 0.5 }}>
                      <option>Select {field.label}...</option>
                      {(field.options || []).map((opt, j) => (
                        <option key={j}>{opt}</option>
                      ))}
                    </select>
                  )}
                  {field.fieldType === "radio" && (
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      {(field.options || []).map((opt, j) => (
                        <label key={j} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.82rem", opacity: 0.6 }}>
                          <input type="radio" name={`preview-${i}`} disabled />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
