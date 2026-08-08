"use client";

import { useState } from "react";
import Link from "next/link";

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

function getScoringConfig(gameName: string) {
  const name = (gameName || "").toLowerCase();
  if (name.includes("cricket")) return { unit: "runs" };
  if (name.includes("futsal") || name.includes("football") || name.includes("soccer")) return { unit: "goals" };
  if (name.includes("badminton") || name.includes("table tennis") || name.includes("tennis")) return { unit: "sets" };
  if (name.includes("basketball") || name.includes("volleyball")) return { unit: "points" };
  return { unit: "score" };
}

export default function TournamentsClient({ initialGames, initialResults }: { initialGames: any[], initialResults: any[] }) {
  // Group games by eventName
  const eventsMap: Record<string, any[]> = {};
  initialGames.forEach(game => {
    const eventName = game.eventName || "Other Tournaments";
    if (!eventsMap[eventName]) eventsMap[eventName] = [];
    eventsMap[eventName].push(game);
  });

  const eventNames = Object.keys(eventsMap).sort();
  
  const [selectedEvent, setSelectedEvent] = useState<string>(eventNames.length > 0 ? eventNames[0] : "");
  const [selectedGameId, setSelectedGameId] = useState<string>("");

  // Auto-select first game when event changes
  if (selectedEvent && !selectedGameId && eventsMap[selectedEvent]?.length > 0) {
    setSelectedGameId(eventsMap[selectedEvent][0].id);
  }

  const handleEventChange = (eventName: string) => {
    setSelectedEvent(eventName);
    if (eventsMap[eventName]?.length > 0) {
      setSelectedGameId(eventsMap[eventName][0].id);
    } else {
      setSelectedGameId("");
    }
  };

  const selectedGame = initialGames.find(g => g.id === selectedGameId);
  const gameResult = initialResults.find(r => r.gameId === selectedGameId);

  return (
    <div style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
      {/* Event Selection Tabs */}
      {eventNames.length > 0 && (
        <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "1rem", borderBottom: "1px solid var(--glass-border)" }}>
          {eventNames.map(eventName => (
            <button
              key={eventName}
              onClick={() => handleEventChange(eventName)}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "30px",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                cursor: "pointer",
                background: selectedEvent === eventName ? "var(--color-primary)" : "var(--glass-bg)",
                color: selectedEvent === eventName ? "#fff" : "var(--color-text)",
                border: selectedEvent === eventName ? "none" : "1px solid var(--glass-border)",
                transition: "all 0.2s"
              }}
            >
              {eventName}
            </button>
          ))}
        </div>
      )}

      {selectedEvent && eventsMap[selectedEvent]?.length > 0 && (
        <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          
          {/* Game Selection Sidebar */}
          <div style={{ flex: "1 1 250px", minWidth: "250px", background: "var(--glass-bg)", borderRadius: "12px", border: "1px solid var(--glass-border)", padding: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem", color: "var(--color-text)", paddingBottom: "0.5rem", borderBottom: "1px solid var(--glass-border)" }}>
              Games
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {eventsMap[selectedEvent].map(game => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGameId(game.id)}
                  style={{
                    textAlign: "left",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: selectedGameId === game.id ? "rgba(138,43,226,0.1)" : "transparent",
                    color: selectedGameId === game.id ? "var(--color-primary-light)" : "var(--color-text)",
                    border: selectedGameId === game.id ? "1px solid var(--color-primary)" : "1px solid transparent",
                    fontWeight: selectedGameId === game.id ? "bold" : "normal",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ fontSize: "1rem" }}>{game.name}</div>
                  <div style={{ fontSize: "0.75rem", opacity: 0.8, marginTop: "2px" }}>{game.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Game Details Area */}
          <div style={{ flex: "3 1 600px", minWidth: "300px" }}>
            {selectedGame ? (
              <GameView game={selectedGame} result={gameResult} />
            ) : (
              <div style={{ padding: "3rem", textAlign: "center", background: "var(--glass-bg)", borderRadius: "12px", color: "var(--color-text-muted)" }}>
                Select a game to view details.
              </div>
            )}
          </div>
        </div>
      )}
      
      {eventNames.length === 0 && (
        <div style={{ padding: "4rem", textAlign: "center", color: "var(--color-text-muted)", background: "var(--glass-bg)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
          No tournaments found.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// Subcomponents for Game View
// ---------------------------------------------------------

function GameView({ game, result }: { game: any, result?: any }) {
  const scoring = getScoringConfig(game.name);
  
  const isLeagueFormat = ["single-round-robin", "double-round-robin", "multi-stage"].includes(game.scheduleType);
  const hasMatches = game.matches && game.matches.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div style={{ background: "var(--glass-bg)", borderRadius: "12px", border: "1px solid var(--glass-border)", padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--color-text)", marginBottom: "0.5rem" }}>
              {game.name}
            </h2>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", padding: "4px 10px", background: "rgba(255,255,255,0.05)", borderRadius: "20px", color: "var(--color-text)" }}>{game.category}</span>
              <span style={{ fontSize: "0.8rem", padding: "4px 10px", background: "rgba(255,255,255,0.05)", borderRadius: "20px", color: "var(--color-text)" }}>{game.venue}</span>
              {game.isActive && <span style={{ fontSize: "0.8rem", padding: "4px 10px", background: "rgba(0, 200, 83, 0.15)", borderRadius: "20px", color: "#00c853", fontWeight: "bold" }}>Registration Open</span>}
            </div>
          </div>
          {game.isActive && (
            <Link href={`/register/${game.id}`} style={{ padding: "0.6rem 1.2rem", background: "var(--color-primary)", color: "white", borderRadius: "8px", fontWeight: "bold", textDecoration: "none" }}>
              Register Now
            </Link>
          )}
        </div>
      </div>

      {/* Hall of Fame Result */}
      {result && (
        <div style={{ background: "linear-gradient(135deg, rgba(138,43,226,0.1), rgba(0,0,0,0))", borderRadius: "12px", border: "1px solid var(--color-primary)", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--color-primary-light)", marginBottom: "1rem" }}>🏆 Tournament Champions</h3>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem" }}>🥇</span>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>1st Place</div>
                <div style={{ fontWeight: "bold", color: "var(--color-text)", fontSize: "1.1rem" }}>{result.firstPlace}</div>
              </div>
            </div>
            {result.secondPlace && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🥈</span>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>2nd Place</div>
                  <div style={{ fontWeight: "bold", color: "var(--color-text)", fontSize: "1.1rem" }}>{result.secondPlace}</div>
                </div>
              </div>
            )}
            {result.thirdPlace && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>🥉</span>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>3rd Place</div>
                  <div style={{ fontWeight: "bold", color: "var(--color-text)", fontSize: "1.1rem" }}>{result.thirdPlace}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Points Table */}
      {hasMatches && isLeagueFormat && (
        <div style={{ background: "var(--glass-bg)", borderRadius: "12px", border: "1px solid var(--glass-border)", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--color-text)", marginBottom: "1rem" }}>Points Table</h3>
          <PublicPointsTable game={game} scoring={scoring} />
        </div>
      )}

      {/* Matches */}
      {hasMatches ? (
        <div style={{ background: "var(--glass-bg)", borderRadius: "12px", border: "1px solid var(--glass-border)", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--color-text)", marginBottom: "1.5rem" }}>Match History</h3>
          <PublicMatches game={game} />
        </div>
      ) : (
        <div style={{ padding: "3rem", textAlign: "center", background: "var(--glass-bg)", borderRadius: "12px", border: "1px solid var(--glass-border)", color: "var(--color-text-muted)" }}>
          Schedule has not been published yet.
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// Helper components for Points Table and Matches
// ---------------------------------------------------------

function PublicPointsTable({ game, scoring }: { game: any, scoring: any }) {
  const groups = Array.from(new Set(game.matches.map((m: any) => m.group_name).filter(Boolean)));
  
  const calcTable = (groupFilter: string | null = null) => {
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

  const forLabel = scoring.unit === "goals" ? "GF" : scoring.unit === "runs" ? "RF" : scoring.unit === "sets" ? "SF" : scoring.unit === "points" ? "PF" : "SF";
  const againstLabel = scoring.unit === "goals" ? "GA" : scoring.unit === "runs" ? "RA" : scoring.unit === "sets" ? "SA" : scoring.unit === "points" ? "PA" : "SA";
  const diffLabel = scoring.unit === "goals" ? "GD" : scoring.unit === "runs" ? "RD" : scoring.unit === "sets" ? "SD" : scoring.unit === "points" ? "PD" : "SD";

  const renderTable = (data: TeamStats[]) => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--glass-border)", color: "var(--color-text-muted)" }}>
            <th style={{ padding: "0.5rem" }}>#</th>
            <th style={{ padding: "0.5rem" }}>Team</th>
            <th style={{ padding: "0.5rem" }}>P</th>
            <th style={{ padding: "0.5rem" }}>W</th>
            <th style={{ padding: "0.5rem" }}>D</th>
            <th style={{ padding: "0.5rem" }}>L</th>
            <th style={{ padding: "0.5rem" }}>{forLabel}</th>
            <th style={{ padding: "0.5rem" }}>{againstLabel}</th>
            <th style={{ padding: "0.5rem" }}>{diffLabel}</th>
            <th style={{ padding: "0.5rem", color: "var(--color-primary-light)" }}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {data.map((team, idx) => (
            <tr key={team.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: "0.5rem" }}>{idx + 1}</td>
              <td style={{ padding: "0.5rem", fontWeight: "bold" }}>{team.name}</td>
              <td style={{ padding: "0.5rem" }}>{team.played}</td>
              <td style={{ padding: "0.5rem" }}>{team.won}</td>
              <td style={{ padding: "0.5rem" }}>{team.drawn}</td>
              <td style={{ padding: "0.5rem" }}>{team.lost}</td>
              <td style={{ padding: "0.5rem" }}>{team.gf}</td>
              <td style={{ padding: "0.5rem" }}>{team.ga}</td>
              <td style={{ padding: "0.5rem" }}>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
              <td style={{ padding: "0.5rem", fontWeight: "bold", color: "var(--color-primary-light)" }}>{team.points}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={10} style={{ padding: "1rem", textAlign: "center", color: "var(--color-text-muted)" }}>No teams available.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (groups.length > 0 && !groups.includes("League")) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {groups.filter((g: any) => g !== "Knockout Phase" && g !== "Knockout").map((g: any) => (
          <div key={g}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "bold", color: "var(--color-primary)", marginBottom: "0.5rem" }}>{g} Standings</h4>
            {renderTable(calcTable(g as string))}
          </div>
        ))}
      </div>
    );
  }

  return renderTable(calcTable());
}

function PublicMatches({ game }: { game: any }) {
  const matchesByRound: Record<number, any[]> = {};
  game.matches.forEach((match: any) => {
    const r = match.round_number || match.round;
    if (!matchesByRound[r]) matchesByRound[r] = [];
    matchesByRound[r].push(match);
  });

  const getRoundLabel = (roundKey: string) => {
    const roundNum = Number(roundKey);
    const matchesInRound = matchesByRound[roundNum];
    if (matchesInRound && matchesInRound.length > 0 && matchesInRound[0].round_label) {
      return matchesInRound[0].round_label;
    }
    return `Round ${roundNum}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {Object.keys(matchesByRound).sort((a, b) => Number(a) - Number(b)).map((round) => (
        <div key={round}>
          <h4 style={{ fontSize: "1rem", fontWeight: "bold", marginBottom: "1rem", color: "var(--color-primary)", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
            {getRoundLabel(round)}
          </h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {matchesByRound[Number(round)].map(match => {
              const mId = match.match_id || match.id;
              const tA = match.team_a_name || match.teamA;
              const tB = match.team_b_name || match.teamB;
              const isBye = tA === "BYE" || tB === "BYE";
              const isCompleted = match.status === "completed";
              
              if (isBye) return null;

              return (
                <div key={mId} style={{ 
                  border: isCompleted ? "1px solid rgba(138,43,226,0.3)" : "1px solid rgba(255,255,255,0.05)", 
                  borderRadius: "10px", 
                  padding: "1rem", 
                  background: isCompleted ? "rgba(138, 43, 226, 0.03)" : "rgba(0,0,0,0.15)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Match {mId}</span>
                    {isCompleted 
                      ? <span style={{ fontSize: "0.65rem", padding: "2px 6px", background: "rgba(138,43,226,0.2)", color: "var(--color-primary-light)", borderRadius: "4px" }}>Completed</span>
                      : <span style={{ fontSize: "0.65rem", padding: "2px 6px", background: "rgba(255,255,255,0.05)", color: "var(--color-text-muted)", borderRadius: "4px" }}>{match.status === "pending" ? "Pending" : "Scheduled"}</span>
                    }
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: match.winner_id === match.team_a_id ? "bold" : "normal", color: match.winner_id === match.team_a_id ? "var(--color-primary-light)" : "var(--color-text)" }}>
                      <span>{tA} {match.winner_id === match.team_a_id && "🏆"}</span>
                      {match.score_a != null && <span>{match.score_a}</span>}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: match.winner_id === match.team_b_id ? "bold" : "normal", color: match.winner_id === match.team_b_id ? "var(--color-primary-light)" : "var(--color-text)" }}>
                      <span>{tB} {match.winner_id === match.team_b_id && "🏆"}</span>
                      {match.score_b != null && <span>{match.score_b}</span>}
                    </div>
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    {match.date ? `${match.date} @ ${match.time}` : "Date TBD"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
