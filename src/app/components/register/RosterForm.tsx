import type { GameFormat, Player, Captain } from "@/types";

interface RosterFormProps {
  format: GameFormat;
  teamName: string;
  setTeamName: (name: string) => void;
  captain: Captain | null;
  setCaptain: (captain: Captain | null) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
}

export default function RosterForm({
  format,
  teamName,
  setTeamName,
  captain,
  setCaptain,
  players,
  setPlayers,
}: RosterFormProps) {
  
  const updateCaptain = (field: keyof Captain, value: string) => {
    if (!captain) {
      const newCaptain: Captain = { name: "", rollNumber: "", contactNumber: "", [field]: value };
      setCaptain(newCaptain);
    } else {
      setCaptain({ ...captain, [field]: value });
    }
  };

  const updatePlayer = (index: number, field: keyof Player, value: string) => {
    const updated = [...players];
    // Ensure player object exists at this index
    if (!updated[index]) {
      updated[index] = { name: "", rollNumber: "" };
    }
    updated[index] = { ...updated[index], [field]: value };
    setPlayers(updated);
  };

  // Generate an array of player indices up to maxPlayers
  const playerSlots = Array.from({ length: format.maxPlayers }, (_, i) => i);

  return (
    <div>
      {format.rosterType === "team" && (
        <div className="reg-form-group">
          <label className="reg-form-label" htmlFor="teamName">Team Name *</label>
          <input
            id="teamName"
            type="text"
            className="reg-form-input"
            placeholder="Enter your team's name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
        </div>
      )}

      {format.rosterType === "team" && format.hasCaptain && (
        <div className="player-block">
          <div className="player-block__header">Captain Details</div>
          <div className="player-block__grid">
            <div>
              <label className="reg-form-label" style={{ fontSize: "0.75rem" }}>Full Name *</label>
              <input
                type="text"
                className="reg-form-input"
                placeholder="Captain's name"
                value={captain?.name || ""}
                onChange={(e) => updateCaptain("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="reg-form-label" style={{ fontSize: "0.75rem" }}>Roll Number *</label>
              <input
                type="text"
                className="reg-form-input"
                placeholder="e.g. 23i-1234"
                value={captain?.rollNumber || ""}
                onChange={(e) => updateCaptain("rollNumber", e.target.value)}
                required
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label className="reg-form-label" style={{ fontSize: "0.75rem" }}>Contact Number *</label>
              <input
                type="tel"
                className="reg-form-input"
                placeholder="0300-1234567"
                value={captain?.contactNumber || ""}
                onChange={(e) => updateCaptain("contactNumber", e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      )}

      {playerSlots.map((index) => {
        const isRequired = index < format.minPlayers;
        const player = players[index] || { name: "", rollNumber: "" };
        
        return (
          <div key={index} className="player-block">
            <div className="player-block__header" style={{ color: isRequired ? "var(--color-white)" : "var(--color-text-muted)" }}>
              {format.rosterType === "individual" 
                ? "Participant Details" 
                : `Player ${index + 1} ${isRequired ? "" : "(Optional)"}`}
            </div>
            
            <div className="player-block__grid">
              <div>
                <label className="reg-form-label" style={{ fontSize: "0.75rem" }}>Full Name {isRequired && "*"}</label>
                <input
                  type="text"
                  className="reg-form-input"
                  placeholder="Player's name"
                  value={player.name}
                  onChange={(e) => updatePlayer(index, "name", e.target.value)}
                  required={isRequired}
                />
              </div>
              <div>
                <label className="reg-form-label" style={{ fontSize: "0.75rem" }}>Roll Number {isRequired && "*"}</label>
                <input
                  type="text"
                  className="reg-form-input"
                  placeholder="e.g. 23i-1234"
                  value={player.rollNumber}
                  onChange={(e) => updatePlayer(index, "rollNumber", e.target.value)}
                  required={isRequired}
                />
              </div>
              
              {/* If individual, we might want their phone number too, even if not captain */}
              {format.rosterType === "individual" && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="reg-form-label" style={{ fontSize: "0.75rem" }}>Contact Number (Optional)</label>
                  <input
                    type="tel"
                    className="reg-form-input"
                    placeholder="0300-1234567"
                    value={player.phone || ""}
                    onChange={(e) => updatePlayer(index, "phone", e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
