import type { GameFormat } from "@/types";

interface FormatSelectorProps {
  formats: GameFormat[];
  selectedFormatName: string | null;
  onSelect: (formatName: string) => void;
}

export default function FormatSelector({ formats, selectedFormatName, onSelect }: FormatSelectorProps) {
  return (
    <div className="format-grid">
      {formats.map((format) => {
        const isSelected = selectedFormatName === format.formatName;
        
        return (
          <div
            key={format.formatName}
            className={`format-card ${isSelected ? "format-card--selected" : ""}`}
            onClick={() => onSelect(format.formatName)}
          >
            <div className="format-card__name">{format.formatName}</div>
            <div className="format-card__fee">Rs. {format.fee}</div>
            <div className="format-card__details">
              {format.rosterType === "individual" ? (
                "Individual Event"
              ) : (
                `Team: ${format.minPlayers}${format.maxPlayers > format.minPlayers ? `–${format.maxPlayers}` : ""} players`
              )}
            </div>
            
            {isSelected && (
              <div style={{
                marginTop: "1rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                background: "var(--color-primary)",
                color: "white",
                padding: "0.25rem 0.75rem",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 600
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Selected
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
