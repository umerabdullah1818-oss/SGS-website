"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface TeamStats {
  id: string;
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  gf: number;
  ga: number;
  gd: number;
}

// Sport-specific scoring config
function getScoringConfig(gameName: string) {
  const name = (gameName || "").toLowerCase();
  if (name.includes("cricket")) {
    return { labelA: "Runs", labelB: "Runs", unit: "runs", step: "1" };
  } else if (name.includes("futsal") || name.includes("football") || name.includes("soccer")) {
    return { labelA: "Goals", labelB: "Goals", unit: "goals", step: "1" };
  } else if (name.includes("badminton") || name.includes("table tennis") || name.includes("tennis")) {
    return { labelA: "Sets Won", labelB: "Sets Won", unit: "sets", step: "1" };
  } else if (name.includes("basketball") || name.includes("volleyball")) {
    return { labelA: "Points", labelB: "Points", unit: "points", step: "1" };
  }
  return { labelA: "Score", labelB: "Score", unit: "score", step: "0.1" };
}

export default function ManageMatchesPage() {
  const params = useParams();
  const gameId = params.id as string;
  const { user } = useAuth();

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  
  const [formWinnerId, setFormWinnerId] = useState("");
  const [formScoreA, setFormScoreA] = useState("");
  const [formScoreB, setFormScoreB] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchGame = async () => {
    try {
      const res = await fetch(`/api/games?id=${gameId}`);
      if (res.ok) {
        const data = await res.json();
        setGame(data.game);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGame(); }, [gameId]);

  const scoring = game ? getScoringConfig(game.name) : getScoringConfig("");

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const mId = activeMatch.match_id || activeMatch.id;
      const res = await fetch(`/api/games/${gameId}/matches`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_datetime", match_id: mId, date: formDate, time: formTime })
      });
      const data = await res.json();
      if (res.ok) {
        setShowScheduleModal(false);
        setSuccessMsg("✅ Schedule updated!");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchGame();
      } else {
        setErrorMsg(data.error || "Failed to update schedule");
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const handleUpdateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    // Client-side score validation
    const numA = parseFloat(formScoreA);
    const numB = parseFloat(formScoreB);
    if (!isNaN(numA) && !isNaN(numB) && formWinnerId !== "DRAW") {
      if (numA > numB && formWinnerId !== activeMatch.team_a_id) {
        setErrorMsg(`${activeMatch.team_a_name} has a higher score (${numA}) but is not selected as the winner.`);
        setSubmitting(false);
        return;
      }
      if (numB > numA && formWinnerId !== activeMatch.team_b_id) {
        setErrorMsg(`${activeMatch.team_b_name} has a higher score (${numB}) but is not selected as the winner.`);
        setSubmitting(false);
        return;
      }
      if (numA === numB && formWinnerId !== "DRAW") {
        setErrorMsg(`Scores are equal (${numA} - ${numB}). Please select Draw or correct the scores.`);
        setSubmitting(false);
        return;
      }
    }

    try {
      const mId = activeMatch.match_id || activeMatch.id;
      const res = await fetch(`/api/games/${gameId}/matches`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_result", match_id: mId, winner_id: formWinnerId, score_a: formScoreA || null, score_b: formScoreB || null })
      });
      const data = await res.json();
      if (res.ok) {
        setShowResultModal(false);
        setSuccessMsg("✅ Result submitted & bracket updated!");
        setTimeout(() => setSuccessMsg(""), 3000);
        fetchGame();
      } else {
        setErrorMsg(data.error || "Failed to update result");
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="admin-card"><div className="loading-spinner"></div></div>;
  if (!game) return <div className="admin-card">Game not found.</div>;
  if (!game.matches || game.matches.length === 0) {
    return (
      <div className="admin-card">
        <h2 style={{ color: "var(--color-text)" }}>No Matches Scheduled</h2>
        <p style={{ color: "var(--color-text-muted)" }}>Please generate a schedule first.</p>
        <Link href={`/admin/games/${gameId}/schedule`} className="admin-btn admin-btn--primary" style={{ marginTop: "1rem", display: "inline-block" }}>
          Go to Schedule Generator
        </Link>
      </div>
    );
  }

  const isAdmin = user?.role === "superadmin";

  // --- Calculate Points Table ---
  const calculatePointsTable = (groupFilter: string | null = null) => {
    const stats: Record<string, TeamStats> = {};
    game.matches.forEach((m: any) => {
      if (groupFilter && m.group_name !== groupFilter) return;
      if (m.team_a_id && m.team_a_id !== "BYE" && m.team_a_id !== "TBD" && !stats[m.team_a_id]) {
        stats[m.team_a_id] = { id: m.team_a_id, name: m.team_a_name, played: 0, won: 0, drawn: 0, lost: 0, points: 0, gf: 0, ga: 0, gd: 0 };
      }
      if (m.team_b_id && m.team_b_id !== "BYE" && m.team_b_id !== "TBD" && !stats[m.team_b_id]) {
        stats[m.team_b_id] = { id: m.team_b_id, name: m.team_b_name, played: 0, won: 0, drawn: 0, lost: 0, points: 0, gf: 0, ga: 0, gd: 0 };
      }
    });
    game.matches.forEach((m: any) => {
      if (groupFilter && m.group_name !== groupFilter) return;
      if (m.status !== "completed") return;
      const tA = m.team_a_id, tB = m.team_b_id;
      const sA = parseFloat(m.score_a) || 0, sB = parseFloat(m.score_b) || 0;
      if (stats[tA] && stats[tB]) {
        stats[tA].played++; stats[tB].played++;
        stats[tA].gf += sA; stats[tA].ga += sB;
        stats[tB].gf += sB; stats[tB].ga += sA;
        if (m.winner_id === tA) { stats[tA].won++; stats[tA].points += 3; stats[tB].lost++; }
        else if (m.winner_id === tB) { stats[tB].won++; stats[tB].points += 3; stats[tA].lost++; }
        else if (m.winner_id === "DRAW") { stats[tA].drawn++; stats[tA].points += 1; stats[tB].drawn++; stats[tB].points += 1; }
      }
    });
    return Object.values(stats).map(s => ({ ...s, gd: s.gf - s.ga })).sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
  };

  const isLeagueFormat = ["single-round-robin", "double-round-robin", "multi-stage"].includes(game.scheduleType);
  const groups = Array.from(new Set(game.matches.map((m: any) => m.group_name).filter(Boolean)));

  // Organize matches by round for rendering
  const matchesByRound: Record<number, any[]> = {};
  game.matches.forEach((match: any) => {
    const r = match.round_number || match.round;
    if (!matchesByRound[r]) matchesByRound[r] = [];
    matchesByRound[r].push(match);
  });

  // Get label for a round
  const getRoundLabel = (roundKey: string) => {
    const roundNum = Number(roundKey);
    const matchesInRound = matchesByRound[roundNum];
    if (matchesInRound && matchesInRound.length > 0 && matchesInRound[0].round_label) {
      return matchesInRound[0].round_label;
    }
    return `Round ${roundNum}`;
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <Link href={`/admin/games`} className="admin-btn admin-btn--secondary" style={{ marginBottom: '1rem' }}>
            &larr; Back to Games
          </Link>
          <h1>Match Management: {game.name}</h1>
          <p>Schedule match dates/times and record results. {game.eventName && <span>Event: <strong>{game.eventName}</strong></span>}</p>
        </div>
      </div>

      {isLeagueFormat && (
        <div className="admin-card" style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem", color: "var(--color-text)" }}>
            Points Table {game.eventName && `— ${game.eventName}`}
          </h2>
          {groups.length > 0 && !groups.includes("League") ? (
             groups.filter((g: any) => g !== "Knockout Phase" && g !== "Knockout").map((g: any) => (
               <div key={g} style={{ marginBottom: "2rem" }}>
                 <h3 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem", color: "var(--color-primary)" }}>{g} Standings</h3>
                 <PointsTable data={calculatePointsTable(g as string)} scoring={scoring} />
               </div>
             ))
          ) : (
            <PointsTable data={calculatePointsTable()} scoring={scoring} />
          )}
        </div>
      )}

      <div className="admin-card">
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1.5rem", color: "var(--color-text)" }}>
          Tournament Matches
        </h2>
        
        {Object.keys(matchesByRound).sort((a, b) => Number(a) - Number(b)).map((round) => (
          <div key={round} style={{ marginBottom: "2.5rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem", color: "var(--color-primary)", borderBottom: "2px solid var(--glass-border)", paddingBottom: "0.5rem" }}>
              {getRoundLabel(round)}
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
              {matchesByRound[Number(round)].map(match => {
                const mId = match.match_id || match.id;
                const tA = match.team_a_name || match.teamA;
                const tB = match.team_b_name || match.teamB;
                const isTBD = tA === "TBD" || tB === "TBD";
                const isBye = tA === "BYE" || tB === "BYE";
                const isCompleted = match.status === "completed";
                
                if (isBye) return null;

                const canSetSchedule = !isTBD && (!match.date || isAdmin);
                const canSetResult = !isTBD && !isCompleted;

                return (
                  <div key={mId} style={{ 
                    border: isCompleted ? "1px solid var(--color-primary)" : "1px solid var(--glass-border)", 
                    borderRadius: "12px", 
                    padding: "1.25rem", 
                    background: isCompleted ? "rgba(138, 43, 226, 0.05)" : "var(--glass-bg)",
                    position: "relative"
                  }}>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                        Match {mId}
                      </span>
                      <div style={{ display: "flex", gap: "0.3rem" }}>
                        {match.group_name && match.group_name !== "Knockout" && (
                          <span style={{ fontSize: "0.65rem", padding: "2px 6px", background: "var(--color-primary-glow)", color: "var(--color-primary)", borderRadius: "4px", fontWeight: "bold" }}>{match.group_name}</span>
                        )}
                        {isCompleted 
                          ? <span style={{ fontSize: "0.65rem", padding: "2px 6px", background: "var(--color-primary)", color: "white", borderRadius: "4px", fontWeight: "bold" }}>Completed</span>
                          : <span style={{ fontSize: "0.65rem", padding: "2px 6px", background: "rgba(255,200,0,0.15)", color: "#e6a700", borderRadius: "4px", fontWeight: "bold" }}>{match.status === "pending" ? "Pending" : "Scheduled"}</span>
                        }
                      </div>
                    </div>

                    {/* Teams & Scores */}
                    <div style={{ marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", borderRadius: "6px", marginBottom: "2px", background: match.winner_id === match.team_a_id ? "rgba(138,43,226,0.08)" : "transparent", fontWeight: match.winner_id === match.team_a_id ? "bold" : "normal", color: match.winner_id === match.team_a_id ? "var(--color-primary-light)" : tA === "TBD" ? "var(--color-text-muted)" : "var(--color-text)" }}>
                        <span>{tA} {match.winner_id === match.team_a_id && "🏆"}</span>
                        {match.score_a != null && <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{match.score_a}</span>}
                      </div>
                      <div style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--color-text-muted)", padding: "2px 0" }}>VS</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", borderRadius: "6px", background: match.winner_id === match.team_b_id ? "rgba(138,43,226,0.08)" : "transparent", fontWeight: match.winner_id === match.team_b_id ? "bold" : "normal", color: match.winner_id === match.team_b_id ? "var(--color-primary-light)" : tB === "TBD" ? "var(--color-text-muted)" : "var(--color-text)" }}>
                        <span>{tB} {match.winner_id === match.team_b_id && "🏆"}</span>
                        {match.score_b != null && <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{match.score_b}</span>}
                      </div>
                    </div>

                    {/* Date/Time */}
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
                      📅 {match.date ? `${match.date} @ ${match.time}` : "Not scheduled yet"}
                    </div>

                    {/* Next match info */}
                    {match.next_match_id && (
                      <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>
                        Winner → Match {match.next_match_id}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {canSetSchedule && (
                        <button 
                          className="admin-btn admin-btn--secondary admin-btn--sm" 
                          style={{ flex: 1 }}
                          onClick={() => {
                            setActiveMatch(match);
                            setFormDate(match.date || "");
                            setFormTime(match.time || "");
                            setErrorMsg("");
                            setShowScheduleModal(true);
                          }}
                        >
                          {match.date ? "Edit Schedule" : "Set Schedule"}
                        </button>
                      )}
                      {canSetResult && (
                        <button 
                          className="admin-btn admin-btn--primary admin-btn--sm" 
                          style={{ flex: 1 }}
                          onClick={() => {
                            setActiveMatch(match);
                            setFormWinnerId("");
                            setFormScoreA("");
                            setFormScoreB("");
                            setErrorMsg("");
                            setShowResultModal(true);
                          }}
                        >
                          Set Result
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ width: "400px" }}>
            <h3 className="admin-modal__title" style={{ marginBottom: "1.5rem" }}>
              Schedule Match {activeMatch?.match_id || activeMatch?.id}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              {activeMatch?.team_a_name} vs {activeMatch?.team_b_name}
            </p>
            <form onSubmit={handleUpdateSchedule}>
              <div className="admin-form-group" style={{ marginBottom: "1rem" }}>
                <label className="admin-form-label">Date</label>
                <input type="date" className="admin-form-input" value={formDate} onChange={e => setFormDate(e.target.value)} required />
              </div>
              <div className="admin-form-group" style={{ marginBottom: "1rem" }}>
                <label className="admin-form-label">Time</label>
                <input type="time" className="admin-form-input" value={formTime} onChange={e => setFormTime(e.target.value)} required />
              </div>
              {errorMsg && <div style={{ color: "#ff6b6b", fontSize: "0.85rem", marginBottom: "1rem" }}>{errorMsg}</div>}
              <div className="admin-modal__actions" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => { setShowScheduleModal(false); setErrorMsg(""); }}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>{submitting ? "Saving..." : "Save Schedule"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ width: "480px" }}>
            <h3 className="admin-modal__title" style={{ marginBottom: "0.5rem" }}>
              Submit Result — Match {activeMatch?.match_id || activeMatch?.id}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
              {activeMatch?.team_a_name} vs {activeMatch?.team_b_name}
            </p>
            <form onSubmit={handleUpdateResult}>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label className="admin-form-label">{activeMatch?.team_a_name} — {scoring.labelA}</label>
                  <input type="number" step={scoring.step} min="0" className="admin-form-input" value={formScoreA} onChange={e => setFormScoreA(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="admin-form-label">{activeMatch?.team_b_name} — {scoring.labelB}</label>
                  <input type="number" step={scoring.step} min="0" className="admin-form-input" value={formScoreB} onChange={e => setFormScoreB(e.target.value)} required />
                </div>
              </div>
              <div className="admin-form-group" style={{ marginBottom: "1rem" }}>
                <label className="admin-form-label">Winner</label>
                <select className="admin-form-select" style={{ width: "100%" }} value={formWinnerId} onChange={e => setFormWinnerId(e.target.value)} required>
                  <option value="" disabled>Select Winner...</option>
                  <option value={activeMatch?.team_a_id}>{activeMatch?.team_a_name}</option>
                  <option value={activeMatch?.team_b_id}>{activeMatch?.team_b_name}</option>
                  <option value="DRAW">Draw / Tie</option>
                </select>
              </div>
              {errorMsg && <div style={{ color: "#ff6b6b", fontSize: "0.85rem", marginBottom: "1rem", padding: "0.5rem", background: "rgba(255,107,107,0.08)", borderRadius: "6px" }}>{errorMsg}</div>}
              <div className="admin-modal__actions" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="admin-btn admin-btn--secondary" onClick={() => { setShowResultModal(false); setErrorMsg(""); }}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>{submitting ? "Submitting..." : "Submit Result"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {successMsg && (
        <div style={{
          position: "fixed", bottom: "2rem", right: "2rem",
          background: "var(--color-primary)", color: "white",
          padding: "1rem 1.5rem", borderRadius: "12px", fontWeight: 600,
          boxShadow: "0 10px 30px rgba(138, 43, 226, 0.4)", zIndex: 9999,
          animation: "fadeInUp 0.3s ease"
        }}>{successMsg}</div>
      )}
    </>
  );
}

// Points Table Component with sport-specific column headers
function PointsTable({ data, scoring }: { data: TeamStats[]; scoring: { unit: string } }) {
  if (data.length === 0) return <p style={{ color: "var(--color-text-muted)" }}>No standings available yet. Submit match results to see the table.</p>;
  
  const forLabel = scoring.unit === "goals" ? "GF" : scoring.unit === "runs" ? "RF" : scoring.unit === "sets" ? "SF" : scoring.unit === "points" ? "PF" : "SF";
  const againstLabel = scoring.unit === "goals" ? "GA" : scoring.unit === "runs" ? "RA" : scoring.unit === "sets" ? "SA" : scoring.unit === "points" ? "PA" : "SA";
  const diffLabel = scoring.unit === "goals" ? "GD" : scoring.unit === "runs" ? "RD" : scoring.unit === "sets" ? "SD" : scoring.unit === "points" ? "PD" : "SD";

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>{forLabel}</th>
            <th>{againstLabel}</th>
            <th>{diffLabel}</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {data.map((team, idx) => (
            <tr key={team.id}>
              <td>{idx + 1}</td>
              <td style={{ fontWeight: "bold" }}>{team.name}</td>
              <td>{team.played}</td>
              <td>{team.won}</td>
              <td>{team.drawn}</td>
              <td>{team.lost}</td>
              <td>{team.gf}</td>
              <td>{team.ga}</td>
              <td>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
              <td style={{ fontWeight: "bold", color: "var(--color-primary-light)" }}>{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
