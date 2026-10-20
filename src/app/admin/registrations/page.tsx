"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import type { Registration, Game } from "@/types";

export default function AdminRegistrationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGameId, setFilterGameId] = useState<string>("all");
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      const url = filterGameId === "all" 
        ? "/api/registrations/all" 
        : `/api/registrations/all?gameId=${filterGameId}`;
      const res = await fetch(url);
      const data = await res.json();
      setRegistrations(data.registrations || []);
    } catch {
      console.error("Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch("/api/games?all=true");
        const data = await res.json();
        setGames(data.games || []);
      } catch {
        console.error("Failed to fetch games");
      }
    }
    fetchGames();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRegistrations();
  }, [filterGameId]);

  const updateStatus = async (id: string, status: "pending" | "verified" | "rejected") => {
    try {
      await fetch(`/api/registrations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchRegistrations();
      if (selectedReg && selectedReg.id === id) {
        setSelectedReg({ ...selectedReg, status });
      }
      const label = status === "verified" ? "✅ Payment Verified!" : status === "rejected" ? "❌ Registration Rejected" : "⏳ Marked as Pending";
      setSuccessMsg(label);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      alert("Failed to update status");
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!confirm("Are you sure you want to delete this registration?")) return;
    try {
      await fetch(`/api/registrations/${id}`, { method: "DELETE" });
      setSelectedReg(null);
      fetchRegistrations();
    } catch {
      alert("Failed to delete registration");
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Registrations</h1>
          <p>Review player registrations, verify payments, and manage rosters.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <select 
            className="admin-form-select" 
            style={{ width: "200px" }}
            value={filterGameId}
            onChange={(e) => setFilterGameId(e.target.value)}
          >
            <option value="all">All Games</option>
            {games.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          
          <button 
            className="admin-btn admin-btn--secondary"
            onClick={() => window.open(`/admin/registrations/print?gameId=${filterGameId}`, "_blank")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print View
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-empty">
          <p>Loading registrations…</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="admin-empty">
          <h3 className="admin-empty__title">No registrations found</h3>
          <p className="admin-empty__description">
            {filterGameId === "all" ? "Nobody has registered for any games yet." : "No registrations for this specific game."}
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Game / Format</th>
                <th>Participant / Team</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => {
                const date = new Date(reg.createdAt).toLocaleDateString("en-PK", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                });
                
                const name = reg.teamName || (reg.captain?.name) || (reg.players[0]?.name) || "Unknown";
                const badgeColor = 
                  reg.status === "verified" ? "admin-badge--active" :
                  reg.status === "rejected" ? "admin-badge--inactive" : "admin-badge--warning";

                return (
                  <tr key={reg.id}>
                    <td style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>{date}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--color-text)" }}>{reg.gameNameSnapshot}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>{reg.formatName}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--color-text)" }}>{name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                        {reg.teamName ? `${reg.players.length} players` : reg.players[0]?.rollNumber}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--color-primary-light)" }}>
                      Rs. {reg.feeSnapshot}
                    </td>
                    <td>
                      <span className={`admin-badge ${badgeColor}`}>
                        {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-btn admin-btn--secondary admin-btn--sm"
                        onClick={() => setSelectedReg(reg)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selectedReg && (
        <div className="admin-modal-overlay" onClick={() => setSelectedReg(null)}>
          <div className="admin-modal" style={{ maxWidth: "800px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 className="admin-modal__title" style={{ margin: 0 }}>Review Registration</h2>
              <button className="admin-btn admin-btn--icon" onClick={() => setSelectedReg(null)}>✕</button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              {/* Left Column: Details */}
              <div>
                <h3 style={{ fontSize: "1rem", color: "var(--color-primary-light)", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
                  {selectedReg.gameNameSnapshot} - {selectedReg.formatName}
                </h3>
                
                {selectedReg.teamName && (
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Team Name</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{selectedReg.teamName}</div>
                  </div>
                )}
                
                {selectedReg.captain && (
                  <div style={{ marginBottom: "1rem", background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: 600, marginBottom: "0.5rem" }}>Captain</div>
                    <div>{selectedReg.captain.name} ({selectedReg.captain.rollNumber})</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>{selectedReg.captain.contactNumber}</div>
                  </div>
                )}
                
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Roster</div>
                  <ul style={{ paddingLeft: "1.5rem", fontSize: "0.9rem" }}>
                    {selectedReg.players.map((p, i) => (
                      <li key={i} style={{ marginBottom: "0.25rem" }}>
                        {p.name} <span style={{ color: "var(--color-text-muted)" }}>({p.rollNumber})</span>
                        {p.phone && <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}> - {p.phone}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {selectedReg.extraAnswers && Object.keys(selectedReg.extraAnswers).length > 0 && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Custom Questions</div>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", fontSize: "0.9rem" }}>
                      {Object.entries(selectedReg.extraAnswers).map(([key, val]) => (
                        <div key={key} style={{ marginBottom: "0.5rem" }}>
                          <span style={{ color: "var(--color-text-muted)" }}>{key}: </span>
                          <span style={{ fontWeight: 500 }}>{val as string}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column: Payment */}
              <div>
                <h3 style={{ fontSize: "1rem", color: "var(--color-primary)", marginBottom: "1rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.5rem" }}>
                  Payment Details
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Amount</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-text)" }}>Rs. {selectedReg.payment.amountTransferred}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Status</div>
                    <div style={{ marginTop: "0.25rem" }}>
                      <span className={`admin-badge ${
                        selectedReg.status === "verified" ? "admin-badge--active" :
                        selectedReg.status === "rejected" ? "admin-badge--inactive" : "admin-badge--warning"
                      }`}>
                        {selectedReg.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Source: </span>
                  {selectedReg.payment.source}
                </div>
                <div style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>TID: </span>
                  <span style={{ fontFamily: "monospace", background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                    {selectedReg.payment.transactionId}
                  </span>
                </div>
                <div style={{ marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Date: </span>
                  {selectedReg.payment.dateOfTransaction}
                </div>
                
                {selectedReg.payment.screenshotUrl ? (
                  <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", overflow: "hidden", height: "250px", background: "rgba(0,0,0,0.5)" }}>
                    <a href={selectedReg.payment.screenshotUrl} target="_blank" rel="noreferrer" style={{ display: "block", height: "100%", textDecoration: "none" }}>
                      <img 
                        src={selectedReg.payment.screenshotUrl} 
                        alt="Payment Screenshot" 
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    </a>
                  </div>
                ) : (
                  <div style={{ padding: "2rem", textAlign: "center", background: "rgba(255,255,255,0.05)", borderRadius: "8px", color: "var(--color-text-muted)" }}>
                    No screenshot provided
                  </div>
                )}
              </div>
            </div>
            
            <div className="admin-modal__actions" style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid var(--glass-border)" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(user?.role === "superadmin" || user?.permissions?.includes("manage_registrations")) && (
                  <button 
                    className="admin-btn admin-btn--danger"
                    onClick={() => deleteRegistration(selectedReg.id!)}
                  >
                    Delete
                  </button>
                )}
              </div>
              
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {(user?.role === "superadmin" || user?.permissions?.includes("verify_payment")) && (
                  <>
                    <button 
                      className="admin-btn admin-btn--secondary"
                      onClick={() => updateStatus(selectedReg.id!, "rejected")}
                      disabled={selectedReg.status === "rejected"}
                    >
                      {selectedReg.status === "rejected" ? "Rejected ✗" : "Reject"}
                    </button>
                    <button 
                      className="admin-btn admin-btn--secondary"
                      onClick={() => updateStatus(selectedReg.id!, "pending")}
                      disabled={selectedReg.status === "pending"}
                    >
                      Mark Pending
                    </button>
                    <button 
                      className="admin-btn"
                      style={{ background: selectedReg.status === "verified" ? "#059669" : "#00c864", color: "white" }}
                      onClick={() => updateStatus(selectedReg.id!, "verified")}
                      disabled={selectedReg.status === "verified"}
                    >
                      {selectedReg.status === "verified" ? "✓ Verified" : "Verify Payment"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
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
