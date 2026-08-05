"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Registration, Game } from "@/types";

export default function PrintRegistrationsPage() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId");
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [games, setGames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch games for mapping ID to Name
        const gamesRes = await fetch("/api/games?all=true");
        const gamesData = await gamesRes.json();
        const gamesMap: Record<string, string> = {};
        gamesData.games.forEach((g: Game) => {
          gamesMap[g.id!] = g.name;
        });
        setGames(gamesMap);

        // Fetch verified registrations only
        const url = gameId && gameId !== "all" 
          ? `/api/registrations/all?gameId=${gameId}` 
          : `/api/registrations/all`;
        
        const regsRes = await fetch(url);
        const regsData = await regsRes.json();
        
        // Filter out non-verified and sort by game -> format -> name
        const verified = (regsData.registrations || [])
          .filter((r: Registration) => r.status === "verified")
          .sort((a: Registration, b: Registration) => {
            if (a.gameNameSnapshot !== b.gameNameSnapshot) {
              return a.gameNameSnapshot.localeCompare(b.gameNameSnapshot);
            }
            if (a.formatName !== b.formatName) {
              return a.formatName.localeCompare(b.formatName);
            }
            const aName = a.teamName || a.captain?.name || a.players[0]?.name || "";
            const bName = b.teamName || b.captain?.name || b.players[0]?.name || "";
            return aName.localeCompare(bName);
          });
          
        setRegistrations(verified);
      } catch (err) {
        console.error("Failed to load data for printing", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [gameId]);

  if (loading) {
    return <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>Preparing print view...</div>;
  }

  // Group by Game Name
  const groupedByGame = registrations.reduce((acc, reg) => {
    if (!acc[reg.gameNameSnapshot]) acc[reg.gameNameSnapshot] = [];
    acc[reg.gameNameSnapshot].push(reg);
    return acc;
  }, {} as Record<string, Registration[]>);

  return (
    <div style={{ 
      background: "white", 
      color: "black", 
      minHeight: "100vh", 
      padding: "2rem",
      fontFamily: "Arial, sans-serif" 
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f0f0f0; font-weight: bold; }
        }
        /* Screen styles */
        table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 14px; }
        th { background-color: #f0f0f0; font-weight: bold; }
      `}} />

      <div className="no-print" style={{ marginBottom: "2rem", padding: "1rem", background: "#f8f9fa", border: "1px solid #dee2e6", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: "0 0 0.5rem 0" }}>Print Verified Registrations</h2>
          <p style={{ margin: 0, color: "#6c757d", fontSize: "14px" }}>
            This view only shows VERIFIED registrations, optimized for printing. Use Ctrl+P or Cmd+P to print.
          </p>
        </div>
        <button 
          onClick={() => window.print()}
          style={{ background: "#0d6efd", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
        >
          Print Document
        </button>
      </div>

      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ margin: "0 0 0.5rem 0", textTransform: "uppercase", letterSpacing: "1px" }}>Sports Guild Society</h1>
        <h2 style={{ margin: 0, fontWeight: "normal", color: "#444" }}>Verified Registrations Roster</h2>
        <div style={{ marginTop: "1rem", fontSize: "14px", color: "#666" }}>
          Generated on: {new Date().toLocaleString()}
        </div>
      </div>

      {Object.keys(groupedByGame).length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", border: "1px dashed #ccc" }}>
          No verified registrations found.
        </div>
      ) : (
        Object.entries(groupedByGame).map(([gameName, regs], index) => {
          // Group by format within game
          const groupedByFormat = regs.reduce((acc, reg) => {
            if (!acc[reg.formatName]) acc[reg.formatName] = [];
            acc[reg.formatName].push(reg);
            return acc;
          }, {} as Record<string, Registration[]>);

          return (
            <div key={gameName} className={index > 0 ? "page-break" : ""}>
              <h2 style={{ borderBottom: "2px solid black", paddingBottom: "8px", marginBottom: "24px" }}>
                {gameName} <span style={{ fontWeight: "normal", fontSize: "16px", color: "#666" }}>({regs.length} total)</span>
              </h2>

              {Object.entries(groupedByFormat).map(([formatName, formatRegs]) => (
                <div key={formatName} style={{ marginBottom: "2rem" }}>
                  <h3 style={{ background: "#e9ecef", padding: "6px 12px", margin: "0 0 12px 0", fontSize: "16px" }}>
                    Format: {formatName} ({formatRegs.length})
                  </h3>
                  
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: "5%" }}>#</th>
                        <th style={{ width: "25%" }}>Team / Participant</th>
                        <th style={{ width: "25%" }}>Captain details</th>
                        <th style={{ width: "45%" }}>Roster</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formatRegs.map((reg, i) => (
                        <tr key={reg.id}>
                          <td>{i + 1}</td>
                          <td>
                            <strong>{reg.teamName || reg.players[0]?.name || "N/A"}</strong>
                          </td>
                          <td>
                            {reg.captain ? (
                              <div>
                                <div>{reg.captain.name}</div>
                                <div style={{ fontSize: "11px", color: "#666" }}>{reg.captain.rollNumber} | {reg.captain.contactNumber}</div>
                              </div>
                            ) : (
                              <span style={{ color: "#999", fontStyle: "italic" }}>Individual event</span>
                            )}
                          </td>
                          <td>
                            <ul style={{ margin: 0, paddingLeft: "16px" }}>
                              {reg.players.map((p, pi) => (
                                <li key={pi}>
                                  {p.name} <span style={{ color: "#666", fontSize: "11px" }}>({p.rollNumber})</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
