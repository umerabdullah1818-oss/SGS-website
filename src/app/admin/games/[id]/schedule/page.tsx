"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function GameSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string;
  const { user } = useAuth();
  
  const [game, setGame] = useState<any>(null);
  const [scheduleType, setScheduleType] = useState<string>("single-knockout");
  const [numGroups, setNumGroups] = useState<number>(2);
  const [teamsAdvancing, setTeamsAdvancing] = useState<number>(2);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function fetchGame() {
      try {
        const res = await fetch(`/api/games?id=${gameId}`);
        if (res.ok) {
          const data = await res.json();
          setGame(data.game);
          if (data.game.scheduleType) {
            setScheduleType(data.game.scheduleType);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGame();
  }, [gameId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/games/${gameId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleType, numGroups, teamsAdvancing })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate schedule");
      }
      
      setGame((prev: any) => ({ ...prev, scheduleType, matches: data.matches }));
      setSuccessMsg("✅ Schedule generated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="admin-card"><div className="loading-spinner"></div></div>;
  }

  if (!game) {
    return <div className="admin-card">Game not found.</div>;
  }

  // Organize matches by round if they exist
  const matchesByRound: Record<number, any[]> = {};
  if (game.matches && game.matches.length > 0) {
    game.matches.forEach((match: any) => {
      const r = match.round_number || match.round; // Handle old vs new format
      if (!matchesByRound[r]) matchesByRound[r] = [];
      matchesByRound[r].push(match);
    });
  }

  const formatTypeName = (type: string) => {
    switch(type) {
      case "single-knockout": return "Single Knockout";
      case "single-round-robin": return "Single Round-Robin";
      case "double-round-robin": return "Double Round-Robin";
      case "multi-stage": return "Multi-Stage";
      default: return type;
    }
  };

  return (
    <>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link href="/admin/games" className="admin-btn admin-btn--secondary" style={{ marginBottom: '1rem' }}>
            &larr; Back to Games
          </Link>
          <h1>Schedule: {game.name}</h1>
          <p>Manage the tournament bracket and matches for this game.</p>
        </div>
        {game.matches && game.matches.length > 0 && (
          <Link href={`/admin/games/${game.id}/matches`} className="admin-btn admin-btn--primary">
            Manage Matches &rarr;
          </Link>
        )}
      </div>

      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem", color: "var(--color-text)" }}>Schedule Generation</h2>
        
        {game.isActive && (
          <div style={{ padding: "1rem", background: "rgba(255, 200, 0, 0.1)", border: "1px solid rgba(255, 200, 0, 0.2)", borderRadius: "8px", marginBottom: "1.5rem", color: "var(--color-text)" }}>
            <strong>Note:</strong> Registration is currently open for this game. It is recommended to close registration before generating a schedule.
          </div>
        )}
        
        {game.matches && game.matches.length > 0 ? (
          <div>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              A <strong>{formatTypeName(game.scheduleType)}</strong> schedule has already been generated for this game. Generating a new schedule will overwrite the current one.
            </p>
          </div>
        ) : null}

        <div className="admin-form-row" style={{ alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label className="admin-form-label">Schedule Type</label>
            <select 
              className="admin-form-input" 
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", color: "var(--color-text)" }}
            >
              <option value="single-knockout">Single Knockout</option>
              <option value="single-round-robin">Single Round-Robin</option>
              <option value="double-round-robin">Double Round-Robin</option>
              <option value="multi-stage">Multi-Stage (Groups + Knockout)</option>
            </select>
          </div>
          
          {scheduleType === "multi-stage" && (
            <>
              <div style={{ width: "120px" }}>
                <label className="admin-form-label">Groups</label>
                <input 
                  type="number"
                  min="1"
                  className="admin-form-input"
                  value={numGroups}
                  onChange={(e) => setNumGroups(parseInt(e.target.value))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", color: "var(--color-text)" }}
                />
              </div>
              <div style={{ width: "140px" }}>
                <label className="admin-form-label">Advancing/Grp</label>
                <input 
                  type="number"
                  min="1"
                  className="admin-form-input"
                  value={teamsAdvancing}
                  onChange={(e) => setTeamsAdvancing(parseInt(e.target.value))}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid var(--glass-border)", background: "var(--glass-bg)", color: "var(--color-text)" }}
                />
              </div>
            </>
          )}

          <div>
            <button 
              className="admin-btn admin-btn--primary" 
              onClick={handleGenerate}
              disabled={generating}
              style={{ padding: "0.75rem 1.5rem" }}
            >
              {generating ? "Generating..." : "Generate Schedule"}
            </button>
          </div>
        </div>
        
        {error && (
          <div style={{ marginTop: "1rem", color: "#ff6b6b", fontSize: "0.9rem" }}>
            {error}
          </div>
        )}
      </div>

      {game.matches && game.matches.length > 0 && (
        <div className="admin-card">
          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem", color: "var(--color-text)", textTransform: "uppercase" }}>
            Tournament Matches ({formatTypeName(game.scheduleType)})
          </h2>
          
          {Object.keys(matchesByRound).sort((a, b) => Number(a) - Number(b)).map((round) => (
            <div key={round} style={{ marginBottom: "2rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "1rem", color: "var(--color-primary)", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.5rem" }}>
                {matchesByRound[Number(round)][0]?.round_label || `Round ${round}`}
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {matchesByRound[Number(round)].map(match => {
                  const mId = match.match_id || match.id;
                  const tA = match.team_a_name || match.teamA;
                  const tB = match.team_b_name || match.teamB;
                  const gName = match.group_name || null;
                  const nextId = match.next_match_id || null;

                  return (
                    <div key={mId} style={{ border: "1px solid var(--glass-border)", borderRadius: "8px", padding: "1rem", background: "var(--glass-bg)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold" }}>Match {mId}</span>
                        {gName && <span style={{ fontSize: "0.7rem", padding: "2px 6px", background: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "4px", fontWeight: "bold" }}>{gName}</span>}
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", background: "rgba(0,0,0,0.02)", borderRadius: "6px", marginBottom: "0.5rem", border: "1px solid rgba(0,0,0,0.04)" }}>
                        <span style={{ fontWeight: tA !== "TBD" && tA !== "BYE" ? "bold" : "normal", color: tA === "TBD" ? "var(--color-text-muted)" : "var(--color-text)" }}>{tA}</span>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "center", color: "var(--color-text-muted)", fontSize: "0.8rem", margin: "0.25rem 0" }}>VS</div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem", background: "rgba(0,0,0,0.02)", borderRadius: "6px", marginBottom: "0.5rem", border: "1px solid rgba(0,0,0,0.04)" }}>
                        <span style={{ fontWeight: tB !== "TBD" && tB !== "BYE" ? "bold" : "normal", color: tB === "TBD" ? "var(--color-text-muted)" : "var(--color-text)" }}>{tB}</span>
                      </div>

                      {nextId && (
                        <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.75rem", textAlign: "right" }}>
                          Winner advances to Match {nextId} &rarr;
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {successMsg && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "var(--color-primary)",
          color: "white",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: "0.95rem",
          boxShadow: "0 10px 30px rgba(138, 43, 226, 0.4)",
          zIndex: 9999,
          animation: "fadeInUp 0.3s ease"
        }}>
          {successMsg}
        </div>
      )}
    </>
  );
}
