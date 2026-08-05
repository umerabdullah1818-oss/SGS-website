"use client";

import type { GameFormat } from "@/types";

interface FormatBuilderProps {
  formats: GameFormat[];
  onChange: (formats: GameFormat[]) => void;
}

const defaultFormat: GameFormat = {
  formatName: "",
  fee: 0,
  rosterType: "individual",
  hasCaptain: false,
  minPlayers: 1,
  maxPlayers: 1,
};

export default function FormatBuilder({ formats, onChange }: FormatBuilderProps) {
  const addFormat = () => {
    onChange([...formats, { ...defaultFormat }]);
  };

  const removeFormat = (index: number) => {
    onChange(formats.filter((_, i) => i !== index));
  };

  const updateFormat = (index: number, field: keyof GameFormat, value: string | number | boolean) => {
    const updated = formats.map((fmt, i) => {
      if (i !== index) return fmt;
      const newFmt = { ...fmt, [field]: value };
      // Auto-adjust when switching roster type
      if (field === "rosterType" && value === "individual") {
        newFmt.minPlayers = 1;
        newFmt.maxPlayers = 1;
        newFmt.hasCaptain = false;
      }
      return newFmt;
    });
    onChange(updated);
  };

  return (
    <div className="admin-builder">
      <div className="admin-builder__header">
        <div className="admin-builder__title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Game Formats
          <span className="admin-builder__count">{formats.length}</span>
        </div>
        <button type="button" className="admin-btn admin-btn--primary admin-btn--sm" onClick={addFormat}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Format
        </button>
      </div>

      <div className="admin-builder__items">
        {formats.length === 0 && (
          <div className="admin-builder__empty">
            No formats defined yet. Add at least one format (e.g. &quot;1v1&quot;, &quot;2v2&quot;, &quot;Team&quot;).
          </div>
        )}

        {formats.map((format, index) => (
          <div key={index} className="admin-builder__item">
            <div className="admin-builder__item-header">
              <span className="admin-builder__item-number">Format #{index + 1}</span>
              <button
                type="button"
                className="admin-btn admin-btn--danger admin-btn--sm"
                onClick={() => removeFormat(index)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Remove
              </button>
            </div>

            <div className="admin-builder__item-fields">
              <div className="admin-form-group">
                <label className="admin-form-label">Format Name</label>
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder='e.g. "1v1", "Team"'
                  value={format.formatName}
                  onChange={(e) => updateFormat(index, "formatName", e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Fee (Rs.)</label>
                <input
                  type="number"
                  className="admin-form-input"
                  placeholder="0"
                  min="0"
                  value={format.fee}
                  onChange={(e) => updateFormat(index, "fee", Number(e.target.value))}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Roster Type</label>
                <select
                  className="admin-form-select"
                  value={format.rosterType}
                  onChange={(e) => updateFormat(index, "rosterType", e.target.value)}
                >
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </select>
              </div>

              {format.rosterType === "team" && (
                <>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Has Captain?</label>
                    <div
                      className={`admin-toggle ${format.hasCaptain ? "admin-toggle--active" : ""}`}
                      onClick={() => updateFormat(index, "hasCaptain", !format.hasCaptain)}
                    >
                      <div className="admin-toggle__switch" />
                      <span>{format.hasCaptain ? "Yes" : "No"}</span>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Min Players</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      min="1"
                      value={format.minPlayers}
                      onChange={(e) => updateFormat(index, "minPlayers", Number(e.target.value))}
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Max Players</label>
                    <input
                      type="number"
                      className="admin-form-input"
                      min="1"
                      value={format.maxPlayers}
                      onChange={(e) => updateFormat(index, "maxPlayers", Number(e.target.value))}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
